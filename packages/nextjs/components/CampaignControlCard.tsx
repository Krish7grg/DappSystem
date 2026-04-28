"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserProvider, Contract } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type CampaignControlCardProps = {
  contractAddress: string;
  abi: readonly any[];
  currentMilestone: number;
  milestoneCount: number;
  ownerAddress: string;
  goalReached: boolean;
  campaignClosed: boolean;
};

export default function CampaignControlCard({
  contractAddress,
  abi,
  currentMilestone,
  milestoneCount,
  ownerAddress,
  goalReached,
  campaignClosed,
}: CampaignControlCardProps) {
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

    const hasRemainingMilestones = currentMilestone < milestoneCount;

  const runAction = async (action: "startVoting" | "refund" | "closeCampaign") => {
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

      if (action === "startVoting") {
        tx = await contract.startMilestoneVoting(BigInt(currentMilestone));
      } else if (action === "refund") {
        tx = await contract.claimRefund();
      } else {
        tx = await contract.closeCampaign();
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
    <div style={{ display: "grid", gap: "12px" }}>
      <div
        style={{
          padding: "12px 14px",
          borderRadius: "12px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          color: "#334155",
          fontWeight: 500,
        }}
      >
        <div>
          <strong>Connected Role:</strong> {isOwner ? "Owner" : "Contributor / Viewer"}
        </div>
        <div style={{ marginTop: "6px" }}>
          <strong>Owner-only actions:</strong> Start Milestone Voting, Close Campaign
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => runAction("startVoting")}
          disabled={loadingAction !== "" || !isOwner || !goalReached || campaignClosed || !hasRemainingMilestones
           }
          style={{
            ...blueBtn,
            opacity: loadingAction !== "" || !isOwner || !goalReached || campaignClosed || !hasRemainingMilestones? 0.5 : 1,
            cursor:
              loadingAction !== "" || !isOwner || !goalReached || campaignClosed || !hasRemainingMilestones
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loadingAction === "startVoting" ? "Starting..." : "Start Milestone Voting"}
        </button>

        <button
  onClick={() => runAction("refund")}
  disabled={loadingAction !== "" || goalReached}
  style={{
    ...grayBtn,
    opacity: loadingAction !== "" || goalReached ? 0.5 : 1,
    cursor:
      loadingAction !== "" || goalReached
        ? "not-allowed"
        : "pointer",
  }}
>
  {loadingAction === "refund" ? "Claiming..." : "Claim Refund"}
</button>

        <button
          onClick={() => runAction("closeCampaign")}
          disabled={loadingAction !== "" || !isOwner || campaignClosed}
          style={{
            ...redBtn,
            opacity: loadingAction !== "" || !isOwner || campaignClosed ? 0.5 : 1,
            cursor:
              loadingAction !== "" || !isOwner || campaignClosed
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loadingAction === "closeCampaign" ? "Closing..." : "Close Campaign"}
        </button>
      </div>

      {status ? (
        <div
          style={{
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

const redBtn: React.CSSProperties = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontWeight: 700,
};