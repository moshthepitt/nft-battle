import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getATAAddress,createATAInstruction } from '@saberhq/token-utils';
import { findBattleAccount } from '../pda';
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

    const instructions = []

    const vaultTokenAccountKey = await getATAAddress({ mint: tokenData.mint, owner: battleAccountKey });
    const vaultTokenAccountInfo = await program.provider.connection.getParsedAccountInfo(vaultTokenAccountKey);
    if (vaultTokenAccountInfo.value === null) {
        // create if it does not exist
        instructions.push(
            createATAInstruction({
                address: vaultTokenAccountKey,
                mint: tokenData.mint,
                owner: battleAccountKey,
                payer: player1Key,
            }),
        );
    }

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
            },
        })
    );

    return {
        battleAccountKey,
        vaultTokenAccountKey,
        instructions,
    }
}