"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function Vision() {
  const { language, t } = useLanguage();
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <section id="vision" style={styles.section}>
      <div style={styles.container}>
        {/* Core Vision statement */}
        <div
          ref={observerRef}
          key={language}
          className="animate-fade-in"
          style={{
            ...styles.visionBlock,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(25px)",
            transition: "opacity var(--transition-slow), transform var(--transition-slow)",
          }}
        >
          <div style={styles.badge}>{t("vision.badge")}</div>
          <h2 style={styles.heading}>{t("vision.heading")}</h2>
          <blockquote style={styles.blockquote}>
            “ {t("vision.blockquotePart1")} <br />
            <span style={styles.highlight}>{t("vision.blockquoteHighlight")}</span> ”
          </blockquote>
          <p style={styles.description}>
            {t("vision.description")}
          </p>
        </div>

        {/* Scalability Path Grid */}
        <div style={styles.pathGrid}>
          <div className="glass-panel" style={styles.pathCard}>
            <div style={styles.pathIcon}>🏬</div>
            <h4 style={styles.pathTitle}>{t("vision.path1Title")}</h4>
            <p style={styles.pathDesc}>{t("vision.path1Desc")}</p>
          </div>
          <div className="glass-panel" style={styles.pathCard}>
            <div style={styles.pathIcon}>📈</div>
            <h4 style={styles.pathTitle}>{t("vision.path2Title")}</h4>
            <p style={styles.pathDesc}>{t("vision.path2Desc")}</p>
          </div>
          <div className="glass-panel" style={styles.pathCard}>
            <div style={styles.pathIcon}>🏢</div>
            <h4 style={styles.pathTitle}>
              {t("vision.path3Title")} <span style={styles.comingSoon}>{t("vision.comingSoon")}</span>
            </h4>
            <p style={styles.pathDesc}>{t("vision.path3Desc")}</p>
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
    borderTop: "1px solid rgba(0,0,0,0.02)",
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
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    padding: "0.35rem 0.85rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    color: "var(--accent-purple)",
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
    fontSize: "2.5rem",
    fontWeight: 800,
    lineHeight: 1.25,
    color: "var(--text-primary)",
    marginBottom: "2rem",
    letterSpacing: "-1px",
  },
  highlight: {
    background: "var(--accent-gradient)",
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
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 10px 30px var(--glass-shadow)",
  },
  pathIcon: {
    fontSize: "2.25rem",
    marginBottom: "1rem",
  },
  pathTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  comingSoon: {
    background: "var(--bg-tertiary)",
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
