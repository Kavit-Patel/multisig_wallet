import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { MultisigWallet } from '../target/types/multisig_wallet'

describe('multisig_wallet', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.MultisigWallet as Program<MultisigWallet>

  const multisig_walletKeypair = Keypair.generate()

  it('Initialize MultisigWallet', async () => {
    await program.methods
      .initialize()
      .accounts({
        multisig_wallet: multisig_walletKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([multisig_walletKeypair])
      .rpc()

    const currentCount = await program.account.multisig_wallet.fetch(multisig_walletKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment MultisigWallet', async () => {
    await program.methods.increment().accounts({ multisig_wallet: multisig_walletKeypair.publicKey }).rpc()

    const currentCount = await program.account.multisig_wallet.fetch(multisig_walletKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment MultisigWallet Again', async () => {
    await program.methods.increment().accounts({ multisig_wallet: multisig_walletKeypair.publicKey }).rpc()

    const currentCount = await program.account.multisig_wallet.fetch(multisig_walletKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement MultisigWallet', async () => {
    await program.methods.decrement().accounts({ multisig_wallet: multisig_walletKeypair.publicKey }).rpc()

    const currentCount = await program.account.multisig_wallet.fetch(multisig_walletKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set multisig_wallet value', async () => {
    await program.methods.set(42).accounts({ multisig_wallet: multisig_walletKeypair.publicKey }).rpc()

    const currentCount = await program.account.multisig_wallet.fetch(multisig_walletKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the multisig_wallet account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        multisig_wallet: multisig_walletKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.multisig_wallet.fetchNullable(multisig_walletKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
