import React, { useMemo } from 'react';
import { Zap, Snail, Square, Wind } from 'lucide-react';
import { PowerUpType } from '../../types';

interface PowerUpProps {
  type: PowerUpType;
  position: number;
  lane: 'cat' | 'dog';
}

const PowerUp: React.FC<PowerUpProps> = ({ type, position, lane }) => {
  // Memoize icons to prevent unnecessary recalculation on re-render
  const icons = useMemo(() => ({
    speed: <Zap size={24} className="text-yellow-400" aria-label="Speed Power-Up" />,
    snail: <Snail size={24} className="text-red-400" aria-label="Snail Power-Up" />,
    wall: <Square size={24} className="text-gray-600" aria-label="Wall Power-Up" />,
    teleport: <Wind size={24} className="text-green-400" aria-label="Teleport Power-Up" />,
  }), []);

  // Animation classes (optional) for visual effect
  const animationClass = 'animate-bounce';

  return (
    <div
      className={`absolute ${lane === 'cat' ? 'top-1/4' : 'bottom-1/4'} -translate-y-1/2 z-10 transition-all duration-300 ease-in-out ${animationClass}`}
      style={{ left: `${position}%` }}
    >
      {icons[type]}
    </div>
  );
};

export default PowerUp;
