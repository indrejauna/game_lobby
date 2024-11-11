// src/hooks/useGameState.ts
import { useState, useCallback, useEffect } from 'react';
import { PlayerState, RaceHistory, PowerUpType } from '../types';
import { generatePowerUps } from '../utils/powerUps';

const FINISH_LINE_POSITION = 100;

export const useGameState = () => {
  const [catState, setCatState] = useState<PlayerState>({
    position: 0,
    powerUps: [],
    storedPowerUps: [],
    activePowerUp: null,
  });

  const [dogState, setDogState] = useState<PlayerState>({
    position: 0,
    powerUps: [],
    storedPowerUps: [],
    activePowerUp: null,
  });

  const [raceFinished, setRaceFinished] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false);
  const [catWins, setCatWins] = useState(0);
  const [dogWins, setDogWins] = useState(0);
  const [raceHistory, setRaceHistory] = useState<RaceHistory[]>([]);
  const [message, setMessage] = useState('');
  const [playerSide, setPlayerSide] = useState<'cat' | 'dog' | null>(null);
  const [playMoney, setPlayMoney] = useState(100000);
  const [autoPlay, setAutoPlay] = useState(false);

  const initializePowerUps = useCallback(() => {
    const allPowerUps = generatePowerUps();
    setCatState((prevState) => ({
      ...prevState,
      powerUps: allPowerUps.filter((pu) => pu.lane === 'cat'),
    }));
    setDogState((prevState) => ({
      ...prevState,
      powerUps: allPowerUps.filter((pu) => pu.lane === 'dog'),
    }));
  }, []);

  const startRace = useCallback(() => {
    if (!playerSide) {
      setMessage('Please choose a side (Cat or Dog) before starting the race.');
      return;
    }
    setRaceStarted(true);
    setRaceFinished(false);
    setMessage("And they're off! The race has begun!");
    setCatState((prevState) => ({
      ...prevState,
      position: 0,
      powerUps: [],
      activePowerUp: null,
    }));
    setDogState((prevState) => ({
      ...prevState,
      position: 0,
      powerUps: [],
      activePowerUp: null,
    }));
    initializePowerUps();
  }, [playerSide, initializePowerUps]);

  const resetRace = useCallback(() => {
    setCatState({
      position: 0,
      powerUps: [],
      storedPowerUps: [],
      activePowerUp: null,
    });
    setDogState({
      position: 0,
      powerUps: [],
      storedPowerUps: [],
      activePowerUp: null,
    });
    setRaceFinished(false);
    setRaceStarted(false);
    setMessage('');
    setAutoPlay(false);
  }, []);

  const buyPowerUp = useCallback(
    (powerUpType: PowerUpType) => {
      if (!playerSide) {
        setMessage('Please choose a side (Cat or Dog) before buying power-ups.');
        return;
      }

      if (playMoney >= 10000) {
        setPlayMoney((prevMoney) => prevMoney - 10000);

        if (playerSide === 'cat') {
          setCatState((prevState) => ({
            ...prevState,
            storedPowerUps: [...prevState.storedPowerUps, { type: powerUpType }],
          }));
        } else {
          setDogState((prevState) => ({
            ...prevState,
            storedPowerUps: [...prevState.storedPowerUps, { type: powerUpType }],
          }));
        }

        setMessage(`Successfully purchased ${powerUpType} power-up!`);
      } else {
        setMessage('Not enough TAIL to buy power-up!');
      }
    },
    [playMoney, playerSide]
  );

  const usePowerUp = useCallback(
    (player: 'cat' | 'dog', powerUpType: PowerUpType) => {
      const setPlayerState = player === 'cat' ? setCatState : setDogState;
      const playerState = player === 'cat' ? catState : dogState;

      const powerUpIndex = playerState.storedPowerUps.findIndex((pu) => pu.type === powerUpType);
      if (powerUpIndex === -1) {
        setMessage("You don't have that power-up!");
        return;
      }

      const newStoredPowerUps = [...playerState.storedPowerUps];
      newStoredPowerUps.splice(powerUpIndex, 1);

      setPlayerState({
        ...playerState,
        activePowerUp: powerUpType,
        storedPowerUps: newStoredPowerUps,
      });

      setMessage(`${player.charAt(0).toUpperCase() + player.slice(1)} used ${powerUpType} power-up!`);
    },
    [catState, dogState]
  );

  // Updated flipCoin function
  const flipCoin = useCallback(() => {
    if (!raceStarted || raceFinished) return;

    // Base move amounts
    const baseCatMove = Math.floor(Math.random() * 6) + 1;
    const baseDogMove = Math.floor(Math.random() * 6) + 1;

    // Initialize moves and positions
    let catMove = baseCatMove;
    let dogMove = baseDogMove;
    let newCatPosition = catState.position;
    let newDogPosition = dogState.position;
    let messages: string[] = [];

    // Apply Cat's active power-up
    if (catState.activePowerUp) {
      const powerUp = catState.activePowerUp;

      switch (powerUp) {
        case 'speed':
          catMove *= 2;
          messages.push('Cat used Speed power-up! Double movement applied.');
          break;
        case 'snail':
          dogMove = Math.floor(dogMove / 2);
          messages.push('Cat used Snail power-up! Dog slowed down.');
          break;
        case 'wall':
          dogMove = 0;
          messages.push('Cat used Wall power-up! Dog stopped for this turn.');
          break;
        case 'teleport':
          if (catState.position < dogState.position) {
            newCatPosition = dogState.position;
            messages.push("Cat used Teleport power-up! Cat moved to Dog's position.");
          } else {
            messages.push('Cat used Teleport power-up! No effect, Cat is already ahead.');
          }
          break;
        default:
          break;
      }

      // Clear Cat's active power-up
      setCatState((prevState) => ({ ...prevState, activePowerUp: null }));
    }

    // Update Cat's position
    if (newCatPosition === catState.position) {
      newCatPosition += catMove;
    }
    newCatPosition = Math.min(newCatPosition, FINISH_LINE_POSITION);

    // Check for collected power-ups for Cat
    const newCatPowerUps = checkPowerUps(
      catState.position,
      newCatPosition,
      catState.powerUps,
      (powerUp) => {
        setCatState((prevState) => ({
          ...prevState,
          storedPowerUps: [...prevState.storedPowerUps, { type: powerUp }],
        }));
        messages.push(`Cat collected a ${powerUp} power-up!`);
      }
    );

    // Check if Cat has won
    if (newCatPosition >= FINISH_LINE_POSITION) {
      // Update Cat's state
      setCatState((prevState) => ({
        ...prevState,
        position: newCatPosition,
        powerUps: newCatPowerUps,
      }));

      setRaceFinished(true);
      setCatWins((prev) => prev + 1);
      setMessage('Cat wins the race!');
      setRaceHistory((prev) => [
        ...prev,
        { winner: 'Cat', catPosition: newCatPosition, dogPosition: dogState.position },
      ]);
      return; // Stop the function here to prevent Dog from moving
    } else {
      // Update Cat's state
      setCatState((prevState) => ({
        ...prevState,
        position: newCatPosition,
        powerUps: newCatPowerUps,
      }));
    }

    // Apply Dog's active power-up
    if (dogState.activePowerUp) {
      const powerUp = dogState.activePowerUp;

      switch (powerUp) {
        case 'speed':
          dogMove *= 2;
          messages.push('Dog used Speed power-up! Double movement applied.');
          break;
        case 'snail':
          catMove = Math.floor(catMove / 2);
          messages.push('Dog used Snail power-up! Cat slowed down.');
          break;
        case 'wall':
          catMove = 0;
          messages.push('Dog used Wall power-up! Cat stopped for this turn.');
          break;
        case 'teleport':
          if (dogState.position < catState.position) {
            newDogPosition = catState.position;
            messages.push("Dog used Teleport power-up! Dog moved to Cat's position.");
          } else {
            messages.push('Dog used Teleport power-up! No effect, Dog is already ahead.');
          }
          break;
        default:
          break;
      }

      // Clear Dog's active power-up
      setDogState((prevState) => ({ ...prevState, activePowerUp: null }));
    }

    // Update Dog's position
    if (newDogPosition === dogState.position) {
      newDogPosition += dogMove;
    }
    newDogPosition = Math.min(newDogPosition, FINISH_LINE_POSITION);

    // Check for collected power-ups for Dog
    const newDogPowerUps = checkPowerUps(
      dogState.position,
      newDogPosition,
      dogState.powerUps,
      (powerUp) => {
        setDogState((prevState) => ({
          ...prevState,
          storedPowerUps: [...prevState.storedPowerUps, { type: powerUp }],
        }));
        messages.push(`Dog collected a ${powerUp} power-up!`);
      }
    );

    // Check if Dog has won
    if (newDogPosition >= FINISH_LINE_POSITION) {
      // Update Dog's state
      setDogState((prevState) => ({
        ...prevState,
        position: newDogPosition,
        powerUps: newDogPowerUps,
      }));

      setRaceFinished(true);
      setDogWins((prev) => prev + 1);
      setMessage('Dog wins the race!');
      setRaceHistory((prev) => [
        ...prev,
        { winner: 'Dog', catPosition: catState.position, dogPosition: newDogPosition },
      ]);
      return; // Stop the function here
    } else {
      // Update Dog's state
      setDogState((prevState) => ({
        ...prevState,
        position: newDogPosition,
        powerUps: newDogPowerUps,
      }));
    }

    // Generate race commentary
    const commentary = generateRaceCommentary(catMove, dogMove);
    messages.push(commentary);

    // Set the combined message
    setMessage(messages.join(' '));
  }, [
    raceStarted,
    raceFinished,
    catState,
    dogState,
    setCatState,
    setDogState,
    setCatWins,
    setDogWins,
    setRaceFinished,
    setMessage,
    setRaceHistory,
  ]);

  const generateRaceCommentary = (catMove: number, dogMove: number) => {
    const comments = [
      `Cat sprints ${catMove} spaces while Dog bounds ${dogMove} spaces!`,
      `It's neck and neck! Cat leaps ${catMove} and Dog dashes ${dogMove}!`,
      `What a race! Cat pounces ${catMove} while Dog races ${dogMove}!`,
      `They're giving it their all! Cat claws forward ${catMove} as Dog barks ahead ${dogMove}!`,
      `The crowd goes wild! Cat slinks ${catMove} and Dog woofs ${dogMove}!`,
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  };

  // Modified checkPowerUps function to collect only one power-up per turn
  const checkPowerUps = (
    oldPosition: number,
    newPosition: number,
    powerUps: PlayerPowerUp[],
    collectPowerUp: (powerUp: PowerUpType) => void
  ): PlayerPowerUp[] => {
    let powerUpCollected = false;

    const remainingPowerUps = powerUps.filter((powerUp) => {
      if (
        !powerUpCollected &&
        oldPosition < powerUp.position &&
        newPosition >= powerUp.position
      ) {
        collectPowerUp(powerUp.type);
        powerUpCollected = true;
        return false; // Remove this power-up from the track
      }
      return true; // Keep this power-up on the track
    });

    return remainingPowerUps;
  };

  useEffect(() => {
    if (autoPlay && raceStarted && !raceFinished) {
      const intervalId = setInterval(flipCoin, 1000);
      return () => clearInterval(intervalId);
    }
  }, [autoPlay, raceStarted, raceFinished, flipCoin]);

  return {
    catState,
    dogState,
    raceFinished,
    raceStarted,
    catWins,
    dogWins,
    raceHistory,
    message,
    playerSide,
    playMoney,
    autoPlay,
    buyPowerUp,
    usePowerUp,
    flipCoin,
    resetRace,
    startRace,
    setPlayerSide,
    setPlayMoney,
    setAutoPlay,
  };
};
