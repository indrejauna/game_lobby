// src/components/game/CreateGameForm.js
import React, { useMemo } from 'react';
import { GAME_TYPES, GAME_FORMATS, MIN_STAKE } from '../../constants/game';
import { AlertCircle } from 'lucide-react';

const CreateGameForm = ({ 
  gameConfig, 
  setGameConfig, 
  gtBalance, 
  loading, 
  onCreateGame, 
  onCancel 
}) => {
  // Add validation feedback
  const validationError = useMemo(() => {
    if (!gameConfig.stake) return '';
    const stakeAmount = parseFloat(gameConfig.stake);
    
    if (isNaN(stakeAmount)) return 'Please enter a valid number';
    if (stakeAmount < MIN_STAKE) return `Minimum stake is ${MIN_STAKE} GT`;
    if (stakeAmount > gtBalance) return 'Insufficient GT balance';
    return '';
  }, [gameConfig.stake, gtBalance]);

  // Add stake amount formatter
  const handleStakeChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setGameConfig(prev => ({ ...prev, stake: '' }));
      return;
    }

    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      setGameConfig(prev => ({ ...prev, stake: value }));
    }
  };

  return (
    <div className="p-6 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10">
      <h3 className="text-xl font-semibold mb-6">Create New Game</h3>
      
      <div className="space-y-6">
        {/* Game Type Selection - Same as before */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Game Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            {Object.values(GAME_TYPES).map((type) => (
              <button
                key={type.id}
                onClick={() => setGameConfig(prev => ({ ...prev, type: type.id }))}
                className={`p-4 rounded-lg border ${
                  gameConfig.type === type.id
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 hover:border-purple-500'
                } transition`}
              >
                <div className="text-lg font-medium">{type.icon} {type.label}</div>
                <div className="text-sm text-gray-400">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Format Selection - Same as before */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Game Format
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.values(GAME_FORMATS).map((format) => (
              <button
                key={format.label}
                onClick={() => setGameConfig(prev => ({ ...prev, format: format.rounds }))}
                className={`p-3 rounded-lg border ${
                  gameConfig.format === format.rounds
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 hover:border-purple-500'
                } transition`}
              >
                <div className="text-sm font-medium">{format.label}</div>
                {format.winsNeeded && (
                  <div className="text-xs text-gray-400">Win {format.winsNeeded} to win</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Stake Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Stake Amount (GT)
          </label>
          <div className="relative">
            <input
              type="number"
              value={gameConfig.stake}
              onChange={handleStakeChange}
              min={MIN_STAKE}
              step="1"
              className={`w-full px-4 py-2 bg-black/20 border rounded-lg focus:outline-none focus:border-purple-500 text-white pr-16 ${
                validationError ? 'border-red-500' : 'border-white/10'
              }`}
              placeholder="Enter stake amount"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <button 
                onClick={() => setGameConfig(prev => ({ ...prev, stake: MIN_STAKE.toString() }))}
                className="px-2 py-1 text-xs text-purple-400 hover:text-purple-300 transition"
              >
                MIN
              </button>
              <button 
                onClick={() => setGameConfig(prev => ({ ...prev, stake: gtBalance.toString() }))}
                className="px-2 py-1 text-xs text-purple-400 hover:text-purple-300 transition"
              >
                MAX
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-400">
              <span>Balance: </span>
              <span className={gtBalance < MIN_STAKE ? 'text-red-400' : 'text-gray-400'}>
                {gtBalance.toLocaleString()} GT
              </span>
            </div>
            <div className="text-gray-400">
              <span>Min stake: </span>
              <span>{MIN_STAKE.toLocaleString()} GT</span>
            </div>
          </div>

          {validationError && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              {validationError}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onCreateGame}
            disabled={loading || !gameConfig.stake || !!validationError}
            className="flex-1 px-6 py-2 bg-purple-600 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Game'}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-2 bg-gray-700 rounded-lg hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGameForm;