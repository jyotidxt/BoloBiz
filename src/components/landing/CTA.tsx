"use client";

import Link from "next/link";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function CTA() {
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.15 });

  return (
    <section id="cta" style={styles.section}>
      <div
        ref={observerRef}
        style={{
          ...styles.banner,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.96)",
          transition: "opacity var(--transition-slow), transform var(--transition-slow)",
        }}
      >
        <div style={styles.leftVisual}>
          <div style={styles.micCircle}>🎙️</div>
        </div>

        <div style={styles.centerText}>
          <h2 style={styles.title}>बोलकर अपने बिज़नेस को आसान बनाएं</h2>
          <p style={styles.subtitle}>
            BoloBiz के साथ समय बचाएं और अपने बिज़नेस को नई ऊंचाइयों पर ले जाएं।
          </p>
        </div>

        <div style={styles.rightAction}>
          <Link href="/signup" style={styles.whiteBtn}>
            अभी शुरू करें - यह मुफ्त है <span style={styles.arrow}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "60px 2rem 80px 2rem",
    backgroundColor: "var(--bg-primary)",
    display: "flex",
    justifyContent: "center",
  },
  banner: {
    maxWidth: "1200px",
    width: "100%",
    background: "var(--accent-gradient)",
    borderRadius: "24px",
    padding: "3rem 4rem",
    boxShadow: "0 15px 35px rgba(219, 39, 119, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "2.5rem",
    position: "relative" as const,
    overflow: "hidden",
    flexWrap: "wrap" as const,
    "@media(max-width: 900px)": {
      flexDirection: "column" as const,
      textAlign: "center" as const,
      padding: "3rem 2rem",
    },
  },
  leftVisual: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  micCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.75rem",
    boxShadow: "0 4px 15px rgba(0,0,0,0.06)",
    animation: "pulse-wave 2s infinite ease-in-out",
  },
  centerText: {
    flex: 1,
    textAlign: "left" as const,
    "@media(max-width: 900px)": {
      textAlign: "center" as const,
    },
  },
  title: {
    fontSize: "2.25rem",
    fontWeight: 800,
    color: "#ffffff",
    marginBottom: "0.5rem",
    letterSpacing: "-0.5px",
    "@media(max-width: 600px)": {
      fontSize: "1.75rem",
    },
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 1.5,
  },
  rightAction: {
    display: "flex",
    alignItems: "center",
  },
  whiteBtn: {
    background: "#ffffff",
    color: "#7c3aed",
    fontWeight: 700,
    fontSize: "1rem",
    padding: "0.95rem 2rem",
    borderRadius: "30px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
    },
  },
  arrow: {
    fontSize: "1.1rem",
    fontWeight: "bold",
  },
};
