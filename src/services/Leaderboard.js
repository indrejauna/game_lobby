// src/components/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import multiplayerService from '../services/multiplayerService';

const Leaderboard = () => {
  const { publicKey } = useWallet();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await multiplayerService.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Leaderboard</h2>

      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="p-2">Rank</th>
                <th className="p-2">Player</th>
                <th className="p-2 text-right">Games</th>
                <th className="p-2 text-right">Won</th>
                <th className="p-2 text-right">Total Winnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {leaderboard.map((player, index) => (
                <tr 
                  key={player.address}
                  className={`${
                    player.address === publicKey?.toString()
                      ? 'bg-purple-500/10'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <td className="p-2">#{index + 1}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{player.avatar}</span>
                      <span>{player.name}</span>
                    </div>
                  </td>
                  <td className="p-2 text-right">{player.gamesPlayed}</td>
                  <td className="p-2 text-right">{player.gamesWon}</td>
                  <td className="p-2 text-right font-mono">
                    {player.totalWinnings.toLocaleString()} GT
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;