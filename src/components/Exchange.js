// src/components/Exchange.js
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getTokenBalance } from '../services/tokenService';
import gtTokenService from '../services/gtTokenService';

const Exchange = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [tailBalance, setTailBalance] = useState(0);
  const [gtBalance, setGtBalance] = useState(0);
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Fetch balances
  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;
      try {
        const tail = await getTokenBalance(connection, publicKey);
        setTailBalance(tail);
        
        const gt = gtTokenService.getBalance(publicKey.toString());
        setGtBalance(gt);
        
        const history = gtTokenService.getTransactionHistory(publicKey.toString());
        setTransactions(history || []);
      } catch (err) {
        console.error('Error fetching balances:', err);
      }
    };

    fetchBalances();
    const interval = setInterval(fetchBalances, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Format transaction time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Handle exchange
  const handleExchange = async () => {
    if (!publicKey || loading || !exchangeAmount) return;
    const amount = parseFloat(exchangeAmount);
    
    try {
      setLoading(true);
      setError(null);

      if (isDepositing) {
        // Depositing TAIL for GT
        if (amount > tailBalance) {
          throw new Error('Insufficient TAIL balance');
        }
        const result = await gtTokenService.depositTail(publicKey.toString(), amount);
        setGtBalance(result.gtBalance);
      } else {
        // Withdrawing GT for TAIL
        if (amount > gtBalance) {
          throw new Error('Insufficient GT balance');
        }
        const result = await gtTokenService.withdrawGT(publicKey.toString(), amount);
        setGtBalance(result.gtBalance);
      }

      setExchangeAmount('');
      
      // Refresh transaction history
      const history = gtTokenService.getTransactionHistory(publicKey.toString());
      setTransactions(history);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Token Exchange</h2>
        <div className="text-sm font-mono bg-gray-800/40 px-3 py-1 rounded-lg border border-white/10">
          1 TAIL = 1 GT
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
          {error}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="text-lg font-semibold mb-2">TAIL Balance</div>
          <div className="text-3xl font-mono text-purple-400">
            {tailBalance.toLocaleString()} TAIL
          </div>
        </div>

        <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="text-lg font-semibold mb-2">GT Balance</div>
          <div className="text-3xl font-mono text-green-400">
            {gtBalance.toLocaleString()} GT
          </div>
        </div>
      </div>

      {/* Exchange Interface */}
      <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="space-y-6">
          {/* Exchange Type Toggle */}
          <div className="flex rounded-lg bg-gray-900/50 p-1">
            <button
              onClick={() => {
                setIsDepositing(true);
                setExchangeAmount('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                isDepositing 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Deposit TAIL
            </button>
            <button
              onClick={() => {
                setIsDepositing(false);
                setExchangeAmount('');
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                !isDepositing 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Withdraw TAIL
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {isDepositing ? 'TAIL Amount to Deposit' : 'GT Amount to Withdraw'}
            </label>
            <div className="relative">
              <input
                type="number"
                value={exchangeAmount}
                onChange={(e) => setExchangeAmount(e.target.value)}
                min="0"
                step="1"
                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-purple-500 text-white pr-16"
                placeholder="Enter amount"
              />
              <button 
                onClick={() => setExchangeAmount(
                  isDepositing ? tailBalance.toString() : gtBalance.toString()
                )}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-purple-400 hover:text-purple-300 transition"
              >
                MAX
              </button>
            </div>
            <div className="text-sm text-gray-400">
              You will receive: {exchangeAmount || '0'} {isDepositing ? 'GT' : 'TAIL'}
            </div>
          </div>

          {/* Exchange Button */}
          <button
            onClick={handleExchange}
            disabled={loading || !exchangeAmount || parseFloat(exchangeAmount) <= 0}
            className="w-full px-6 py-3 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading 
              ? 'Processing...' 
              : isDepositing 
                ? 'Deposit TAIL for GT' 
                : 'Withdraw TAIL from GT'
            }
          </button>

          {/* Exchange Info */}
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between p-2 rounded bg-black/20">
              <span>Exchange Rate</span>
              <span>1 TAIL = 1 GT</span>
            </div>
            {isDepositing ? (
              <div className="flex justify-between p-2 rounded bg-black/20">
                <span>Available to Deposit</span>
                <span>{tailBalance.toLocaleString()} TAIL</span>
              </div>
            ) : (
              <div className="flex justify-between p-2 rounded bg-black/20">
                <span>Available to Withdraw</span>
                <span>{gtBalance.toLocaleString()} GT</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exchange History */}
      <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
        <h3 className="text-lg font-semibold mb-4">Exchange History</h3>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 rounded bg-black/20 border border-white/5"
              >
                <div>
                  <div className="font-medium">
                    {tx.type === 'deposit' ? 'Deposited TAIL' : 'Withdrew TAIL'}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatTime(tx.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono ${
                    tx.status === 'completed' 
                      ? tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                      : 'text-gray-400'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} 
                    {tx.type === 'deposit' ? ' GT' : ' TAIL'}
                  </div>
                  <div className={`text-xs ${
                    tx.status === 'completed' ? 'text-green-500' : 
                    tx.status === 'failed' ? 'text-red-500' : 
                    'text-yellow-500'
                  }`}>
                    {tx.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No exchange history yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Exchange;