import React, { useCallback } from 'react';
import { Button } from '../ui/button';
import { ChevronRight, RotateCcw, Play, Pause } from 'lucide-react';

interface RaceControlsProps {
  flipCoin: () => void;
  resetRace: () => void;
  startRace: () => void;
  raceFinished: boolean;
  raceStarted: boolean;
  autoPlay: boolean;
  setAutoPlay: (autoPlay: boolean) => void;
}

const RaceControls: React.FC<RaceControlsProps> = ({
  flipCoin,
  resetRace,
  startRace,
  raceFinished,
  raceStarted,
  autoPlay,
  setAutoPlay,
}) => {
  // Memoize toggle autoPlay to prevent unnecessary re-renders
  const toggleAutoPlay = useCallback(() => {
    setAutoPlay(!autoPlay);
  }, [autoPlay, setAutoPlay]);

  return (
    <div className="flex justify-center items-center space-x-2 mt-2">
      {!raceStarted && (
        <Button onClick={startRace} size="sm">
          Start Race
        </Button>
      )}

      {raceStarted && !raceFinished && (
        <>
          <Button
            onClick={flipCoin}
            disabled={autoPlay}
            size="sm"
            className={`${autoPlay ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next Move <ChevronRight className="ml-1 h-4 w-4" />
          </Button>

          <Button onClick={toggleAutoPlay} size="sm">
            {autoPlay ? (
              <>
                <Pause className="mr-1 h-4 w-4" /> Stop Auto
              </>
            ) : (
              <>
                <Play className="mr-1 h-4 w-4" /> Auto Play
              </>
            )}
          </Button>
        </>
      )}

      <Button
        onClick={resetRace}
        disabled={!raceFinished && raceStarted}
        variant="destructive"
        size="sm"
        className={`${!raceFinished && raceStarted ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <RotateCcw className="mr-1 h-4 w-4" /> Reset
      </Button>
    </div>
  );
};

export default RaceControls;
