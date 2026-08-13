"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function Vision() {
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <section id="vision" style={styles.section}>
      <div style={styles.container}>
        {/* Core Vision statement */}
        <div
          ref={observerRef}
          style={{
            ...styles.visionBlock,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(25px)",
            transition: "opacity var(--transition-slow), transform var(--transition-slow)",
          }}
        >
          <div style={styles.badge}>💡 Core Philosophy</div>
          <h2 style={styles.heading}>तकनीक आपके लिए आसान होनी चाहिए।</h2>
          <blockquote style={styles.blockquote}>
            “ आपको technology सीखने की ज़रूरत नहीं। <br />
            <span style={styles.highlight}>Technology को आपको समझना चाहिए।</span> ”
          </blockquote>
          <p style={styles.description}>
            We believe language and technical skill should never stand in the way of managing a business. 
            BoloBiz is built to empower merchants, store owners, and freelancers to handle bookkeeping, stock cataloging, and audits using natural everyday voice commands.
          </p>
        </div>

        {/* Scalability Path Grid */}
        <div style={styles.pathGrid}>
          <div className="glass-panel" style={styles.pathCard}>
            <div style={styles.pathIcon}>🏬</div>
            <h4 style={styles.pathTitle}>Micro & Local Shop</h4>
            <p style={styles.pathDesc}>Manage ledger entries, credits, sales, and products catalog instantly via voice interface. Ideal for kirana shops, stalls, and freelancers.</p>
          </div>
          <div className="glass-panel" style={styles.pathCard}>
            <div style={styles.pathIcon}>📈</div>
            <h4 style={styles.pathTitle}>Growing Business</h4>
            <p style={styles.pathDesc}>Get comprehensive reports, invite multiple employees to log entries, and track inventory stock alerts automatically.</p>
          </div>
          <div className="glass-panel" style={styles.pathCard}>
            <div style={styles.pathIcon}>🏢</div>
            <h4 style={styles.pathTitle}>
              Multi-Branch Setup <span style={styles.comingSoon}>Coming Later</span>
            </h4>
            <p style={styles.pathDesc}>Aggregate metrics from multiple shops, monitor branch-level insights, and assign permissions for decentralized inventory teams.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "100px 2rem",
    backgroundColor: "var(--bg-secondary)",
    borderTop: "1px solid rgba(255,255,255,0.02)",
    position: "relative" as const,
  },
  container: {
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "5rem",
  },
  visionBlock: {
    textAlign: "center" as const,
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  badge: {
    background: "rgba(99, 102, 241, 0.1)",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    padding: "0.35rem 0.85rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    color: "var(--accent-indigo)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    marginBottom: "1.5rem",
  },
  heading: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
    marginBottom: "1.5rem",
  },
  blockquote: {
    fontSize: "2.75rem",
    fontWeight: 800,
    lineHeight: 1.25,
    color: "#fff",
    marginBottom: "2rem",
    letterSpacing: "-1px",
    "@media(max-width: 600px)": {
      fontSize: "2rem",
    },
  },
  highlight: {
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  description: {
    fontSize: "1.1rem",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
  },
  pathGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  pathCard: {
    padding: "2rem 1.5rem",
    borderRadius: "12px",
    textAlign: "left" as const,
    display: "flex",
    flexDirection: "column" as const,
  },
  pathIcon: {
    fontSize: "2.25rem",
    marginBottom: "1rem",
  },
  pathTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  comingSoon: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "var(--text-muted)",
    fontSize: "0.65rem",
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  pathDesc: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
};
