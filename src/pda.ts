import { PublicKey } from "@solana/web3.js";
import { BATTLE_SEED } from './contants';

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