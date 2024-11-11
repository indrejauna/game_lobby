// src/types/index.ts
export type PowerUpType = 'speed' | 'snail' | 'wall' | 'teleport';

export interface StoredPowerUp {
  type: PowerUpType;
}

export interface PlayerPowerUp {
  type: PowerUpType;
  position: number;
  lane: 'cat' | 'dog';
}

export interface PlayerState {
  position: number;
  powerUps: PlayerPowerUp[];
  storedPowerUps: StoredPowerUp[];
  activePowerUp: PowerUpType | null;
}

export interface RaceHistory {
  winner: 'Cat' | 'Dog' | 'Tie';
  catPosition: number;
  dogPosition: number;
}


export interface PlayerState {
  position: number;
  powerUps: PlayerPowerUp[];
  storedPowerUps: StoredPowerUp[];
  activePowerUp: PowerUpType | null;
}