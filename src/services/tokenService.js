// src/services/tokenService.js
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';

// The TAIL token mint address
export const TAIL_TOKEN_MINT = new PublicKey('CrbhNV4SUon8QVgCyQg7Khgy6GgcEy8ACDjkKvPrpump');

// Get token balance
export async function getTokenBalance(connection, publicKey) {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      TAIL_TOKEN_MINT,
      publicKey
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return balance.value.uiAmount;
  } catch (error) {
    console.error('Error getting token balance:', error);
    throw error;
  }
}

// Get token account
export async function getTokenAccount(connection, publicKey) {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      TAIL_TOKEN_MINT,
      publicKey
    );
    
    const account = await connection.getParsedAccountInfo(tokenAccount);
    return account.value ? tokenAccount : null;
  } catch (error) {
    console.error('Error getting token account:', error);
    throw error;
  }
}

// Validate token balance
export async function validateTokenBalance(connection, publicKey, amount) {
  try {
    const balance = await getTokenBalance(connection, publicKey);
    return balance >= amount;
  } catch (error) {
    console.error('Error validating token balance:', error);
    throw error;
  }
}