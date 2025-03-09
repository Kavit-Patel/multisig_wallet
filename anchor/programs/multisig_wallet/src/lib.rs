#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("6x4Z1KDT9p9fVN6PnGnxRhEKiStF1ty7KDwT4Yzw7G9b");

#[program]
pub mod multisig_wallet {
    use super::*;
    pub fn create_multisig_wallet(ctx:Context<CreateMultisigWallet>,custodians:Vec<Pubkey>,threshold:u8,unique_name:String,time_lock_duration:u64)->Result<()>{
        let multisig_account = &mut ctx.accounts.multisig_account;
        require!(!custodians.is_empty(),ErrorCode::NoCustodian);
        require!(custodians.len() <= 5, ErrorCode::TooManyCustodians);
        require!(threshold>0,ErrorCode::NoThreshold);
        require!(threshold<=custodians.len() as u8,ErrorCode::InvalidThreshold);

        let mut unique_custodians = custodians.clone();
        unique_custodians.sort();
        unique_custodians.dedup();
        require!(unique_custodians.len()==custodians.len(),ErrorCode::DuplicateCustodian);

        multisig_account.unique_name = unique_name;
        multisig_account.custodians = custodians;
        multisig_account.threshold = threshold;
        multisig_account.owner = ctx.accounts.owner.key();
        multisig_account.proposal_count = 0;
        multisig_account.time_lock_duration = time_lock_duration;
        multisig_account.bump = ctx.bumps.multisig_account;
        Ok(())
    }
    pub fn create_proposal(ctx:Context<CreateProposal>,unique_proposal_name:String,program_id:Pubkey,accounts:Vec<TransactionAccount>,data:Vec<u8>,description:String)->Result<()>{
      let multisig_account = &mut ctx.accounts.multisig_account;
      let transaction_account = &mut ctx.accounts.transaction_account;
      let proposer_account = &ctx.accounts.proposer;

      require!(accounts.len() <= 10, ErrorCode::TooManyAccounts);
      require!(multisig_account.custodians.contains(proposer_account.key), ErrorCode::UnAuthorizedToPropose);

      transaction_account.unique_proposal_name = unique_proposal_name;
      transaction_account.program_id = program_id;
      transaction_account.accounts = accounts;
      transaction_account.data = data;
      transaction_account.signers = vec![proposer_account.key()];
      transaction_account.is_executed = false;
      transaction_account.description = description;
      transaction_account.proposer = proposer_account.key();
      transaction_account.multisig = multisig_account.key();
      transaction_account.time_lock_expiry = Clock::get()?.unix_timestamp as u64 + multisig_account.time_lock_duration;
      transaction_account.bump = ctx.bumps.transaction_account;
      multisig_account.proposal_count +=1;


      Ok(())
    }
    pub fn approve_proposal(ctx:Context<ApproveProposal>)->Result<()>{
      let multisig_account = &ctx.accounts.multisig_account;
      let transaction_account = &mut ctx.accounts.transaction_account;
      let approver = &ctx.accounts.approver;


      require!(multisig_account.custodians.contains(approver.key),ErrorCode::UnAuthorizedApprover);
      require!(!transaction_account.signers.contains(approver.key),ErrorCode::DuplicateCustodianApproval);
      if !transaction_account.signers.contains(approver.key) {
        transaction_account.signers.push(approver.key());
      }

      Ok(())
    }
    pub fn execute_transaction(ctx:Context<ExecuteTransaction>)->Result<()>{
      let multisig_account = &ctx.accounts.multisig_account;
      let transaction_account = &mut ctx.accounts.transaction_account;
      let executor = &ctx.accounts.executor;

      require!(transaction_account.multisig == multisig_account.key(),ErrorCode::TransactionNotFound);
      require!(!transaction_account.is_executed,ErrorCode::TransactionExecuted);
      require!(executor.key()==transaction_account.proposer,ErrorCode::UnAuthorizedExecutor);
      
      let current_time = Clock::get()?.unix_timestamp as u64;
      
      require!(current_time>transaction_account.time_lock_expiry,ErrorCode::TimeLockNotExpired);
      require!(transaction_account.signers.len() as u8>=multisig_account.threshold,ErrorCode::NotEnoughApprover);
      require!(ctx.remaining_accounts.len() == transaction_account.accounts.len(),ErrorCode::AccountMismatch);
      
      for (i, account) in ctx.remaining_accounts.iter().enumerate() {
        let expected = &transaction_account.accounts[i];
        
        require!(*account.key == expected.pubkey, ErrorCode::AccountMismatch);
    }
    let tx = anchor_lang::solana_program::instruction::Instruction {
      program_id: transaction_account.program_id,
      accounts: ctx.remaining_accounts.iter().enumerate().map(|(i, acc)| {
          let original = &transaction_account.accounts[i];
          AccountMeta {
              pubkey: *acc.key,
              is_signer: original.is_signer,
              is_writable: original.is_writable,
          }
      }).collect(),
      data: transaction_account.data.clone(),
  };

  let multisig_signer_seeds: &[&[u8]] = &[
      b"multisig",
      multisig_account.owner.as_ref(),
      multisig_account.unique_name.as_bytes(),
      &[multisig_account.bump],
  ];
  
  anchor_lang::solana_program::program::invoke_signed(&tx, &ctx.remaining_accounts, &[multisig_signer_seeds])?;
  
      transaction_account.is_executed = true;
      Ok(())
    }

    pub fn add_custodian(
      ctx: Context<ModifyCustodians>,
      new_custodian: Pubkey,
  ) -> Result<()> {
      let multisig = &mut ctx.accounts.multisig;
      require!(
          !multisig.custodians.contains(&new_custodian),
          ErrorCode::CustodianAlreadyExists
      );

      multisig.custodians.push(new_custodian);


      Ok(())
  }

  pub fn remove_custodian(
      ctx: Context<ModifyCustodians>,
      custodian: Pubkey,
  ) -> Result<()> {
      let multisig = &mut ctx.accounts.multisig;
      let position = multisig
          .custodians
          .iter()
          .position(|&c| c == custodian)
          .ok_or(ErrorCode::CustodianNotFound)?;

      multisig.custodians.remove(position);
      
      require!(
          multisig.threshold <= multisig.custodians.len() as u8,
          ErrorCode::InvalidThreshold
      );

      Ok(())
  }

  pub fn change_threshold(
      ctx: Context<ModifyCustodians>,
      new_threshold: u8,
  ) -> Result<()> {
      let multisig = &mut ctx.accounts.multisig;
      require!(new_threshold > 0, ErrorCode::NoThreshold);
      require!(
          new_threshold <= multisig.custodians.len() as u8,
          ErrorCode::InvalidThreshold
      );

      multisig.threshold = new_threshold;

      Ok(())
  }

  pub fn set_time_lock_duration(
      ctx: Context<ModifyCustodians>,
      new_duration: u64,
  ) -> Result<()> {
      let multisig = &mut ctx.accounts.multisig;
      multisig.time_lock_duration = new_duration;
      Ok(())
  }
}

#[account]
#[derive(InitSpace)]
pub struct MultisigAccountState{
    #[max_len(250)]
    pub unique_name:String,
    #[max_len(5)]
    pub custodians:Vec<Pubkey>,
    pub threshold:u8,
    pub owner:Pubkey,
    pub proposal_count:u64,
    pub time_lock_duration:u64,
    pub bump:u8
    
}

#[account]
#[derive(InitSpace)]
pub struct TransactionAccountState{
  #[max_len(25)]
  pub unique_proposal_name:String,
  pub program_id:Pubkey,
  #[max_len(10)]
  pub accounts:Vec<TransactionAccount>,
  #[max_len(150)]
  pub data:Vec<u8>,
  #[max_len(10)]
  pub signers:Vec<Pubkey>,
  pub is_executed:bool,
  #[max_len(200)]
  pub description:String,
  pub proposer:Pubkey,
  pub multisig:Pubkey,
  pub time_lock_expiry:u64,
  pub bump:u8

}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct TransactionAccount {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

impl TransactionAccount {
    pub fn to_account_meta(&self) -> AccountMeta {
        AccountMeta {
            pubkey: self.pubkey,
            is_signer: self.is_signer,
            is_writable: self.is_writable,
        }
    }
}


#[derive(Accounts)]
#[instruction(custodians: Vec<Pubkey>, threshold: u8, unique_name: String)]
pub struct CreateMultisigWallet<'info>{
    #[account(mut)]
    pub owner:Signer<'info>,
    #[account(
        init,
        payer=owner,
        space=8+MultisigAccountState::INIT_SPACE,
        seeds=[b"multisig",owner.key().as_ref(),unique_name.as_bytes()],
        bump
    )]
    pub multisig_account:Account<'info,MultisigAccountState>,
    pub system_program:Program<'info,System>
}
#[derive(Accounts)]
#[instruction(unique_proposal_name:String)]
pub struct CreateProposal<'info>{
  #[account(mut)]
  pub proposer:Signer<'info>,
  #[account(
    mut,
    seeds=[b"multisig",multisig_account.owner.as_ref(),multisig_account.unique_name.as_bytes()],
    bump = multisig_account.bump
  )]
  pub multisig_account:Account<'info,MultisigAccountState>,
  #[account(
    init,
    payer=proposer,
    space = 8 + TransactionAccountState::INIT_SPACE,
    seeds = [b"proposal",multisig_account.key().as_ref(),unique_proposal_name.as_bytes()],
    bump
  )]
  pub transaction_account:Account<'info,TransactionAccountState>,
  pub system_program:Program<'info,System>
}

#[derive(Accounts)]
pub struct ApproveProposal<'info>{
  #[account(mut)]
  pub approver:Signer<'info>,
  #[account(
    mut,
    seeds = [b"multisig",multisig_account.owner.as_ref(),multisig_account.unique_name.as_bytes()],
    bump = multisig_account.bump,
  )]
  pub multisig_account:Account<'info,MultisigAccountState>,
  #[account(
    mut,
    seeds=[b"proposal",multisig_account.key().as_ref(),transaction_account.unique_proposal_name.as_bytes()],
    bump = transaction_account.bump,
    constraint = transaction_account.multisig == multisig_account.key()

  )]
  pub transaction_account:Account<'info,TransactionAccountState>
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info>{
  pub executor:Signer<'info>,
  #[account(
    mut,
    seeds=[b"multisig",multisig_account.owner.as_ref(),multisig_account.unique_name.as_bytes()],
    bump=multisig_account.bump
  )]
  pub multisig_account:Account<'info,MultisigAccountState>,
  #[account(
    mut,
    seeds=[b"proposal",multisig_account.key().as_ref(),transaction_account.unique_proposal_name.as_bytes()],
    bump=transaction_account.bump,
    constraint = transaction_account.multisig == multisig_account.key(),
  )]
  pub transaction_account:Account<'info,TransactionAccountState>,

}

#[derive(Accounts)]
pub struct ModifyCustodians<'info> {
    #[account(mut, has_one = owner)]
    pub multisig: Account<'info, MultisigAccountState>,
    pub owner: Signer<'info>,
}

#[error_code]
enum ErrorCode {
  #[msg("No custodian provided !")]
  NoCustodian,
  #[msg("Maximum 5 custodians allowed !")]
  TooManyCustodians,
  #[msg("Threshold cannot be zero !")]
  NoThreshold,
  #[msg("Threshold value exceeds custodian length !")]
  InvalidThreshold,
  #[msg("Only custodians can propose !")]
  UnAuthorizedToPropose,
  #[msg("Accounts cannot exceed max length 10")]
  TooManyAccounts,
  #[msg("Duplicate custodian not allowed !")]
  DuplicateCustodian,
  #[msg("You are not a custodian !")]
  UnAuthorizedApprover,
  #[msg("You are not proposer of this transaction !")]
  UnAuthorizedExecutor,
  #[msg("Expiry time hans't reached !")]
  TimeLockNotExpired,
  #[msg("Transaction not found !")]
  TransactionNotFound,
  #[msg("Transaction already executed !")]
  TransactionExecuted,
  #[msg("Not Enough approver !")]
  NotEnoughApprover,
  #[msg("You have already approved this proposal")]
  DuplicateCustodianApproval,
  #[msg("Provided accounts doesn't match !")]
  AccountMismatch,
  #[msg("Accounts doesn't fulfill required criteria !")]
  AccountPermissionMismatch,
  #[msg("Custodian already exists")]
    CustodianAlreadyExists,
  #[msg("Custodian not found")]
    CustodianNotFound,
}