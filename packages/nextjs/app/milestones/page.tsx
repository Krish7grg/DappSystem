
import Link from "next/link";
import deployedContracts from "~~/contracts/deployedContracts";
import { createPublicClient, formatEther, http } from "viem";
import { hardhat } from "viem/chains";
import MilestoneActionCard from "~~/components/MilestoneActionCard";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
});

export default async function MilestonesPage() {
  const contract = deployedContracts[31337].MilestoneFunding;

const [milestoneCount, currentMilestone, owner] = await Promise.all([
  publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "getMilestoneCount",
  }),
  publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "currentMilestone",
  }),
  publicClient.readContract({
    address: contract.address,
    abi: contract.abi,
    functionName: "owner",
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

      const [description, amount, approved, paid, votingOpen, yesVotes, noVotes] = result;

      return {
        id: index + 1,
        description,
        amount: formatEther(amount),
        approved,
        paid,
        votingOpen,
        yesVotes: formatEther(yesVotes),
        noVotes: formatEther(noVotes),
      };
    }),
  );

  return (
    <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "36px 20px 60px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 8px 0", fontSize: "2.2rem", color: "#0f172a" }}>Milestones</h1>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
          View project stages, vote totals, and payment status.
        </p>
      </div>

      <div style={{ display: "grid", gap: "18px" }}>
        {milestones.map(milestone => (
          <div
            key={milestone.id}
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "22px",
              boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "12px",
              }}
            >
              <h2 style={{ margin: 0, color: "#0f172a" }}>
                Milestone {milestone.id}: {milestone.description}
              </h2>
              <span
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  background: "#eef2ff",
                  color: "#3730a3",
                  fontWeight: 700,
                }}
              >
                {milestone.paid ? "Paid" : milestone.approved ? "Approved" : milestone.votingOpen ? "Voting Open" : "Pending"}
              </span>
            </div>

            <p style={{ color: "#475569" }}>Amount: {milestone.amount} ETH</p>
            <p style={{ color: "#475569" }}>Yes Votes: {milestone.yesVotes} ETH</p>
            <p style={{ color: "#475569" }}>No Votes: {milestone.noVotes} ETH</p>


            <MilestoneActionCard
  contractAddress={contract.address}
  abi={contract.abi}
  milestoneId={milestone.id - 1}
  ownerAddress={String(owner)}
  isCurrentMilestone={Number(currentMilestone) === milestone.id - 1}
/>

            
          </div>
        ))}
      </div>

      <div style={{ marginTop: "28px" }}>
        <Link href="/" style={backLink}>
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

const backLink: React.CSSProperties = {
  textDecoration: "none",
  color: "#2563eb",
  fontWeight: 700,
};
