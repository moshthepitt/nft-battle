import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Transaction } from "@solana/web3.js";
import { createMintAndVault, u64 } from "@saberhq/token-utils";
import { Battle } from "../target/types/battle";
import { fetchTokenAccount } from "../src/helpers";
import { initializeIx } from "../src/instructions/initialize";
import { expect } from "chai";

describe("battle", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Battle as Program<Battle>;

  it("Is initialized!", async () => {
    // Create user NFT for test
    const [mint, token] = await createMintAndVault(
      program.provider as any,
      new u64(1),
      program.provider.wallet.publicKey,
      0
    );

    const initializeIxResult = await initializeIx({
      connection: program.provider.connection,
      player1Key: program.provider.wallet.publicKey,
      player1TokenKey: token,
      programId: program.programId,
    });

    const tx = new Transaction().add(...initializeIxResult.instructions);
    const txId = await program.provider.send(tx);
    console.log("Transaction signature", txId);

    const battleAccount = await program.account.battleAccount.fetch(
      initializeIxResult.battleAccountKey
    );
    expect(battleAccount.authority.toBase58()).to.equal(
      program.provider.wallet.publicKey.toBase58()
    );
    expect(battleAccount.token.toBase58()).to.equal(
      initializeIxResult.vaultTokenAccountKey.toBase58()
    );

    const player1TokenData = await fetchTokenAccount(
      token,
      program.provider.connection
    );
    const vaultTokenData = await fetchTokenAccount(
      initializeIxResult.vaultTokenAccountKey,
      program.provider.connection
    );

    expect(player1TokenData).to.not.be.null;
    expect(vaultTokenData).to.not.be.null;
    expect(player1TokenData?.mint.toBase58()).to.equal(
      vaultTokenData?.mint.toBase58()
    );
    expect(player1TokenData?.amount.toNumber()).to.equal(0);
    expect(vaultTokenData?.amount.toNumber()).to.equal(1);
  });
});
