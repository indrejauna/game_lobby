import { 
    ref, 
    push, 
    get, 
    update, 
    query, 
    orderByChild,
    equalTo,
    onValue,
    off,
    runTransaction,
    onDisconnect,
    set
  } from 'firebase/database';
  import { auth, database } from '../firebase';
  import { GAME_TYPES, GAME_FORMATS, GAME_STATUS, GAME_TIMEOUT } from '../constants/game';
  import gtTokenService from './gtTokenService';
  
  class MultiplayerService {
    constructor() {
      this.database = database;
      this.gamesRef = ref(database, 'games');
      this.lastCleanup = Date.now();
      this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
      this.activeSubscriptions = new Set();
      this.setupPresence();
      console.log('MultiplayerService initialized');
    }
  
    setupPresence() {
      const connectedRef = ref(this.database, '.info/connected');
      
      onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          console.log('Connected to Firebase');
          
          if (auth.currentUser) {
            const userStatusRef = ref(this.database, `status/${auth.currentUser.uid}`);
            onDisconnect(userStatusRef).set('offline');
            set(userStatusRef, 'online');
          }
        } else {
          console.log('Disconnected from Firebase');
        }
      });
    }
  
    subscribeToActiveGames(callback) {
      console.log('Setting up active games subscription');
      const activeGamesQuery = query(
        this.gamesRef,
        orderByChild('status'),
        equalTo(GAME_STATUS.WAITING)
      );
  
      const handleSnapshot = (snapshot) => {
        try {
          console.log('Received games snapshot update');
          if (!snapshot.exists()) {
            console.log('No active games found');
            callback([]);
            return;
          }
  
          const games = Object.entries(snapshot.val())
            .map(([id, game]) => ({
              ...game,
              id
            }))
            .filter(game => {
              const createdTime = new Date(game.createdAt).getTime();
              return Date.now() - createdTime <= GAME_TIMEOUT;
            })
            .sort((a, b) => b.createdAt - a.createdAt);
  
          console.log(`Found ${games.length} active games`);
          callback(games);
        } catch (error) {
          console.error('Error processing games snapshot:', error);
          callback([]);
        }
      };
  
      onValue(activeGamesQuery, handleSnapshot);
      return () => off(activeGamesQuery);
    }
  
    async createGame({ type, format, stake, creator }) {
      if (!auth.currentUser) {
        throw new Error('Authentication required');
      }
  
      console.log('Creating new game:', { type, format, stake, creator });
      
      if (!creator) {
        throw new Error('Creator ID is required');
      }
  
      if (!Object.values(GAME_TYPES).find(t => t.id === type)) {
        throw new Error('Invalid game type');
      }
  
      if (!Object.values(GAME_FORMATS).find(f => f.rounds === format)) {
        throw new Error('Invalid game format');
      }
  
      const creatorGamesQuery = query(
        this.gamesRef,
        orderByChild('creator'),
        equalTo(creator)
      );
  
      const existingGames = await get(creatorGamesQuery);
      if (existingGames.exists()) {
        const hasActiveGame = Object.values(existingGames.val()).some(
          game => game.status === GAME_STATUS.WAITING
        );
        if (hasActiveGame) {
          throw new Error('You already have an active game');
        }
      }
  
      const newGameRef = push(this.gamesRef);
      const gameId = newGameRef.key;
  
      try {
        await gtTokenService.stakeForGame(creator, gameId, stake);
  
        const gameData = {
          type,
          format,
          stake,
          creator,
          players: {
            [creator]: {
              joined: Date.now(),
              confirmed: true,
              ready: true
            }
          },
          status: GAME_STATUS.WAITING,
          createdAt: Date.now(),
          lastUpdated: Date.now(),
          currentRound: 0,
          maxPlayers: 2,
          winner: null,
          moves: {},
          chat: {},
          settings: {
            timeLimit: 300,
            autoComplete: true
          }
        };
  
        await set(newGameRef, gameData);
        await this.checkAndCleanupExpiredGames();
        return { ...gameData, id: gameId };
      } catch (error) {
        console.error('Failed to create game:', error);
        try {
          await gtTokenService.returnStake(creator, gameId);
        } catch (refundError) {
          console.error('Failed to return stakes:', refundError);
        }
        throw error;
      }
    }
  
    async joinGame(gameId, playerId) {
      if (!auth.currentUser) {
        throw new Error('Authentication required');
      }
  
      console.log('Joining game:', { gameId, playerId });
      const gameRef = ref(this.database, `games/${gameId}`);
  
      try {
        return await runTransaction(gameRef, async (currentData) => {
          if (!currentData) {
            throw new Error('Game not found');
          }
  
          if (currentData.status !== GAME_STATUS.WAITING) {
            throw new Error('Game is no longer available');
          }
  
          if (currentData.creator === playerId) {
            throw new Error('Cannot join your own game');
          }
  
          const playerCount = Object.keys(currentData.players || {}).length;
          if (playerCount >= currentData.maxPlayers) {
            throw new Error('Game is full');
          }
  
          const createdTime = new Date(currentData.createdAt).getTime();
          if (Date.now() - createdTime > GAME_TIMEOUT) {
            throw new Error('Game has expired');
          }
  
          await gtTokenService.stakeForGame(playerId, gameId, currentData.stake);
  
          currentData.players[playerId] = {
            joined: Date.now(),
            confirmed: true,
            ready: false
          };
  
          if (Object.keys(currentData.players).length >= currentData.maxPlayers) {
            currentData.status = GAME_STATUS.IN_PROGRESS;
            currentData.gameStarted = Date.now();
          }
  
          currentData.lastUpdated = Date.now();
          return currentData;
        });
      } catch (error) {
        console.error('Failed to join game:', error);
        throw error;
      }
    }
  
    async cancelGame(gameId, creatorId) {
      if (!auth.currentUser) {
        throw new Error('Authentication required');
      }
  
      console.log('Cancelling game:', { gameId, creatorId });
      const gameRef = ref(this.database, `games/${gameId}`);
  
      try {
        return await runTransaction(gameRef, async (currentData) => {
          if (!currentData) {
            throw new Error('Game not found');
          }
  
          if (currentData.creator !== creatorId) {
            throw new Error('Only the creator can cancel the game');
          }
  
          if (currentData.status !== GAME_STATUS.WAITING) {
            throw new Error('Cannot cancel a game in progress');
          }
  
          await gtTokenService.returnStake(creatorId, gameId);
  
          currentData.status = GAME_STATUS.CANCELLED;
          currentData.lastUpdated = Date.now();
          currentData.cancelledAt = Date.now();
          currentData.cancelledBy = creatorId;
  
          return currentData;
        });
      } catch (error) {
        console.error('Failed to cancel game:', error);
        throw error;
      }
    }
  
    async getGame(gameId) {
      if (!auth.currentUser) {
        throw new Error('Authentication required');
      }
  
      console.log('Fetching game details:', gameId);
      try {
        const gameRef = ref(this.database, `games/${gameId}`);
        const snapshot = await get(gameRef);
  
        if (!snapshot.exists()) {
          throw new Error('Game not found');
        }
  
        return {
          ...snapshot.val(),
          id: gameId
        };
      } catch (error) {
        console.error('Failed to fetch game:', error);
        throw new Error('Failed to load game details');
      }
    }
  
    async getActiveGames(filters = {}, page = 1, pageSize = 10) {
      if (!auth.currentUser) {
        throw new Error('Authentication required');
      }
  
      console.log('Fetching active games with filters:', filters);
      try {
        const gamesQuery = query(
          this.gamesRef,
          orderByChild('status'),
          equalTo(GAME_STATUS.WAITING)
        );
  
        const snapshot = await get(gamesQuery);
        
        if (!snapshot.exists()) {
          return {
            games: [],
            total: 0,
            page,
            pageSize,
            hasMore: false
          };
        }
  
        let games = Object.entries(snapshot.val())
          .map(([id, game]) => ({
            ...game,
            id
          }))
          .filter(game => {
            const createdTime = new Date(game.createdAt).getTime();
            const isActive = Date.now() - createdTime <= GAME_TIMEOUT;
            
            const matchesStake = (!filters.minStake || game.stake >= filters.minStake) &&
                               (!filters.maxStake || game.stake <= filters.maxStake);
            const matchesType = !filters.type || game.type === filters.type;
            const matchesFormat = !filters.format || game.format === filters.format;
  
            return isActive && matchesStake && matchesType && matchesFormat;
          })
          .sort((a, b) => b.createdAt - a.createdAt);
  
        const total = games.length;
        const startIndex = (page - 1) * pageSize;
        games = games.slice(startIndex, startIndex + pageSize);
  
        return {
          games,
          total,
          page,
          pageSize,
          hasMore: total > startIndex + pageSize
        };
      } catch (error) {
        console.error('Failed to fetch active games:', error);
        throw new Error('Failed to load games');
      }
    }
  
    async checkAndCleanupExpiredGames() {
      if (!auth.currentUser) return;
  
      const now = Date.now();
      if (now - this.lastCleanup < this.cleanupInterval) {
        return;
      }
  
      console.log('Starting expired games cleanup');
      try {
        const waitingGamesQuery = query(
          this.gamesRef,
          orderByChild('status'),
          equalTo(GAME_STATUS.WAITING)
        );
  
        const snapshot = await get(waitingGamesQuery);
        
        if (!snapshot.exists()) {
          this.lastCleanup = now;
          return;
        }
  
        const updates = {};
        const refunds = [];
  
        snapshot.forEach((child) => {
          const game = child.val();
          const createdTime = new Date(game.createdAt).getTime();
          
          if (now - createdTime > GAME_TIMEOUT) {
            updates[`games/${child.key}/status`] = GAME_STATUS.EXPIRED;
            updates[`games/${child.key}/lastUpdated`] = now;
            updates[`games/${child.key}/expiredAt`] = now;
  
            refunds.push({
              playerId: game.creator,
              gameId: child.key,
              amount: game.stake
            });
          }
        });
  
        if (Object.keys(updates).length > 0) {
          await update(ref(this.database), updates);
          
          for (const refund of refunds) {
            await gtTokenService.returnStake(refund.playerId, refund.gameId);
          }
        }
  
        this.lastCleanup = now;
      } catch (error) {
        console.error('Failed to cleanup expired games:', error);
      }
    }
  }
  
  const multiplayerService = new MultiplayerService();
  export default multiplayerService;