#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod multisig_wallet {
    use super::*;

  pub fn close(_ctx: Context<CloseMultisigWallet>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.multisig_wallet.count = ctx.accounts.multisig_wallet.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.multisig_wallet.count = ctx.accounts.multisig_wallet.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeMultisigWallet>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.multisig_wallet.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeMultisigWallet<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + MultisigWallet::INIT_SPACE,
  payer = payer
  )]
  pub multisig_wallet: Account<'info, MultisigWallet>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseMultisigWallet<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub multisig_wallet: Account<'info, MultisigWallet>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub multisig_wallet: Account<'info, MultisigWallet>,
}

#[account]
#[derive(InitSpace)]
pub struct MultisigWallet {
  count: u8,
}
