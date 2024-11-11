// src/components/LobbyHome.js
import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { TAIL_TOKEN_MINT } from '../App';

const LobbyHome = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    async function getTokenBalance() {
      if (!publicKey) return;

      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { mint: TAIL_TOKEN_MINT }
        );

        if (accounts.value.length > 0) {
          const balance = accounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
          setBalance(balance);
        }
        
        // Set up account subscription
        const subscriptionId = connection.onAccountChange(
          accounts.value[0].pubkey,
          (account) => {
            const data = account.data;
            if (data) {
              const newBalance = account.data.parsed.info.tokenAmount.uiAmount;
              setBalance(newBalance);
            }
          },
          'confirmed'
        );

        return () => {
          connection.removeAccountChangeListener(subscriptionId);
        };
      } catch (error) {
        console.error("Error getting token balance:", error);
      }
    }

    getTokenBalance();
  }, [publicKey, connection]);

  return (
    <div className="mb-12">
      <div className="p-6 bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Gaming Profile</h2>
          <div className="text-purple-400 font-mono">
            {balance.toLocaleString()} TAIL
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-pink-500">0</div>
            <div className="text-gray-400">Games Played</div>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">0.00</div>
            <div className="text-gray-400">Total Winnings (TAIL)</div>
          </div>
          <div className="p-4 bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-pink-500">0</div>
            <div className="text-gray-400">Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyHome;