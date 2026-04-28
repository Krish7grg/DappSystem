import Link from "next/link";
import deployedContracts from "~~/contracts/deployedContracts";
import { createPublicClient, formatEther, http } from "viem";
import { hardhat } from "viem/chains";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
});

export default async function ContractPage() {
  const contract = deployedContracts[31337].MilestoneFunding;

  const [goal, totalFunds, goalReached, campaignClosed, currentMilestone, deadline, owner] = await Promise.all([
    publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "goal",
    }),
    publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "totalFunds",
    }),
    publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "goalReached",
    }),
    publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "campaignClosed",
    }),
    publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "currentMilestone",
    }),
    publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "deadline",
    }),
    publicClient.readContract({
      address: contract.address,
      abi: contract.abi,
      functionName: "owner",
    }),
  ]);

  return (
    <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "36px 20px 60px" }}>
      <h1 style={{ margin: "0 0 8px 0", fontSize: "2.2rem", color: "#0f172a" }}>Contract Details</h1>
      <p style={{ margin: "0 0 22px 0", color: "#475569" }}>
        Live blockchain values pulled directly from the deployed contract.
      </p>

      <div style={{ display: "grid", gap: "16px" }}>
        <DataCard label="Contract Address" value={contract.address} />
        <DataCard label="Owner" value={String(owner)} />
        <DataCard label="Goal" value={`${formatEther(goal)} ETH`} />
        <DataCard label="Total Raised" value={`${formatEther(totalFunds)} ETH`} />
        <DataCard label="Current Milestone" value={String(Number(currentMilestone) + 1)} />
        <DataCard label="Goal Reached" value={goalReached ? "Yes" : "No"} />
        <DataCard label="Campaign Closed" value={campaignClosed ? "Yes" : "No"} />
        <DataCard label="Deadline" value={new Date(Number(deadline) * 1000).toLocaleString()} />
      </div>

      <div style={{ marginTop: "28px" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#2563eb", fontWeight: 700 }}>
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

function DataCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
      }}
    >
      <div style={{ color: "#64748b", marginBottom: "6px" }}>{label}</div>
      <div style={{ color: "#0f172a", fontWeight: 700, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}