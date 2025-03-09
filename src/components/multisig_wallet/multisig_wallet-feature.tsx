"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useMultisigWalletProgram } from "./multisig_wallet-data-access";
import {
  ApproveProposal,
  CreateProposal,
  ExecuteTransaction,
  MultisigWalletCreate,
  MultisigWalletList,
} from "./multisig_wallet-ui";
import { usePathname } from "next/navigation";

export default function MultisigWalletFeature() {
  const wallet = useWallet();
  let pathname = usePathname();

  return wallet && wallet.publicKey ? (
    <>
      {pathname == "/multisig_wallet" ? (
        <div className="w-[calc(100vw-30px)] md:w-[calc(100vw-300px)] lg: md:w-[calc(100vw-800px)] flex flex-col gap-10 py-6">
          <MultisigWalletCreate wallet={wallet} />

          <MultisigWalletList wallet={wallet} />
        </div>
      ) : pathname == "/create_proposal" ? (
        <div className="w-[calc(100vw-30px)] md:w-[calc(100vw-300px)] lg: md:w-[calc(100vw-800px)] flex flex-col gap-10 py-6">
          <CreateProposal wallet={wallet} />
        </div>
      ) : pathname == "/approve_proposal" ? (
        <div className="w-[calc(100vw-30px)] md:w-[calc(100vw-300px)] lg: md:w-[calc(100vw-800px)] flex flex-col gap-10 py-6">
          <ApproveProposal wallet={wallet} />
        </div>
      ) : pathname == "/execute_transaction" ? (
        <div className="w-[calc(100vw-30px)] md:w-[calc(100vw-300px)] lg: md:w-[calc(100vw-500px)] flex flex-col gap-10 py-6">
          <ExecuteTransaction wallet={wallet} />
        </div>
      ) : (
        <></>
      )}
    </>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
