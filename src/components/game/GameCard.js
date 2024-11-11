// src/components/game/GameCard.js
import React from 'react';
import { GAME_TYPES, GAME_FORMATS } from '../../constants/game';

const GameCard = ({ game, isCreator, canJoin, loading, onJoin, onCancel, gtBalance }) => {
  const insufficientBalance = gtBalance < game.stake;
  const gameType = GAME_TYPES[game.type] || { label: game.type, icon: '🎮' };
  const gameFormat = GAME_FORMATS[game.format] || { label: `${game.format} Rounds` };
  
  return (
    <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>{gameType.icon}</span>
            {gameType.label}
            <span className="text-sm text-gray-400">
              {gameFormat.label}
            </span>
          </h3>
          <p className="text-purple-400 font-mono">{game.stake} GT</p>
        </div>
        <span className="px-3 py-1 rounded-full text-sm bg-green-400/10 text-green-400">
          Waiting for Player
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Creator:</span>
          <span className="font-mono">
            {game.creator.slice(0, 4)}...{game.creator.slice(-4)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Created:</span>
          <span>{new Date(game.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {canJoin && (
        <button
          onClick={onJoin}
          disabled={loading || insufficientBalance}
          className="w-full px-4 py-2 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {insufficientBalance ? 'Insufficient GT Balance' : 'Join Game'}
        </button>
      )}

      {isCreator && (
        <button
          onClick={onCancel}
          disabled={loading}
          className="w-full px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Canceling...' : 'Cancel Game'}
        </button>
      )}
    </div>
  );
};

export default GameCard;