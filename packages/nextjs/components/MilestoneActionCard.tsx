"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserProvider, Contract } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type MilestoneActionCardProps = {
  contractAddress: string;
  abi: readonly any[];
  milestoneId: number;
  ownerAddress: string;
  isCurrentMilestone: boolean;
};

export default function MilestoneActionCard({
  contractAddress,
  abi,
  milestoneId,
  ownerAddress,
  isCurrentMilestone,
}: MilestoneActionCardProps) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState("");
  const [connectedAddress, setConnectedAddress] = useState("");

  useEffect(() => {
    const getConnectedWallet = async () => {
      try {
        if (!window.ethereum) return;

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setConnectedAddress(address.toLowerCase());
      } catch {
        // ignore silently
      }
    };

    getConnectedWallet();
  }, []);

  const isOwner =
    connectedAddress !== "" && connectedAddress === ownerAddress.toLowerCase();

  const runAction = async (action: "approve" | "reject" | "finalize" | "release") => {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not detected.");
        return;
      }

      setLoadingAction(action);
      setStatus("Preparing transaction...");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, abi as any, signer);

      let tx;

      if (action === "approve") {
        tx = await contract.voteOnMilestone(BigInt(milestoneId), true);
      } else if (action === "reject") {
        tx = await contract.voteOnMilestone(BigInt(milestoneId), false);
      } else if (action === "finalize") {
        tx = await contract.finalizeMilestoneVote(BigInt(milestoneId));
      } else {
        tx = await contract.releaseMilestonePayment(BigInt(milestoneId));
      }

      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("Action completed successfully.");
      router.refresh();
    } catch (error: any) {
      setStatus(error?.shortMessage || error?.message || "Transaction failed.");
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <div style={{ marginTop: "14px" }}>
      <div
        style={{
          marginBottom: "10px",
          padding: "10px 12px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          color: "#334155",
          fontWeight: 500,
        }}
      >
        {isOwner
          ? "You are the owner. Finalize Vote and Release Payment are owner actions."
          : "You are a contributor/viewer. Approve and Reject are contributor actions."}
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => runAction("approve")}
          disabled={loadingAction !== "" || !isCurrentMilestone || isOwner}
          style={{
            ...greenBtn,
            opacity: loadingAction !== "" || !isCurrentMilestone || isOwner ? 0.5 : 1,
            cursor:
              loadingAction !== "" || !isCurrentMilestone || isOwner
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loadingAction === "approve" ? "Approving..." : "Approve"}
        </button>

        <button
          onClick={() => runAction("reject")}
          disabled={loadingAction !== "" || !isCurrentMilestone || isOwner}
          style={{
            ...redBtn,
            opacity: loadingAction !== "" || !isCurrentMilestone || isOwner ? 0.5 : 1,
            cursor:
              loadingAction !== "" || !isCurrentMilestone || isOwner
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loadingAction === "reject" ? "Rejecting..." : "Reject"}
        </button>

        <button
          onClick={() => runAction("finalize")}
          disabled={loadingAction !== "" || !isCurrentMilestone || !isOwner}
          style={{
            ...blueBtn,
            opacity: loadingAction !== "" || !isCurrentMilestone || !isOwner ? 0.5 : 1,
            cursor:
              loadingAction !== "" || !isCurrentMilestone || !isOwner
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loadingAction === "finalize" ? "Finalizing..." : "Finalize Vote"}
        </button>

        <button
          onClick={() => runAction("release")}
          disabled={loadingAction !== "" || !isCurrentMilestone || !isOwner}
          style={{
            ...grayBtn,
            opacity: loadingAction !== "" || !isCurrentMilestone || !isOwner ? 0.5 : 1,
            cursor:
              loadingAction !== "" || !isCurrentMilestone || !isOwner
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loadingAction === "release" ? "Releasing..." : "Release Payment"}
        </button>
      </div>

      {status ? (
        <div
          style={{
            marginTop: "12px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#334155",
            fontWeight: 500,
          }}
        >
          {status}
        </div>
      ) : null}
    </div>
  );
}

const greenBtn: React.CSSProperties = {
  background: "#16a34a",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
};

const redBtn: React.CSSProperties = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
};

const blueBtn: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
};

const grayBtn: React.CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
};