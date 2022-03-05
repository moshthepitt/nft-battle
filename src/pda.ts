import { PublicKey } from "@solana/web3.js";
import { BATTLE_SEED, BATTLE_TOKEN_SEED } from './contants';

/**
 * Returns the public key and bump seed for the Battle Account
 *
 * @param player1TokenKey - Player1 token account public key
 * @param player1Key - Player 1 public key
 * @param programId - deployed program ID for Battle program
 * @returns [Battle Account public key, bump seed]
 */
 export const findBattleAccount = async (
  player1TokenKey: PublicKey,
  player1Key: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [BATTLE_SEED, player1TokenKey.toBuffer(), player1Key.toBuffer()],
    programId
  );
};

/**
 * Returns the public key and bump seed for the Vault Token Account
 *
 * @param player1TokenKey - The Player's token account public key
 * @param player1Key - The Player's public key
 * @param programId - deployed program ID for Battle program
 * @returns [Vault Token Account public key, bump seed]
 */
 export const findVaultTokenAccount = async (
  playerTokenKey: PublicKey,
  playerKey: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> => {
  return await PublicKey.findProgramAddress(
    [BATTLE_TOKEN_SEED, playerTokenKey.toBuffer(), playerKey.toBuffer()],
    programId
  );
};