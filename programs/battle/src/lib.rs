use anchor_lang::prelude::*;
use anchor_spl::token::{
    self, Burn, CloseAccount, Mint, MintTo, SetAuthority, Token, TokenAccount, Transfer,
};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub const BATTLE: &str = "battle";
pub const BATTLE_TOKEN: &str = "battle_token";

#[program]
pub mod battle {
    use super::*;

    /// Player 1 initializes the battle
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // check that we have enough of player1_token
        if ctx.accounts.player1_token.amount < 1 {
            return Err(Error::from(ProgramError::InsufficientFunds).with_source(source!()));
        }
        // transfer player1_token into vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.player1_token.to_account_info(),
                    to: ctx.accounts.vault_token.to_account_info(),
                    authority: ctx.accounts.player1.to_account_info(),
                },
            ),
            1, // hard coded as 1
        )?;

        let now = Clock::get()?.unix_timestamp;
        let vault_account = &mut ctx.accounts.battle_account;
        vault_account.authority = ctx.accounts.player1.key();
        vault_account.token = ctx.accounts.vault_token.key();
        vault_account.mint = ctx.accounts.player1_mint.key();
        vault_account.created_at = now;

        Ok(())
    }

    /// Player 2 joins the battle
    pub fn join(ctx: Context<JoinBattle>) -> Result<()> {
        // transfer player2 token to vault
        // set joined_at on vault_account
        Ok(())
    }

    /// The battle is resolved and a winner is picked
    pub fn battle(ctx: Context<Battle>) -> Result<()> {
        // flip coin
        // winner gets both NFTs transferred to them
        Ok(())
    }
}

/// Accounts struct for Initialize instruction
#[derive(Accounts)]
pub struct Initialize<'info> {
    /// Player 1.
    #[account(mut)]
    pub player1: Signer<'info>,

    /// The battle account: holds state for the battle
    #[account(
        init,
        payer=player1,
        seeds = [
            BATTLE.as_bytes(),
            player1_token.key().to_bytes().as_ref(),
            player1.key().to_bytes().as_ref()
        ],
        bump,
    )]
    pub battle_account: Box<Account<'info, BattleAccount>>,

    /// The player1 token account.
    #[account(
        mut,
        constraint = player1_token.mint == player1_mint.key() @ErrorCode::IncorrectMintAddress,
        constraint = player1_token.owner == *player1.key @ErrorCode::IncorrectOwner,
    )]
    pub player1_token: Box<Account<'info, TokenAccount>>,

    /// The player1 mint account.
    pub player1_mint: Box<Account<'info, Mint>>,

    /// The vault token account.
    #[account(
        init,
        seeds = [
            BATTLE_TOKEN.as_bytes(),
            player1_token.key().to_bytes().as_ref(),
            player1.key().to_bytes().as_ref(),
        ],
        bump,
        payer = player1,
        token::mint = player1_mint,
        token::authority = battle_account,
    )]
    pub vault_token: Box<Account<'info, TokenAccount>>,

    /// Token program.
    pub token_program: Program<'info, Token>,

    /// Solana system program.
    pub system_program: Program<'info, System>,

    /// Solana rent sysvar
    pub rent: Sysvar<'info, Rent>,
}

/// Accounts struct for JoinBattle instruction
#[derive(Accounts)]
pub struct JoinBattle {}

/// Accounts struct for Battle instruction
#[derive(Accounts)]
pub struct Battle {}

/// A BattleAccount holds information about a particular battle
#[account]
#[derive(Default)]
pub struct BattleAccount {
    /// The owner of the account.
    pub authority: Pubkey,
    /// The staked token account address.
    pub token: Pubkey,
    /// The staked token account address.
    pub mint: Pubkey,
    /// Timestamp of time of creation.
    pub created_at: i64,
    /// Timestamp of time that player2 joined.
    pub joined_at: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The owner is incorrect")]
    IncorrectOwner,
    #[msg("The mint address is incorrect")]
    IncorrectMintAddress,
}
