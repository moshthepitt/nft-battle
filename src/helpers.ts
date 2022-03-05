import { PublicKey, Connection } from '@solana/web3.js';
import { deserializeAccount, TokenAccountData } from '@saberhq/token-utils';

export const fetchTokenAccount = async (
    address: PublicKey,
    connection: Connection,
): Promise<TokenAccountData | null> => {
    const tokenAccountInfo = await connection.getAccountInfo(address);
    if (tokenAccountInfo === null) {
        return null;
    }
    return deserializeAccount(tokenAccountInfo.data);
};
