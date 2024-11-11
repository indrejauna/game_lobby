import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import multiplayerService from '../services/multiplayerService';
import gtTokenService from '../services/gtTokenService';
import { GAME_TYPES, GAME_FORMATS, GAME_STATUS, MIN_STAKE } from '../constants/game';
import CreateGameForm from './game/CreateGameForm';
import GameCard from './game/GameCard';
import ErrorBoundary from './ErrorBoundary';

const GameList = () => {
  const { publicKey } = useWallet();
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gtBalance, setGtBalance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gameConfig, setGameConfig] = useState({
    type: GAME_TYPES.PVP.id,
    format: GAME_FORMATS.BEST_OF_THREE.rounds,
    stake: ''
  });

  // Firebase Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user && publicKey) {
        try {
          await signInAnonymously(auth);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth error:', error);
          setError('Failed to connect to game server. Please try again.');
          setIsAuthenticated(false);
        }
      } else if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, [publicKey]);

  // Subscribe to active games
  useEffect(() => {
    if (!isAuthenticated || !publicKey) return;

    const unsubscribe = multiplayerService.subscribeToActiveGames((games) => {
      setActiveGames(games);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated, publicKey]);

  // GT Balance updater
  useEffect(() => {
    if (!publicKey) return;

    const updateBalance = () => {
      try {
        const balance = gtTokenService.getBalance(publicKey.toString());
        setGtBalance(balance);
      } catch (error) {
        console.error('Error fetching GT balance:', error);
      }
    };

    updateBalance();
    const interval = setInterval(updateBalance, 2000);
    return () => clearInterval(interval);
  }, [publicKey]);

  // Error auto-clear
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCreateGame = async () => {
    if (!publicKey || !isAuthenticated) {
      setError('Please connect your wallet');
      return;
    }

    if (!gameConfig.stake) {
      setError('Please enter a stake amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const stakeAmount = parseFloat(gameConfig.stake);
      if (stakeAmount < MIN_STAKE) {
        throw new Error(`Minimum stake is ${MIN_STAKE} GT`);
      }

      const currentBalance = gtTokenService.getBalance(publicKey.toString());
      if (currentBalance < stakeAmount) {
        throw new Error(`Insufficient GT balance. Have: ${currentBalance}, Need: ${stakeAmount}`);
      }

      const result = await multiplayerService.createGame({
        ...gameConfig,
        creator: publicKey.toString(),
        stake: stakeAmount
      });

      console.log('Game created successfully:', result);
      setIsCreatingGame(false);
      setGameConfig({
        type: GAME_TYPES.PVP.id,
        format: GAME_FORMATS.BEST_OF_THREE.rounds,
        stake: ''
      });
    } catch (err) {
      console.error('Failed to create game:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId) => {
    if (!publicKey || !isAuthenticated || loading) return;

    try {
      setLoading(true);
      setError(null);

      const game = activeGames.find(g => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      const currentBalance = gtTokenService.getBalance(publicKey.toString());
      if (currentBalance < game.stake) {
        throw new Error(`Insufficient GT balance. Have: ${currentBalance}, Need: ${game.stake}`);
      }

      await multiplayerService.joinGame(gameId, publicKey.toString());
    } catch (err) {
      console.error('Failed to join game:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelGame = async (gameId) => {
    if (!publicKey || !isAuthenticated || loading) return;

    try {
      setLoading(true);
      setError(null);

      const game = activeGames.find(g => g.id === gameId);
      if (!game) {
        throw new Error('Game not found');
      }

      if (game.creator !== publicKey.toString()) {
        throw new Error('Only the creator can cancel the game');
      }

      await multiplayerService.cancelGame(gameId, publicKey.toString());
    } catch (err) {
      console.error('Failed to cancel game:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (refreshing || !isAuthenticated) return;

    try {
      setRefreshing(true);
      const games = await multiplayerService.getActiveGames();
      setActiveGames(games);
      
      if (publicKey) {
        const balance = gtTokenService.getBalance(publicKey.toString());
        setGtBalance(balance);
      }
    } catch (err) {
      console.error('Failed to refresh games:', err);
      setError('Failed to refresh games');
    } finally {
      setRefreshing(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4">Welcome to Game List</h2>
        <p className="text-gray-400">Please connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallbackMessage="We're having trouble loading the game list. Please try again."
      onRetry={handleRefresh}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Active Games</h2>
          <div className="flex items-center gap-4">
            <div className="text-sm font-mono bg-gray-800/40 px-3 py-1 rounded-lg border border-white/10">
              {gtBalance.toLocaleString()} GT
            </div>
            <button
              onClick={() => setIsCreatingGame(true)}
              disabled={!isAuthenticated || loading}
              className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Game
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-500">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-400"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create Game Form */}
        {isCreatingGame && (
          <CreateGameForm
            gameConfig={gameConfig}
            setGameConfig={setGameConfig}
            gtBalance={gtBalance}
            loading={loading}
            onCreateGame={handleCreateGame}
            onCancel={() => setIsCreatingGame(false)}
          />
        )}

        {/* Loading State */}
        {loading && !isCreatingGame && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        )}

        {/* Game List */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  isCreator={game.creator === publicKey?.toString()}
                  canJoin={game.creator !== publicKey?.toString() && game.status === GAME_STATUS.WAITING}
                  loading={loading}
                  onJoin={() => handleJoinGame(game.id)}
                  onCancel={() => handleCancelGame(game.id)}
                  gtBalance={gtBalance}
                />
              ))}
            </div>

            {activeGames.length > 0 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Games'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && activeGames.length === 0 && !isCreatingGame && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              No active games available
            </div>
            <button
              onClick={() => setIsCreatingGame(true)}
              disabled={!isAuthenticated}
              className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create First Game
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default GameList;