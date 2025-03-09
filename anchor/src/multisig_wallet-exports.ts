// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import MultisigWalletIDL from "../target/idl/multisig_wallet.json";
import type { MultisigWallet } from "../target/types/multisig_wallet";

// Re-export the generated IDL and type
export { MultisigWallet, MultisigWalletIDL };

// The programId is imported from the program IDL.
export const MULTISIG_WALLET_PROGRAM_ID = new PublicKey(
  MultisigWalletIDL.address
);

// This is a helper function to get the MultisigWallet Anchor program.
export function getMultisigWalletProgram(
  provider: AnchorProvider,
  address?: PublicKey
) {
  return new Program(
    {
      ...MultisigWalletIDL,
      address: address ? address.toBase58() : MultisigWalletIDL.address,
    } as MultisigWallet,
    provider
  );
}

// This is a helper function to get the program ID for the MultisigWallet program depending on the cluster.
export function getMultisigWalletProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
      // This is the program ID for the MultisigWallet program on devnet and testnet.
      return new PublicKey("6x4Z1KDT9p9fVN6PnGnxRhEKiStF1ty7KDwT4Yzw7G9b");
    case "mainnet-beta":
    default:
      return MULTISIG_WALLET_PROGRAM_ID;
  }
}
