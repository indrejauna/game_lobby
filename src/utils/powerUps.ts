import { PowerUpType, PlayerPowerUp } from '../types';

const MIN_SPACING = 10;
const MAX_POSITION = 80;
const NUMBER_OF_POWERUPS = 4;

// Helper function for generating valid random positions
const generateLanePositions = (): number[] => {
  const positions: number[] = [];
  while (positions.length < NUMBER_OF_POWERUPS) {
    let position: number;
    do {
      position = Math.floor(Math.random() * (MAX_POSITION - MIN_SPACING)) + MIN_SPACING;
    } while (positions.some(p => Math.abs(p - position) < MIN_SPACING));
    positions.push(position);
  }
  return positions.sort((a, b) => a - b);
};

export const generatePowerUps = (): PlayerPowerUp[] => {
  const powerUpTypes: PowerUpType[] = ['speed', 'snail', 'wall', 'teleport'];
  const powerUps: PlayerPowerUp[] = [];

  // For each lane ('cat' and 'dog'), generate power-ups
  ['cat', 'dog'].forEach((lane) => {
    const lanePositions = generateLanePositions();
    const shuffledPowerUps = [...powerUpTypes].sort(() => Math.random() - 0.5);

    lanePositions.forEach((position, index) => {
      powerUps.push({
        type: shuffledPowerUps[index],
        position: position,
        lane: lane as 'cat' | 'dog', // Ensure lane is strictly typed
      });
    });
  });

  return powerUps;
};

export const checkPowerUps = (
  oldPosition: number,
  newPosition: number,
  powerUps: PlayerPowerUp[],
  collectPowerUp: (powerUp: PowerUpType) => void
): PlayerPowerUp[] => {
  return powerUps.filter((powerUp) => {
    if (oldPosition < powerUp.position && newPosition >= powerUp.position) {
      collectPowerUp(powerUp.type);
      return false; // Remove the collected power-up
    }
    return true;
  });
};
