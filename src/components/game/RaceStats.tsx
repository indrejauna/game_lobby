import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Cat, Dog } from 'lucide-react';
import { RaceHistory } from '../../types';

interface RaceStatsProps {
  catWins: number;
  dogWins: number;
  raceHistory: RaceHistory[];
}

const RaceStats: React.FC<RaceStatsProps> = ({ catWins, dogWins, raceHistory }) => {
  // Memoize the race history to avoid unnecessary re-renders
  const raceHistoryContent = useMemo(() => {
    if (raceHistory.length === 0) {
      return <p className="text-xs text-gray-500">No races have been run yet.</p>;
    }

    return raceHistory.map((race, index) => (
      <div
        key={index}
        className={`flex justify-between items-center p-1 rounded mb-1 ${
          race.winner === 'Cat' ? 'bg-blue-100' : 'bg-red-100'
        }`}
      >
        <span className="font-semibold">{race.winner} won!</span>
        <span>Cat: {race.catPosition}%</span>
        <span>Dog: {race.dogPosition}%</span>
      </div>
    ));
  }, [raceHistory]);

  return (
    <Card className="w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-sm">Race Stats</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex justify-around mb-2">
          <div className="text-center">
            <Cat size={24} className="text-gray-700 mb-1 mx-auto" aria-label="Cat Wins" />
            <p className="text-sm font-bold">Cat Wins: {catWins}</p>
          </div>
          <div className="text-center">
            <Dog size={24} className="text-gray-700 mb-1 mx-auto" aria-label="Dog Wins" />
            <p className="text-sm font-bold">Dog Wins: {dogWins}</p>
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-xs font-bold mb-1">Race History</h3>
          <div className="max-h-24 overflow-y-auto text-xs scroll-smooth">
            {raceHistoryContent}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RaceStats;
