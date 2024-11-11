import React, { useCallback } from 'react';
import { Cat, Dog } from 'lucide-react';
import { PlayerState, PowerUpType } from '../../types';
import PowerUp from './PowerUp';

interface RaceTrackProps {
  catState: PlayerState;
  dogState: PlayerState;
  finishLinePosition: number;
  totalTicks: number;
  playerSide: 'cat' | 'dog' | null;
  raceStarted: boolean;
  usePowerUp: (player: 'cat' | 'dog', powerUpType: PowerUpType) => void;
}

const RaceTrack: React.FC<RaceTrackProps> = ({
  catState,
  dogState,
  finishLinePosition,
  totalTicks,
  playerSide,
  raceStarted,
  usePowerUp,
}) => {
  const getPositionPercentage = useCallback((position: number) => (position / totalTicks) * 100, [totalTicks]);

  const renderPowerUps = useCallback(
    (powerUps: PlayerState['powerUps'], lane: 'cat' | 'dog') => {
      return powerUps.map((powerUp, index) => (
        <PowerUp
          key={`${lane}-${index}`}
          type={powerUp.type}
          position={getPositionPercentage(powerUp.position)}
          lane={lane}
        />
      ));
    },
    [getPositionPercentage]
  );

  const handleLaneClick = (lane: 'cat' | 'dog', event: React.MouseEvent<HTMLDivElement>) => {
    if (!raceStarted || playerSide !== lane) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const position = Math.floor((x / rect.width) * totalTicks);

    // Implement logic to place a power-up at the clicked position
    console.log(`Clicked ${lane} lane at position ${position}`);
  };

  return (
    <div className="relative w-full h-[20vh] bg-gradient-to-r from-green-400 to-blue-500 rounded-lg overflow-hidden">
      {/* Finish line */}
      <div 
        className="absolute top-0 bottom-0 w-1 bg-black z-10"
        style={{ left: `${getPositionPercentage(finishLinePosition)}%` }}
      >
        <div className="h-full w-full bg-gradient-to-b from-black to-white bg-[length:100%_20px] bg-repeat-y" />
      </div>

      {/* Track markings */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 bottom-0 w-px bg-white opacity-30"
          style={{ left: `${(i + 1) * 10}%` }}
        />
      ))}

      {/* Cat lane */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 border-b border-white border-opacity-50 cursor-pointer"
        onClick={(e) => handleLaneClick('cat', e)}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 ease-linear"
          style={{ left: `${getPositionPercentage(catState.position)}%` }}
        >
          <Cat size={24} className="text-white" />
          <div className="mt-1 bg-white bg-opacity-75 px-1 py-0.5 rounded text-xs font-bold">
            {Math.min(catState.position, finishLinePosition)}%
          </div>
        </div>
        {renderPowerUps(catState.powerUps, 'cat')}
      </div>

      {/* Dog lane */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2 cursor-pointer"
        onClick={(e) => handleLaneClick('dog', e)}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 ease-linear"
          style={{ left: `${getPositionPercentage(dogState.position)}%` }}
        >
          <Dog size={24} className="text-white" />
          <div className="mt-1 bg-white bg-opacity-75 px-1 py-0.5 rounded text-xs font-bold">
            {Math.min(dogState.position, finishLinePosition)}%
          </div>
        </div>
        {renderPowerUps(dogState.powerUps, 'dog')}
      </div>
    </div>
  );
};

export default RaceTrack;
