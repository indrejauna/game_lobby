// src/constants/game.js
export const GAME_TYPES = {
    AI_INSTANT: {
      id: 'ai_instant',
      label: 'vs AI',
      description: 'Instant Game',
      icon: '🤖'
    },
    PVP: {
      id: 'pvp',
      label: 'vs Player',
      description: 'Challenge Others',
      icon: '👥'
    }
  };
  
  export const GAME_FORMATS = {
    SINGLE: {
      rounds: 1,
      label: 'Single Game',
      winsNeeded: 1
    },
    BEST_OF_THREE: {
      rounds: 3,
      label: 'Best of 3',
      winsNeeded: 2
    },
    BEST_OF_FIVE: {
      rounds: 5,
      label: 'Best of 5',
      winsNeeded: 3
    },
    BEST_OF_SEVEN: {
      rounds: 7,
      label: 'Best of 7',
      winsNeeded: 4
    }
  };
  
  export const GAME_STATUS = {
    WAITING: 'waiting',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
  };
  
  export const MIN_STAKE = 100;
  export const GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes