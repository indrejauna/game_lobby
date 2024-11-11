// src/utils/gameProgram.js
import { PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createApproveInstruction } from '@solana/spl-token';
import { TAIL_TOKEN_MINT } from '../App';

// This would be your deployed program ID
export const GAME_PROGRAM_ID = new PublicKey('YOUR_DEPLOYED_PROGRAM_ID');

export const findGameAccount = async (gameId) => {
  return await PublicKey.findProgramAddress(
    [Buffer.from('game'), Buffer.from(gameId.toString())],
    GAME_PROGRAM_ID
  );
};

export const findEscrowAccount = async (gameId) => {
  return await PublicKey.findProgramAddress(
    [Buffer.from('escrow'), Buffer.from(gameId.toString())],
    GAME_PROGRAM_ID
  );
};

export async function createGameInstruction(
  connection,
  payer,
  stakeAmount,
  gameId
) {
  const [gameAccount] = await findGameAccount(gameId);
  const [escrowAccount] = await findEscrowAccount(gameId);
  
  // Get player's token account
  const playerTokenAccount = await getAssociatedTokenAddress(
    TAIL_TOKEN_MINT,
    payer
  );

  // Create the game instruction
  const createGameIx = new TransactionInstruction({
    programId: GAME_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: gameAccount, isSigner: false, isWritable: true },
      { pubkey: escrowAccount, isSigner: false, isWritable: true },
      { pubkey: playerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TAIL_TOKEN_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([
      0, // Instruction index for create_game
      ...new Uint8Array(new BigInt64Array([BigInt(stakeAmount)]).buffer),
    ]),
  });

  // Approve tokens to be moved to escrow
  const approveIx = createApproveInstruction(
    playerTokenAccount,
    escrowAccount,
    payer,
    BigInt(stakeAmount)
  );

  return [approveIx, createGameIx];
}

export async function joinGameInstruction(
  connection,
  payer,
  gameId
) {
  const [gameAccount] = await findGameAccount(gameId);
  const [escrowAccount] = await findEscrowAccount(gameId);
  
  // Get player's token account
  const playerTokenAccount = await getAssociatedTokenAddress(
    TAIL_TOKEN_MINT,
    payer
  );

  // Get game data to know stake amount
  const gameData = await connection.getAccountInfo(gameAccount);
  // Parse game data to get stake amount
  const stakeAmount = parseGameData(gameData).stakeAmount;

  // Join game instruction
  const joinGameIx = new TransactionInstruction({
    programId: GAME_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: gameAccount, isSigner: false, isWritable: true },
      { pubkey: escrowAccount, isSigner: false, isWritable: true },
      { pubkey: playerTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TAIL_TOKEN_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]), // Instruction index for join_game
  });

  // Approve tokens to be moved to escrow
  const approveIx = createApproveInstruction(
    playerTokenAccount,
    escrowAccount,
    payer,
    BigInt(stakeAmount)
  );

  return [approveIx, joinGameIx];
}

export async function fetchActiveGames(connection) {
  try {
    const accounts = await connection.getProgramAccounts(GAME_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: 'game', // Filter for game accounts
          },
        },
      ],
    });

    return accounts.map(({ pubkey, account }) => {
      const data = parseGameData(account.data);
      return {
        id: pubkey.toBase58(),
        ...data,
      };
    });
  } catch (error) {
    console.error('Error fetching games:', error);
    throw error;
  }
}

function parseGameData(data) {
  // This should match your program's game state structure
  const view = new DataView(data.buffer);
  return {
    creator: new PublicKey(data.slice(8, 40)),
    stakeAmount: view.getBigUint64(40, true),
    status: view.getUint8(48),
    players: data.slice(49, 81).some(b => b !== 0) 
      ? [
          new PublicKey(data.slice(49, 81)),
          new PublicKey(data.slice(81, 113))
        ]
      : [new PublicKey(data.slice(49, 81))],
    currentRound: view.getUint8(113),
    createdAt: view.getBigUint64(114, true),
  };
}