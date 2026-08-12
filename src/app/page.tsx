import Link from "next/link";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🎙️</span> BoloBiz
        </div>
        <div>
          {session ? (
            <Link href="/dashboard" style={styles.navBtn}>Dashboard</Link>
          ) : (
            <Link href="/login" style={styles.navBtn}>Sign In</Link>
          )}
        </div>
      </div>

      <div style={styles.heroSection}>
        <div style={styles.badge}>
          <span>Voice-First AI Business OS</span>
        </div>
        <h1 style={styles.title}>
          Run Your Business. <br />
          <span style={styles.highlight}>बस बोलकर।</span>
        </h1>
        <p style={styles.subtitle}>
          जिस भाषा में आप बात करते हैं, उसी भाषा में अपना बिज़नेस चलाइए। <br />
          Speak in Hindi, English, or Hinglish to manage transactions, customers, and inventory.
        </p>

        <div style={styles.ctaGroup}>
          {session ? (
            <Link href="/dashboard" style={styles.primaryBtn}>
              Enter Dashboard 📊
            </Link>
          ) : (
            <>
              <Link href="/signup" style={styles.primaryBtn}>
                Start Free Trial 🚀
              </Link>
              <Link href="/login" style={styles.secondaryBtn}>
                Login to Account
              </Link>
            </>
          )}
        </div>

        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🎙️</div>
            <h3>Voice Interface</h3>
            <p>Speak naturally like you're talking to an manager. "Ramesh ko 500 udhaar diya."</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📉</div>
            <h3>Automatic Khata</h3>
            <p>Every audio transaction is split and posted to your ledger automatically.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📦</div>
            <h3>Smart Inventory</h3>
            <p>Keep track of products, add stocks, and receive automated low-stock warnings.</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔐</div>
            <h3>Strict Security</h3>
            <p>Multi-tenant database rules guarantee that your business logs are isolated and safe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    background: "radial-gradient(circle at top left, #1e1b4b 0%, #0a0f1d 70%)",
    padding: "0 2rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "2rem 0",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
  },
  logo: {
    fontSize: "1.75rem",
    fontWeight: 800,
    letterSpacing: "-0.5px",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#fff",
  },
  logoIcon: {
    fontSize: "2rem",
  },
  navBtn: {
    padding: "0.6rem 1.5rem",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    fontWeight: 500,
    background: "rgba(255, 255, 255, 0.05)",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  heroSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    maxWidth: "1000px",
    margin: "4rem auto",
    animation: "slide-up 0.5s ease-out",
  },
  badge: {
    background: "linear-gradient(90deg, rgba(6,182,212,0.15) 0%, rgba(99,102,241,0.15) 100%)",
    border: "1px solid rgba(6, 182, 212, 0.3)",
    padding: "0.5rem 1.25rem",
    borderRadius: "30px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--accent-cyan)",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "4.5rem",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-2px",
    marginBottom: "1.5rem",
    color: "#fff",
  },
  highlight: {
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.35rem",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    maxWidth: "750px",
    marginBottom: "3rem",
  },
  ctaGroup: {
    display: "flex",
    gap: "1rem",
    marginBottom: "5rem",
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-teal) 100%)",
    padding: "1rem 2.25rem",
    borderRadius: "30px",
    fontWeight: 600,
    color: "#0a0f1d",
    boxShadow: "0 4px 20px rgba(6, 182, 212, 0.4)",
    transition: "all 0.2s ease",
    fontSize: "1.05rem",
  },
  secondaryBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "1rem 2.25rem",
    borderRadius: "30px",
    fontWeight: 600,
    transition: "all 0.2s ease",
    fontSize: "1.05rem",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.5rem",
    width: "100%",
    marginTop: "2rem",
  },
  featureCard: {
    background: "rgba(17, 24, 37, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "2rem 1.5rem",
    textAlign: "left" as const,
    transition: "all 0.3s ease",
    backdropFilter: "blur(8px)",
  },
  featureIcon: {
    fontSize: "2.5rem",
    marginBottom: "1rem",
  },
};
