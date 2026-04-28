import Link from "next/link";
import deployedContracts from "~~/contracts/deployedContracts";
import { createPublicClient, formatEther, http } from "viem";
import { hardhat } from "viem/chains";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
});

export default async function AnalyticsPage() {
  const contract = deployedContracts[31337].MilestoneFunding;

  const [goal, totalFunds, milestoneCount] = await Promise.all([
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
      functionName: "getMilestoneCount",
    }),
  ]);

  const milestones = await Promise.all(
    Array.from({ length: Number(milestoneCount) }, (_, i) => i).map(async index => {
      const result = await publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getMilestone",
        args: [BigInt(index)],
      });

      const [description, amount, approved, paid] = result;

      return {
        id: index + 1,
        description,
        amount: Number(formatEther(amount)),
        approved,
        paid,
      };
    }),
  );

  const progress = goal > 0n ? (Number(totalFunds) / Number(goal)) * 100 : 0;

  return (
    <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "36px 20px 60px" }}>
      <h1 style={{ margin: "0 0 8px 0", fontSize: "2.2rem", color: "#0f172a" }}>Analytics</h1>
      <p style={{ margin: "0 0 24px 0", color: "#475569" }}>Simple live chart view based on blockchain data.</p>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "22px",
          boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Funding Progress</h2>
        <div
          style={{
            width: "100%",
            height: "22px",
            background: "#e5e7eb",
            borderRadius: "999px",
            overflow: "hidden",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              width: `${Math.min(progress, 100)}%`,
              height: "100%",
              background: "linear-gradient(90deg, #2563eb, #06b6d4)",
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <p style={{ margin: 0, color: "#475569" }}>
          {formatEther(totalFunds)} ETH raised out of {formatEther(goal)} ETH ({progress.toFixed(1)}%)
        </p>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "22px",
          boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "#0f172a" }}>Milestone Funding Chart</h2>

        <div style={{ display: "grid", gap: "16px", marginTop: "18px" }}>
          {milestones.map(m => (
            <div key={m.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "6px",
                }}
              >
                <strong style={{ color: "#111827" }}>
                  {m.id}. {m.description}
                </strong>
                <span style={{ color: "#475569" }}>{m.amount} ETH</span>
              </div>

              <div
                style={{
                  width: "100%",
                  height: "18px",
                  background: "#e5e7eb",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(m.amount / Number(formatEther(goal))) * 100}%`,
                    height: "100%",
                    background: m.paid
                      ? "#16a34a"
                      : m.approved
                      ? "#2563eb"
                      : "#94a3b8",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "28px" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#2563eb", fontWeight: 700 }}>
          ← Back to Home
        </Link>
      </div>
    </main>
  );
} 