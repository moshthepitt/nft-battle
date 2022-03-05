import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from '@saberhq/token-utils';
import { findBattleAccount, findVaultTokenAccount } from '../pda';
import { fetchTokenAccount } from '../helpers';
import { getProgram } from '../config';

interface InitializeParams {
    connection: Connection;
    player1Key: PublicKey;
    player1TokenKey: PublicKey;
    programId: PublicKey;
}

export const initializeIx = async (params: InitializeParams) => {
    const { connection, player1Key, player1TokenKey, programId } = params;
    const tokenData = await fetchTokenAccount(player1TokenKey, connection);
    if (!tokenData) {
        throw new Error('The token account does not exist');
    }
    const program = getProgram(connection, programId);
    const [battleAccountKey] = await findBattleAccount(player1TokenKey, player1Key, programId);
    const [vaultTokenAccountKey] = await findVaultTokenAccount(player1TokenKey, player1Key, programId);

    const instructions = []
    instructions.push(
        program.instruction.initialize({
            accounts: {
                player1: player1Key,
                battleAccount: battleAccountKey,
                player1Token: player1TokenKey,
                player1Mint: tokenData.mint,
                vaultToken: vaultTokenAccountKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: SYSVAR_RENT_PUBKEY,
            },
        })
    );

    return {
        battleAccountKey,
        vaultTokenAccountKey,
        instructions,
    }
}