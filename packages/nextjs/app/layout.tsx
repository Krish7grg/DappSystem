
import { Inter, Poppins } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Milestone Funding DApp",
  description: "CN6035 DApp Project",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body
        style={{
          margin: 0,
          background:
            "linear-gradient(135deg, #f8fbff 0%, #eef4ff 35%, #f8faff 100%)",
          color: "#1f2937",
          fontFamily: "var(--font-inter), Arial, sans-serif",
        }}
      >
        <nav
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.82)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              maxWidth: "1180px",
              margin: "0 auto",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#111827",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontWeight: 700,
                fontSize: "1.05rem",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #2563eb, #06b6d4)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 25px rgba(37,99,235,0.25)",
                }}
              >
                MF
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-poppins)", fontWeight: 700 }}>
                  Milestone Funding
                </div>
                <div style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 500 }}>
                  CN6035 DApp
                </div>
              </div>
            </Link>

            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <NavLink href="/">Home</NavLink>
              <NavLink href="/milestones">Milestones</NavLink>
              <NavLink href="/contract">Contract</NavLink>
              <NavLink href="/analytics">Analytics</NavLink>
            </div>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        color: "#374151",
        fontWeight: 600,
        padding: "10px 14px",
        borderRadius: "10px",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </Link>
  );
}