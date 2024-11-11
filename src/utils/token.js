// src/utils/token.js
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import { PublicKey, Transaction } from '@solana/web3.js';

export const TAIL_TOKEN_MINT = new PublicKey('CrbhNV4SUon8QVgCyQg7Khgy6GgcEy8ACDjkKvPrpump');

export async function getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  owner
) {
  try {
    const associatedToken = await getAssociatedTokenAddress(
      mint,
      owner,
      false
    );

    // Check if account exists
    try {
      const tokenAccount = await connection.getAccountInfo(associatedToken);
      
      if (tokenAccount) {
        return associatedToken;
      }
    } catch (error) {
      console.log("Token account does not exist");
    }

    // Create token account if it doesn't exist
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer,
        associatedToken,
        owner,
        mint
      )
    );

    await connection.sendTransaction(transaction, [payer]);
    
    return associatedToken;
  } catch (error) {
    console.error("Error getting or creating token account:", error);
    throw error;
  }
}

export async function getTokenBalance(connection, tokenAccount) {
  try {
    const accountInfo = await connection.getTokenAccountBalance(tokenAccount);
    return accountInfo.value.uiAmount;
  } catch (error) {
    console.error("Error getting token balance:", error);
    return 0;
  }
}