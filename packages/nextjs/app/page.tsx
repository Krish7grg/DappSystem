
import Link from "next/link";
import deployedContracts from "~~/contracts/deployedContracts";
import { createPublicClient, formatEther, http } from "viem";
import { hardhat } from "viem/chains";
import WalletContributionCard from "~~/components/WalletContributionCard";
import CampaignControlCard from "~~/components/CampaignControlCard";

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http("http://127.0.0.1:8545"),
});

export default async function Home() {
  const contract = deployedContracts[31337].MilestoneFunding;

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

let campaignMeta = null;

try {
  const res = await fetch(`${backendUrl}/api/campaigns/${contract.address}`, {
    cache: "no-store",
  });

  if (res.ok) {
    campaignMeta = await res.json();
  }
} catch (error) {
  console.log("Backend fetch failed:", error);
}

  const [goal, totalFunds, currentMilestone, milestoneCount, goalReached, campaignClosed, deadline, owner] =
    await Promise.all([
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
        functionName: "currentMilestone",
      }),
      publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "getMilestoneCount",
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
        functionName: "deadline",
      }),
        publicClient.readContract({
        address: contract.address,
        abi: contract.abi,
        functionName: "owner",
      }),

    ]);

  const progress = Number(totalFunds) > 0 ? Math.min((Number(totalFunds) / Number(goal)) * 100, 100) : 0;
  const deadlineDate = new Date(Number(deadline) * 1000).toLocaleString();

  return (
    <main style={{ minHeight: "100vh" }}>
      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "44px 20px 24px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "26px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(37,99,235,0.08)",
                color: "#2563eb",
                fontWeight: 600,
                marginBottom: "18px",
              }}
            >
              🚀 Live blockchain dashboard
            </div>

            <h1
              style={{
                margin: "0 0 14px 0",
                fontFamily: "var(--font-poppins)",
                fontSize: "3rem",
                lineHeight: 1.1,
                color: "#0f172a",
              }}
            >
              Milestone Funding DApp
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "1.08rem",
                lineHeight: 1.8,
                color: "#475569",
                maxWidth: "720px",
              }}
            >
              {campaignMeta?.description ||
              "A decentralized crowdfunding platform where contributors fund a campaign, vote on milestones, and release payments only when project stages are approved."} 
            </p>

            <div
              style={{
                marginTop: "26px",
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <Link href="/milestones" style={primaryLink}>
                View Milestones
              </Link>
              <Link href="/analytics" style={secondaryLink}>
                Open Analytics
              </Link>
              <Link href="/contract" style={secondaryLink}>
                Contract Details
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "18px",
              boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
              transition: "transform 0.25s ease",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80"
              alt="Blockchain dashboard"
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
                borderRadius: "18px",
              }}
            />
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "8px 20px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <InfoCard title="Funding Goal" value={`${formatEther(goal)} ETH`} icon="🎯" />
          <InfoCard title="Current Raised" value={`${formatEther(totalFunds)} ETH`} icon="💰" />
          <InfoCard
  title="Current Milestone"
  value={`${Math.min(Number(currentMilestone) + 1, Number(milestoneCount))} / ${Number(milestoneCount)}`}
  icon="📌"
/>
          
          <InfoCard
            title="Campaign Status"
            value={campaignClosed ? "Closed" : goalReached ? "Goal Reached" : "Open"}
            icon="📊"
          />
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 24px" }}>
        <div style={panelStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={sectionTitle}>Live Funding Progress</h2>
              <p style={paragraphStyle}>Current raised amount compared with contract goal.</p>
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "12px",
                background: "rgba(6,182,212,0.08)",
                color: "#0891b2",
                fontWeight: 700,
              }}
            >
              {progress.toFixed(1)}%
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "18px",
              borderRadius: "999px",
              background: "#e5e7eb",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #2563eb, #06b6d4)",
                transition: "width 0.6s ease",
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
            <MiniBox label="Goal Reached" value={goalReached ? "Yes" : "No"} />
            <MiniBox label="Campaign Closed" value={campaignClosed ? "Yes" : "No"} />
            <MiniBox label="Deadline" value={deadlineDate} />
            <MiniBox label="Contract Address" value={`${contract.address.slice(0, 8)}...${contract.address.slice(-6)}`} />
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 24px" }}>
  <div style={panelStyle}>
    <h2 style={sectionTitle}>Campaign Metadata (MongoDB)</h2>
    <p style={paragraphStyle}>
      This data is stored off-chain in MongoDB and loaded through the Express backend.
    </p>
  

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "14px",
        marginTop: "16px",
      }}
    >
      <MiniBox label="Title" value={campaignMeta?.title || "Not loaded"} />
      <MiniBox label="Owner Address" value={campaignMeta?.ownerAddress || "Not loaded"} />
      <MiniBox
        label="Goal (Backend)"
        value={campaignMeta ? `${campaignMeta.goalEth} ETH` : "Not loaded"}
      />
      <MiniBox label="Status (Backend)" value={campaignMeta?.status || "Not loaded"} />
    </div>
  </div>
</section>


      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 24px" }}>
        <div style={panelStyle}>
          <h2 style={sectionTitle}>Contribute to Campaign</h2>
          <p style={paragraphStyle}>
            Connect your wallet and send ETH to the deployed MilestoneFunding contract.
          </p>
          <WalletContributionCard
           contractAddress={contract.address}
            abi={contract.abi}
          />
          
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 50px" }}>
        <div style={panelStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h2 style={sectionTitle}>Quick Navigation</h2>
              <p style={paragraphStyle}>Open dedicated pages to explore milestones, analytics, and contract details.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <Link href="/milestones" style={secondaryLink}>
              Milestones Page
            </Link>
            <Link href="/analytics" style={secondaryLink}>
              Analytics Page
            </Link>
            <Link href="/contract" style={secondaryLink}>
              Contract Page
            </Link>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 50px" }}>
  <div style={panelStyle}>
    <h2 style={sectionTitle}>Campaign Controls</h2>
    <p style={paragraphStyle}>
      Start voting for the current milestone, claim refunds when allowed, or close the campaign.
    </p>

    <div style={{ marginTop: "16px" }}>
      <CampaignControlCard
  contractAddress={contract.address}
  abi={contract.abi}
  currentMilestone={Number(currentMilestone)}
  milestoneCount={Number(milestoneCount)}
  ownerAddress={String(owner)}
  goalReached={goalReached}
  campaignClosed={campaignClosed}
/>
    </div>
  </div>
</section>


    </main>
  );
}

function InfoCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: "1.4rem", marginBottom: "12px" }}>{icon}</div>
      <h3 style={cardTitle}>{title}</h3>
      <p style={cardValue}>{value}</p>
    </div>
  );
}

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "14px",
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontWeight: 700, color: "#0f172a" }}>{value}</div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "18px",
  padding: "20px",
  boxShadow: "0 10px 28px rgba(15,23,42,0.06)",
};

const cardTitle: React.CSSProperties = {
  margin: "0 0 8px 0",
  fontSize: "0.96rem",
  color: "#64748b",
};

const cardValue: React.CSSProperties = {
  margin: 0,
  fontSize: "1.55rem",
  fontWeight: 700,
  color: "#0f172a",
};

const panelStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  border: "1px solid #e5e7eb",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 18px 40px rgba(15,23,42,0.06)",
  backdropFilter: "blur(10px)",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 8px 0",
  color: "#0f172a",
  fontFamily: "var(--font-poppins)",
  fontSize: "1.45rem",
};

const paragraphStyle: React.CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.7,
};


const primaryLink: React.CSSProperties = {
  textDecoration: "none",
  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
  color: "#fff",
  padding: "14px 20px",
  borderRadius: "14px",
  fontWeight: 700,
  boxShadow: "0 12px 25px rgba(37,99,235,0.22)",
};

const secondaryLink: React.CSSProperties = {
  textDecoration: "none",
  background: "#fff",
  color: "#0f172a",
  border: "1px solid #d1d5db",
  padding: "14px 20px",
  borderRadius: "14px",
  fontWeight: 700,
};