"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserProvider, Contract, parseEther } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type WalletContributionCardProps = {
  contractAddress: string;
  abi: readonly any[];
};

export default function WalletContributionCard({
  contractAddress,
  abi,
}: WalletContributionCardProps) {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isContributing, setIsContributing] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not detected. Please install MetaMask in your browser.");
        return;
      }

      setIsConnecting(true);
      setStatus("");

      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setStatus("Wallet connected successfully.");
    } catch (error: any) {
      setStatus(error?.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const contribute = async () => {
    try {
      if (!window.ethereum) {
        setStatus("MetaMask not detected.");
        return;
      }

      if (!amount || Number(amount) <= 0) {
        setStatus("Please enter a valid ETH amount.");
        return;
      }

      setIsContributing(true);
      setStatus("Preparing transaction...");

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new Contract(contractAddress, abi, signer);

      const tx = await contract.contribute({
        value: parseEther(amount),
      });

      setStatus("Transaction submitted. Waiting for confirmation...");
      await tx.wait();

      setStatus("Contribution successful.");
      setAmount("");
      router.refresh();
    } catch (error: any) {
      setStatus(error?.shortMessage || error?.message || "Contribution failed.");
    } finally {
      setIsContributing(false);
    }
  };

  return (
    <div
      style={{
        marginTop: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          style={{
            background: "#0f172a",
            color: "#ffffff",
            border: "none",
            borderRadius: "14px",
            padding: "14px 20px",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {isConnecting ? "Connecting..." : walletAddress ? "Wallet Connected" : "Connect Wallet"}
        </button>

        {walletAddress ? (
          <span
            style={{
              padding: "12px 14px",
              borderRadius: "12px",
              background: "#eff6ff",
              color: "#1d4ed8",
              fontWeight: 600,
              wordBreak: "break-all",
            }}
          >
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Enter ETH amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{
            padding: "14px",
            minWidth: "260px",
            borderRadius: "14px",
            border: "1px solid #d1d5db",
            fontSize: "1rem",
            outline: "none",
            background: "#fff",
          }}
        />
        <button
          onClick={contribute}
          disabled={isContributing}
          style={{
            background: "linear-gradient(135deg, #2563eb, #06b6d4)",
            color: "#ffffff",
            border: "none",
            borderRadius: "14px",
            padding: "14px 22px",
            cursor: "pointer",
            fontWeight: 700,
            boxShadow: "0 12px 25px rgba(37,99,235,0.22)",
          }}
        >
          {isContributing ? "Contributing..." : "Contribute"}
        </button>
      </div>

      {status ? (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "14px",
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