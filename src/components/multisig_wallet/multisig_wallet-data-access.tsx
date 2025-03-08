'use client'

import { getMultisigWalletProgram, getMultisigWalletProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useMultisigWalletProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getMultisigWalletProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getMultisigWalletProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['multisig_wallet', 'all', { cluster }],
    queryFn: () => program.account.multisig_wallet.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['multisig_wallet', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ multisig_wallet: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useMultisigWalletProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useMultisigWalletProgram()

  const accountQuery = useQuery({
    queryKey: ['multisig_wallet', 'fetch', { cluster, account }],
    queryFn: () => program.account.multisig_wallet.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['multisig_wallet', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ multisig_wallet: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['multisig_wallet', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ multisig_wallet: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['multisig_wallet', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ multisig_wallet: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['multisig_wallet', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ multisig_wallet: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
