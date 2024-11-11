// src/services/gtTokenService.js
class GTTokenService {
    constructor() {
      this.STORAGE_KEY = 'gt_token_balances';
      this.exchangeRate = 1; // 1 TAIL = 1 GT
      this.loadBalances();
    }
  
    loadBalances() {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        this.balances = stored ? JSON.parse(stored) : {};
        console.log('Loaded balances:', this.balances);
      } catch (error) {
        console.error('Error loading balances:', error);
        this.balances = {};
      }
    }
  
    saveBalances() {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.balances));
      } catch (error) {
        console.error('Error saving balances:', error);
      }
    }
  
    initializeWallet(walletAddress) {
      if (!this.balances[walletAddress]) {
        this.balances[walletAddress] = {
          balance: 1000, // Default starting balance
          stakes: {},
          transactions: []
        };
        this.saveBalances();
        console.log('Initialized new wallet with balance:', this.balances[walletAddress]);
      }
      return this.balances[walletAddress];
    }
  
    getBalance(walletAddress) {
      this.loadBalances();
      const wallet = this.balances[walletAddress] || this.initializeWallet(walletAddress);
      return wallet.balance;
    }
  
    async depositTail(walletAddress, tailAmount) {
      console.log(`Depositing ${tailAmount} TAIL for wallet ${walletAddress}`);
      this.loadBalances();
      
      const wallet = this.balances[walletAddress] || this.initializeWallet(walletAddress);
      const gtAmount = tailAmount * this.exchangeRate;
      
      const transaction = {
        type: 'deposit',
        amount: tailAmount,
        gtAmount,
        timestamp: Date.now(),
        status: 'completed'
      };
  
      try {
        // Add GT tokens
        wallet.balance += gtAmount;
        
        // Record transaction
        wallet.transactions.unshift(transaction);
        this.saveBalances();
        
        console.log('Deposit successful, new balance:', wallet.balance);
        return {
          success: true,
          gtBalance: wallet.balance,
          transaction
        };
      } catch (error) {
        console.error('Deposit failed:', error);
        transaction.status = 'failed';
        wallet.transactions.unshift(transaction);
        this.saveBalances();
        throw error;
      }
    }
  
    async withdrawGT(walletAddress, gtAmount) {
      console.log(`Withdrawing ${gtAmount} GT for wallet ${walletAddress}`);
      this.loadBalances();
      
      const wallet = this.balances[walletAddress] || this.initializeWallet(walletAddress);
      
      if (wallet.balance < gtAmount) {
        throw new Error('Insufficient GT balance');
      }
  
      const tailAmount = gtAmount / this.exchangeRate;
      const transaction = {
        type: 'withdraw',
        amount: gtAmount,
        tailAmount,
        timestamp: Date.now(),
        status: 'completed'
      };
  
      try {
        // Remove GT tokens
        wallet.balance -= gtAmount;
        
        // Record transaction
        wallet.transactions.unshift(transaction);
        this.saveBalances();
        
        console.log('Withdrawal successful, new balance:', wallet.balance);
        return {
          success: true,
          gtBalance: wallet.balance,
          transaction
        };
      } catch (error) {
        console.error('Withdrawal failed:', error);
        transaction.status = 'failed';
        wallet.transactions.unshift(transaction);
        this.saveBalances();
        throw error;
      }
    }
  
    async stakeForGame(walletAddress, gameId, amount) {
      console.log(`Staking ${amount} GT for game ${gameId}`);
      this.loadBalances();
      
      const wallet = this.balances[walletAddress] || this.initializeWallet(walletAddress);
      
      if (wallet.balance < amount) {
        throw new Error(`Insufficient GT balance. Have: ${wallet.balance}, Need: ${amount}`);
      }
  
      wallet.balance -= amount;
      wallet.stakes[gameId] = {
        amount,
        timestamp: Date.now()
      };
  
      wallet.transactions.unshift({
        type: 'game_stake',
        amount: -amount,
        gameId,
        timestamp: Date.now(),
        status: 'completed'
      });
  
      this.saveBalances();
      return wallet.balance;
    }
  
    async returnStake(walletAddress, gameId) {
      console.log(`Returning stake for game ${gameId}`);
      this.loadBalances();
      
      const wallet = this.balances[walletAddress];
      if (!wallet?.stakes[gameId]) {
        return;
      }
  
      const stake = wallet.stakes[gameId];
      wallet.balance += stake.amount;
      delete wallet.stakes[gameId];
  
      wallet.transactions.unshift({
        type: 'stake_return',
        amount: stake.amount,
        gameId,
        timestamp: Date.now(),
        status: 'completed'
      });
  
      this.saveBalances();
      return wallet.balance;
    }
  
    async awardGameWinnings(walletAddress, amount) {
      console.log(`Awarding ${amount} GT to ${walletAddress}`);
      this.loadBalances();
      
      const wallet = this.balances[walletAddress] || this.initializeWallet(walletAddress);
      wallet.balance += amount;
  
      wallet.transactions.unshift({
        type: 'game_winning',
        amount,
        timestamp: Date.now(),
        status: 'completed'
      });
  
      this.saveBalances();
      return wallet.balance;
    }
  
    getTransactionHistory(walletAddress) {
      this.loadBalances();
      return this.balances[walletAddress]?.transactions || [];
    }
  
    getStakes(walletAddress) {
      this.loadBalances();
      return this.balances[walletAddress]?.stakes || {};
    }
  }
  
  const gtTokenService = new GTTokenService();
  export default gtTokenService;