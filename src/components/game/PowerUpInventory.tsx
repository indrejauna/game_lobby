import React, { useMemo } from 'react';
import { Button } from '../ui/button';
import { StoredPowerUp, PowerUpType } from '../../types';
import { Zap, Snail, Square, Wind } from 'lucide-react';

interface PowerUpInventoryProps {
  player: 'cat' | 'dog';
  storedPowerUps: StoredPowerUp[];
  usePowerUp: (player: 'cat' | 'dog', powerUpType: PowerUpType) => void;
  buyPowerUp: (powerUpType: PowerUpType) => void;
  isPlayerSide: boolean;
  walletConnected: boolean;
  playMoney: number;
  raceStarted: boolean;
}

const PowerUpInventory: React.FC<PowerUpInventoryProps> = ({
  player,
  storedPowerUps,
  usePowerUp,
  buyPowerUp,
  isPlayerSide,
  playMoney,
  raceStarted,
}) => {
  // Power-up icons mapping
  const getPowerUpIcon = (type: PowerUpType) => {
    switch (type) {
      case 'speed':
        return <Zap size={16} className="text-yellow-400" />;
      case 'snail':
        return <Snail size={16} className="text-red-400" />;
      case 'wall':
        return <Square size={16} className="text-gray-600" />;
      case 'teleport':
        return <Wind size={16} className="text-green-400" />;
      default:
        return null;
    }
  };

  // Memoize power-up counts for performance
  const powerUpCounts = useMemo(() => {
    return ['speed', 'snail', 'wall', 'teleport'].reduce(
      (acc, type) => ({
        ...acc,
        [type]: storedPowerUps.filter(pu => pu.type === type).length,
      }),
      {} as Record<PowerUpType, number>
    );
  }, [storedPowerUps]);

  const renderActionButtons = (type: PowerUpType, count: number) => (
    <div className="flex space-x-1">
      {isPlayerSide && count > 0 && (
        <Button
          onClick={() => usePowerUp(player, type)}
          className="p-1 mr-1 text-xs"
          title={`Use ${type}`}
          disabled={!raceStarted}
          size="sm"
        >
          Use
        </Button>
      )}
      {isPlayerSide && (
        <Button
          onClick={() => buyPowerUp(type)}
          className={`p-1 text-xs ${playMoney < 10000 || raceStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={`Buy ${type} for 10k TAIL`}
          disabled={playMoney < 10000 || raceStarted}
          size="sm"
        >
          Buy
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-2">
      <h3 className="text-sm font-semibold mb-2 text-center">
        {player === 'cat' ? 'Cat' : 'Dog'} Power-ups
      </h3>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left">Type</th>
            <th className="text-center">Count</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {(['speed', 'snail', 'wall', 'teleport'] as PowerUpType[]).map(type => (
            <tr key={type} className="border-t">
              <td className="py-1">{getPowerUpIcon(type)}</td>
              <td className="text-center py-1">{powerUpCounts[type]}</td>
              <td className="text-right py-1">
                {renderActionButtons(type, powerUpCounts[type])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PowerUpInventory;
