// src/services/gameService.js
import { getTokenAccount, validateTokenBalance } from './tokenService';
import { GAME_STATUS } from '../constants/game';

const GAME_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export async function validateGameCreation(connection, publicKey, stake) {
  if (!publicKey) {
    throw new Error('Wallet not connected');
  }

  const tokenAccount = await getTokenAccount(connection, publicKey);
  if (!tokenAccount) {
    throw new Error('TAIL token account not found');
  }

  const hasBalance = await validateTokenBalance(connection, publicKey, stake);
  if (!hasBalance) {
    throw new Error('Insufficient TAIL balance');
  }

  return true;
}

export function validateGameJoin(game, publicKey) {
  if (!publicKey) {
    throw new Error('Wallet not connected');
  }

  if (game.status !== GAME_STATUS.WAITING) {
    throw new Error('Game is no longer available');
  }

  if (game.creator === publicKey.toString()) {
    throw new Error('Cannot join your own game');
  }

  const createdTime = new Date(game.createdAt).getTime();
  if (Date.now() - createdTime > GAME_TIMEOUT) {
    throw new Error('Game has expired');
  }

  return true;
}

export function isGameExpired(game) {
  const createdTime = new Date(game.createdAt).getTime();
  return Date.now() - createdTime > GAME_TIMEOUT;
}