"use client";

import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useEffect, useMemo, useState } from "react";
import { ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import {
  useMultisigWalletProgram,
  useMultisigWalletProgramAccount,
} from "./multisig_wallet-data-access";
import {
  useConnection,
  WalletContextState,
} from "@solana/wallet-adapter-react";
import { initialize } from "next/dist/server/lib/render-server";
import BN from "bn.js";
import { ProgramAccount } from "@coral-xyz/anchor";
import account from "@coral-xyz/anchor/dist/cjs/program/namespace/account";
import toast from "react-hot-toast";
import Loader from "../common/common-loader";
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";

export function MultisigWalletCreate({
  wallet,
}: {
  wallet: WalletContextState;
}) {
  const { multisigAccounts, initializeMultisigAccount } =
    useMultisigWalletProgram();
  console.log("Accounts ", multisigAccounts.data);
  const { multisigAccountQuery } = useMultisigWalletProgramAccount({
    account: wallet.publicKey!,
  });
  const [uniqueName, setUniqueName] = useState<string>("");
  const [custodians, setCustodians] = useState<string>("");
  const [threshold, setThreshold] = useState<string>("");
  const [timeLock, setTimeLock] = useState<string>("");

  const handleCreateMultisigWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    const custodiansArray = custodians
      .split(",")
      .map((key) => new PublicKey(key.trim()));
    await initializeMultisigAccount.mutateAsync({
      wallet,
      uniqueName,
      custodiansArray,
      threshold: +threshold,
      timeLock: +timeLock,
    });
    setUniqueName("");
    setCustodians("");
    setThreshold("");
    setTimeLock("");
  };

  useEffect(() => {
    multisigAccounts.refetch();
    multisigAccountQuery.refetch();
  }, [initializeMultisigAccount.isPending]);
  return (
    <>
      <h1 className="text-3xl font-bold mb-3 text-center">
        Create Multisig Wallet
      </h1>
      <form onSubmit={handleCreateMultisigWallet} className="space-y-5">
        <div>
          <label className="block mb-1">Unique Name</label>
          <input
            type="text"
            value={uniqueName}
            onChange={(e) => setUniqueName(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block mb-1">
            Custodians (comma separated Pubkeys)
          </label>
          <input
            type="text"
            value={custodians}
            onChange={(e) => setCustodians(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            placeholder="Enter pubkeys separated by commas"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Threshold</label>
          <input
            type="text"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Time Lock Duration (seconds)</label>
          <input
            type="text"
            value={timeLock}
            onChange={(e) => setTimeLock(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            required
          />
        </div>
        <div className="w-full text-center">
          <button
            className="btn btn-xs lg:btn-md btn-primary w-[50%] h-[50%]"
            disabled={initializeMultisigAccount.isPending}
          >
            {initializeMultisigAccount.isPending ? (
              <Loader width={10} height={10} color="gray-400" />
            ) : (
              "Create Multisig Wallet"
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export function MultisigWalletList({ wallet }: { wallet: WalletContextState }) {
  const { getProgramAccount } = useMultisigWalletProgram();
  const { multisigAccountQuery } = useMultisigWalletProgramAccount({
    account: wallet.publicKey!,
  });

  if (getProgramAccount.isPending || multisigAccountQuery.isPending) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  return (
    <>
      <div>
        <h2 className="w-full text-center text-lg">Multisig Wallet List</h2>
        {multisigAccountQuery.isPending ? (
          <div className="w-screen h-96 flex justify-center items-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : multisigAccountQuery.data?.length &&
          multisigAccountQuery.data.length > 0 ? (
          <div className="flex px-2 gap-4 flex-col overflow-y-auto h-[calc(100vh-580px)]">
            <PerfectScrollbar></PerfectScrollbar>
            {multisigAccountQuery.data?.map((account) => (
              <MultisigWalletCard
                key={account.publicKey.toString()}
                walletKey={wallet.publicKey!}
                multisigWallets={account}
              />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <h2 className={"text-2xl"}>No Multisig Wallet</h2>
            Create one above to get started.
          </div>
        )}
      </div>
    </>
  );
}

function MultisigWalletCard({
  walletKey,
  multisigWallets,
}: {
  walletKey: PublicKey;
  multisigWallets: ProgramAccount<{
    uniqueName: string;
    custodians: PublicKey[];
    threshold: number;
    owner: PublicKey;
    proposalCount: BN;
    timeLockDuration: BN;
    bump: number;
  }>;
}) {
  const { multisigAccounts } = useMultisigWalletProgram();
  const { multisigAccountQuery } = useMultisigWalletProgramAccount({
    account: walletKey,
  });

  return multisigAccountQuery.isPending || multisigAccounts.isPending ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : multisigWallets.account ? (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content ">
      <div className="card-body items-center text-center">
        <div className="space-y-1">
          <div className="flex flex-col">
            <h2 className="card-title justify-center text-3xl cursor-pointer flex flex-col">
              <span>{multisigWallets.account.uniqueName}</span>
              <span className="text-xs text-gray-500"></span>
              <span className="text-xs text-gray-500">
                Multisig Wallet:{" "}
                <ExplorerLink
                  label={ellipsify(multisigWallets.publicKey.toString())}
                  path={`account/${multisigWallets.publicKey.toString()}`}
                />
              </span>
            </h2>
          </div>
          <div className="flex justify-center flex-col gap-4">
            <div className=" flex flex-col md:flex-row justify-center gap-4"></div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-screen h-96 flex justify-center items-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
}

export function CreateProposal({ wallet }: { wallet: WalletContextState }) {
  const { multisigAccounts, multisigAccountsData } = useMultisigWalletProgram();
  const { createProposal } = useMultisigWalletProgramAccount({
    account: wallet.publicKey!,
  });
  const [multisigs, setMultisigs] = useState<
    | ProgramAccount<{
        uniqueName: string;
        custodians: PublicKey[];
        threshold: number;
        owner: PublicKey;
        proposalCount: BN;
        timeLockDuration: BN;
        bump: number;
      }>[]
    | undefined
  >(undefined);
  const [selectedMultisig, setSelectedMultisig] = useState("");
  const [proposalName, setProposalName] = useState("");
  const [programId, setProgramId] = useState(
    "11111111111111111111111111111111"
  );
  const [account, setAccount] = useState("");
  const [data, setData] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const getMultisigs = async () => {
      await multisigAccounts.refetch();
      if (multisigAccounts.data) {
        const data = multisigAccounts.data.filter(
          (acc) => acc.account.owner.toString() == wallet.publicKey!.toString()
        );
        setMultisigs(data);
      }
    };
    if (!multisigs) {
      getMultisigs();
    }
  }, [multisigAccounts, multisigAccountsData, wallet.publicKey, multisigs]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountsArr = [
      {
        pubkey: new PublicKey(selectedMultisig),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: new PublicKey(account), isSigner: false, isWritable: true },
    ];
    const formatedData = new Uint8Array(8);
    const view = new DataView(formatedData.buffer);
    view.setBigUint64(0, BigInt(+data * LAMPORTS_PER_SOL), false);
    await createProposal.mutateAsync({
      wallet,
      uniqueProposalName: proposalName,
      programId: new PublicKey(programId),
      multisigPubkey: new PublicKey(selectedMultisig),
      accountsArr,
      data: Array.from(formatedData),
      description,
    });
    setProposalName("");
    setSelectedMultisig("");
    setAccount("");
    setData("");
    setDescription("");
  };
  return (
    <>
      {multisigAccounts.isPending ? (
        <div className="w-full h-96 flex justify-center items-center">
          <Loader width={30} height={30} color="gray-300" />
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4 text-center">
            Create Proposal
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Select Multisig Wallet</label>
              <select
                value={selectedMultisig}
                onChange={(e) => setSelectedMultisig(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              >
                <option value="">--Select--</option>
                {multisigs?.map((ms, idx) => (
                  <option key={idx} value={ms.publicKey.toString()}>
                    {ms.account.uniqueName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Unique Proposal Name</label>
              <input
                type="text"
                value={proposalName}
                onChange={(e) => setProposalName(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Program ID</label>
              <input
                type="text"
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Account</label>
              <input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                placeholder="PublicKey sender or receiver"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Sol Tobe Transferred</label>
              <input
                type="text"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 border border-gray-700"
                required
              />
            </div>
            <div className="w-full h-full text-center">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 w-[50%] "
              >
                {createProposal.isPending ? (
                  <Loader width={10} height={10} color="gray-400" />
                ) : (
                  "Create Proposal"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
}

export function ApproveProposal({ wallet }: { wallet: WalletContextState }) {
  const { transactionAccounts, multisigAccounts, program } =
    useMultisigWalletProgram();
  const { approveProposal } = useMultisigWalletProgramAccount({
    account: wallet.publicKey!,
  });
  const [proposals, setProposals] = useState<
    | ProgramAccount<{
        uniqueProposalName: string;
        programId: PublicKey;
        accounts: {
          pubkey: PublicKey;
          isSigner: boolean;
          isWritable: boolean;
        }[];
        signers: PublicKey[];
        isExecuted: boolean;
        description: string;
        proposer: PublicKey;
        multisig: PublicKey;
        timeLockExpiry: BN;
        bump: number;
      }>[]
    | undefined
  >(undefined);

  useEffect(() => {
    const pendingProposals = async () => {
      if (
        transactionAccounts.data &&
        multisigAccounts.data &&
        wallet.publicKey
      ) {
        const multisigAsCustodian = multisigAccounts.data.filter((acc) =>
          acc.account.custodians.some(
            (el) => el.toString() == wallet.publicKey!.toString()
          )
        );
        const proposalAsCustodian = transactionAccounts.data.filter((acc) =>
          multisigAsCustodian.some(
            (el) => el.publicKey.toString() == acc.account.multisig?.toString()
          )
        );
        const myPendingProposal = proposalAsCustodian.filter(
          (acc) =>
            !acc.account.isExecuted &&
            !acc.account.signers.some(
              (acc) => acc.toString() == wallet.publicKey!.toString()
            )
        );
        setProposals(myPendingProposal);
      }
    };
    if (!proposals) {
      pendingProposals();
    }
  }, [transactionAccounts, multisigAccounts, wallet.publicKey, proposals]);

  console.log("Pending proposals", proposals);

  const handleApprove = async (
    multisigPubkey: PublicKey,
    uniqueProposalName: string
  ) => {
    await approveProposal
      .mutateAsync({
        wallet,
        multisigPubkey,
        uniqueProposalName,
      })
      .then(() => setProposals(undefined));
  };
  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-center">Pending Approvals</h1>
      {transactionAccounts.isPending || multisigAccounts.isPending ? (
        <div className="w-full h-96 flex justify-center items-center">
          <Loader width={30} height={30} color="gray-300" />
        </div>
      ) : proposals?.length === 0 ? (
        <p className="text-center">No proposals pending approval.</p>
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <ul className="space-y-4">
            {proposals?.map((proposal, idx) => (
              <li
                key={idx}
                className="p-4 bg-gray-800 rounded shadow text-center"
              >
                <h2 className="text-sm font-semibold flex gap-3">
                  <span>Proposal Name: </span>
                  <span className="">
                    {proposal.account.uniqueProposalName}
                  </span>
                </h2>
                <p className="text-sm font-semibold flex gap-3">
                  <span>Proposal Desc: </span>
                  <span className="">{proposal.account.description}</span>
                </p>
                <button
                  onClick={() =>
                    handleApprove(
                      proposal.account.multisig,
                      proposal.account.uniqueProposalName
                    )
                  }
                  className="mt-2 px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-gray-600 font-semibold w-full h-full"
                >
                  {approveProposal.isPending ? (
                    <Loader width={10} height={10} color="gray-400" />
                  ) : (
                    "Approve Proposal"
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export function ExecuteTransaction({ wallet }: { wallet: WalletContextState }) {
  const { transactionAccounts, multisigAccounts, program } =
    useMultisigWalletProgram();
  const { executeTransaction } = useMultisigWalletProgramAccount({
    account: wallet.publicKey!,
  });
  const [proposals, setProposals] = useState<
    | ProgramAccount<{
        uniqueProposalName: string;
        programId: PublicKey;
        accounts: {
          pubkey: PublicKey;
          isSigner: boolean;
          isWritable: boolean;
        }[];
        signers: PublicKey[];
        isExecuted: boolean;
        description: string;
        proposer: PublicKey;
        multisig: PublicKey;
        timeLockExpiry: BN;
        bump: number;
      }>[]
    | undefined
  >(undefined);

  useEffect(() => {
    const pendingExecution = async () => {
      if (
        transactionAccounts.data &&
        multisigAccounts.data &&
        wallet.publicKey
      ) {
        const multisigAsCustodian = multisigAccounts.data.filter((acc) =>
          acc.account.custodians.some(
            (el) => el.toString() == wallet.publicKey!.toString()
          )
        );
        const proposalAsCustodian = transactionAccounts.data.filter((acc) =>
          multisigAsCustodian.some(
            (el) => el.publicKey.toString() == acc.account.multisig?.toString()
          )
        );
        const myPendingProposal = proposalAsCustodian.filter(
          (acc) =>
            !acc.account.isExecuted &&
            acc.account.proposer.toString() == wallet.publicKey!.toString()
        );
        setProposals(myPendingProposal);
      }
    };
    if (!proposals) {
      pendingExecution();
    }
  }, [transactionAccounts, multisigAccounts, wallet.publicKey, proposals]);

  const handleExecute = async (
    multisigPubkey: PublicKey,
    transactionPubkey: PublicKey,
    accounts: any[]
  ) => {
    await executeTransaction
      .mutateAsync({
        wallet,
        multisigPubkey,
        transactionPubkey,
        accounts,
      })
      .then(() => setProposals(undefined));
  };
  return (
    <>
      <h1 className="text-3xl font-bold mb-4 text-center">
        Pending Executions
      </h1>
      {transactionAccounts.isPending || multisigAccounts.isPending ? (
        <div className="w-full h-96 flex justify-center items-center">
          <Loader width={30} height={30} color="gray-300" />
        </div>
      ) : proposals?.length === 0 ? (
        <p className="text-center">No Pending Approval.</p>
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <ul className="space-y-4">
            {proposals?.map((proposal, idx) => (
              <li
                key={idx}
                className="p-4 bg-gray-800 rounded shadow text-center"
              >
                <h2 className="text-sm font-semibold flex gap-3">
                  <span>Proposal Name: </span>
                  <span className="">
                    {proposal.account.uniqueProposalName}
                  </span>
                </h2>
                <p className="text-sm font-semibold flex gap-3">
                  <span>Proposal Desc: </span>
                  <span className="">{proposal.account.description}</span>
                </p>
                <button
                  onClick={() =>
                    handleExecute(
                      proposal.account.multisig,
                      proposal.publicKey,
                      proposal.account.accounts
                    )
                  }
                  className="mt-2 px-4 py-2 bg-green-600 rounded hover:bg-green-500 text-gray-600 font-semibold w-full h-full"
                >
                  {executeTransaction.isPending ? (
                    <Loader width={10} height={10} color="gray-400" />
                  ) : (
                    "Execute Transaction"
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
