import Link from "next/link";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />
      <div className="glass-panel animate-fade-in" style={styles.card}>
        <span style={styles.icon}>🔍</span>
        <h1 style={styles.title}>404 - Page Not Found</h1>
        <p style={styles.subtitle}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/" className="auth-btn-primary" style={{ textDecoration: "none", width: "auto", padding: "0.75rem 1.75rem" }}>
          ← Return to Home
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1.5rem",
    background: "var(--bg-radial)",
    position: "relative" as const,
    overflow: "hidden",
  },
  card: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    maxWidth: "480px",
    width: "100%",
    padding: "3rem 2rem",
    borderRadius: "24px",
    gap: "1.25rem",
    zIndex: 1,
  },
  icon: {
    fontSize: "3.5rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
};
