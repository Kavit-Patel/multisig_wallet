"use client";

import {
  getMultisigWalletProgram,
  getMultisigWalletProgramId,
} from "@project/anchor";
import {
  useConnection,
  WalletContextState,
} from "@solana/wallet-adapter-react";
import {
  AccountMeta,
  Cluster,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import BN from "bn.js";

export function useMultisigWalletProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getMultisigWalletProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = useMemo(
    () => getMultisigWalletProgram(provider, programId),
    [provider, programId]
  );

  const multisigAccounts = useQuery({
    queryKey: ["multisig_wallet", "all", { cluster }],
    queryFn: () => program.account.multisigAccountState.all(),
  });

  const transactionAccounts = useQuery({
    queryKey: ["transaction_accounts", "all", { cluster }],
    queryFn: () => program.account.transactionAccountState.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initializeMultisigAccount = useMutation({
    mutationKey: ["multisig_account", "create", { cluster }],
    mutationFn: async ({
      wallet,
      uniqueName,
      custodiansArray,
      threshold,
      timeLock,
    }: {
      wallet: WalletContextState;
      uniqueName: string;
      custodiansArray: PublicKey[];
      threshold: number;
      timeLock: number;
    }) => {
      const [multisigAccountPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("multisig"),
          wallet.publicKey!.toBuffer(),
          Buffer.from(uniqueName),
        ],
        program.programId
      );
      let tx = await program.methods
        .createMultisigWallet(
          custodiansArray,
          threshold,
          uniqueName,
          new BN(timeLock)
        )
        .accounts({
          owner: wallet.publicKey!,
          multisigAccount: multisigAccountPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      });
      return tx;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return multisigAccounts.refetch();
    },
    onError: (error) => console.log("Failed to initialize account :", error),
  });
  return {
    program,
    programId,
    multisigAccounts,
    multisigAccountsData: multisigAccounts.data,
    transactionAccounts,
    getProgramAccount,
    initializeMultisigAccount,
  };
}

export function useMultisigWalletProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  const transactionToast = useTransactionToast();
  const { program, multisigAccounts, transactionAccounts } =
    useMultisigWalletProgram();

  const multisigAccountQuery = useQuery({
    queryKey: ["multisig_wallet", "fetch", { cluster, account }],
    queryFn: async () => {
      await multisigAccounts.refetch();
      const data = multisigAccounts.data?.filter(
        (acc) => acc.account.owner.toString() == account.toString()
      );
      return data;
    },
  });

  const transactionAccountProposerQuery = useQuery({
    queryKey: ["transaction", "fetch", { cluster, account }],
    queryFn: () =>
      transactionAccounts.data?.filter(
        (acc) => acc.account.proposer.toString() == account.toString()
      ),
  });

  const proposalQuery = useQuery({
    queryKey: ["proposalAsCustodian", { cluster, account }],
    queryFn: () => {
      if (multisigAccounts.data && transactionAccounts.data) {
        const multisigAccountsAsCustodian = multisigAccounts.data.filter(
          (acc) =>
            acc.account.custodians.some(
              (custodian) => custodian.toString() == account.toString()
            )
        );
        const proposalsAsCustodian = transactionAccounts.data.filter((acc) =>
          multisigAccountsAsCustodian.some(
            (el) => el.publicKey.toString() == acc.account.multisig.toString()
          )
        );
        return proposalsAsCustodian;
      } else {
        return [];
      }
    },
  });

  const pendingProposal = useQuery({
    queryKey: ["pending_proposal", "tobe_approved", { cluster, account }],
    queryFn: () => {
      if (proposalQuery.data) {
        const pendingProposals = proposalQuery.data.filter(
          (acc) =>
            !acc.account.isExecuted &&
            !acc.account.signers.some(
              (el) => el.toString() == account.toString()
            )
        );
        return pendingProposals;
      } else {
        return [];
      }
    },
  });

  const createProposal = useMutation({
    mutationKey: ["create", "proposal", { cluster, account }],
    mutationFn: async ({
      wallet,
      uniqueProposalName,
      programId,
      multisigPubkey,
      accountsArr,
      data,
      description,
    }: {
      wallet: WalletContextState;
      uniqueProposalName: string;
      programId: PublicKey;
      multisigPubkey: PublicKey;
      accountsArr: {
        pubkey: PublicKey;
        isSigner: boolean;
        isWritable: boolean;
      }[];
      data: Buffer;
      description: string;
    }) => {
      const [transactionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          multisigPubkey.toBuffer(),
          Buffer.from(uniqueProposalName),
        ],
        program.programId
      );
      const tx = await program.methods
        .createProposal(
          uniqueProposalName,
          programId,
          accountsArr,
          Buffer.from(data),
          description
        )
        .accounts({
          proposer: wallet.publicKey!,
          multisigAccount: multisigPubkey,
          transactionAccount: transactionPda,
          systemProgram: SystemProgram.programId,
        } as any)
        .rpc();
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      });
      return tx;
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return transactionAccounts.refetch();
    },
    onError: (error) => console.log("Failed to create proposal :", error),
  });

  const approveProposal = useMutation({
    mutationKey: ["approve", "proposal", { cluster, account }],
    mutationFn: async ({
      wallet,
      multisigPubkey,
      uniqueProposalName,
    }: {
      wallet: WalletContextState;
      multisigPubkey: PublicKey;
      uniqueProposalName: string;
    }) => {
      const [transactionPda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("proposal"),
          multisigPubkey.toBuffer(),
          Buffer.from(uniqueProposalName),
        ],
        program.programId
      );
      const tx = await program.methods
        .approveProposal()
        .accounts({
          approver: wallet.publicKey!,
          multisigAccount: multisigPubkey,
          transactionAccount: transactionPda,
        } as any)
        .rpc();
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      });
      return tx;
    },
    onSuccess: async (signature) => {
      transactionToast(signature);
      queryClient.invalidateQueries({
        queryKey: ["approve", "proposal", { cluster, account }],
      });
      await transactionAccounts.refetch();

      return;
    },
    onError: (error) => console.log("Failed to approve proposal :", error),
  });
  const executeTransaction = useMutation({
    mutationKey: ["execute", "transaction", { cluster, account }],
    mutationFn: async ({
      wallet,
      multisigPubkey,
      transactionPubkey,
      accounts,
    }: {
      wallet: WalletContextState;
      multisigPubkey: PublicKey;
      transactionPubkey: PublicKey;
      accounts: AccountMeta[];
    }) => {
      const tx = await program.methods
        .executeTransaction()
        .accounts({
          executor: wallet.publicKey!,
          multisigAccount: multisigPubkey,
          transactionAccount: transactionPubkey,
        } as any)
        .remainingAccounts(
          accounts.map((acc) => ({
            pubkey: acc.pubkey,
            isSigner: acc.isSigner,
            isWritable: acc.isWritable,
          }))
        )
        .rpc();
      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: tx,
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      });
      return tx;
    },
    onSuccess: async (signature) => {
      transactionToast(signature);
      queryClient.invalidateQueries({
        queryKey: ["execute", "transaction", { cluster, account }],
      });
      await transactionAccounts.refetch();

      return;
    },
    onError: (error) => console.log("Failed to execute transaction :", error),
  });

  return {
    multisigAccountQuery,
    transactionAccountProposerQuery,
    proposalQuery,
    pendingProposal,
    createProposal,
    approveProposal,
    executeTransaction,
  };
}
