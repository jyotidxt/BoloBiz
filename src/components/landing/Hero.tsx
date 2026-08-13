"use client";

import Link from "next/navigation"; // wait, standard Link is from "next/link", let's use that
import LinkComponent from "next/link";
import VoiceDemo from "./VoiceDemo";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function Hero() {
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section
      id="hero"
      ref={observerRef}
      style={{
        ...styles.hero,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transition: "opacity var(--transition-slow), transform var(--transition-slow)",
      }}
    >
      <div style={styles.container}>
        {/* Left Side: Product Details */}
        <div style={styles.leftCol}>
          <div style={styles.badge}>
            <span style={styles.badgeSpark}>✨</span> AI Business Assistant
          </div>
          
          <h1 style={styles.title}>
            Run Your Business. <br />
            <span style={styles.highlight}>बस बोलकर।</span>
          </h1>
          
          <p style={styles.subtitle}>
            BoloBiz आपकी अपनी भाषा में आपके बिज़नेस को समझता है और आपकी मदद करता है बढ़ाने में।
          </p>

          {/* Bullet points from image */}
          <div style={styles.bulletsList}>
            <div style={styles.bulletItem}>
              <span style={styles.checkIcon}>✓</span> हिंदी, English और Hinglish में बात करें
            </div>
            <div style={styles.bulletItem}>
              <span style={styles.checkIcon}>✓</span> अपने बिज़नेस का पूरा हिसाब रखें
            </div>
            <div style={styles.bulletItem}>
              <span style={styles.checkIcon}>✓</span> AI से तुरंत जवाब पाएं
            </div>
            <div style={styles.bulletItem}>
              <span style={styles.checkIcon}>✓</span> समय बचाएँ, तनाव कम करें
            </div>
          </div>

          <div style={styles.ctaGroup}>
            <LinkComponent href="/signup" style={styles.primaryBtn}>
              🎙️ बोलकर शुरुआत करें
            </LinkComponent>
            <a href="#how-it-works" style={styles.secondaryBtn}>
              <span style={styles.playIcon}>▶</span> देखें कैसे काम करता है
            </a>
          </div>

          {/* Social Proof ratings block from image */}
          <div style={styles.ratingsBlock}>
            <div style={styles.avatarGroup}>
              <div style={{ ...styles.miniAvatar, background: "#f87171" }}>👨‍💼</div>
              <div style={{ ...styles.miniAvatar, background: "#60a5fa", marginLeft: "-8px" }}>👩‍💼</div>
              <div style={{ ...styles.miniAvatar, background: "#34d399", marginLeft: "-8px" }}>👨‍🔧</div>
              <div style={{ ...styles.miniAvatarMic, marginLeft: "-8px" }}>🎙️</div>
            </div>
            <div style={styles.ratingText}>
              <strong>10,000+ खुश बिज़नेस मालिक</strong>
              <div style={styles.stars}>★★★★★ <span style={styles.starText}>4.8/5</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive AI Assistant Simulator Terminal */}
        <div style={styles.rightCol}>
          <VoiceDemo />
        </div>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    padding: "150px 2rem 100px 2rem",
    background: "radial-gradient(circle at 80% 20%, rgba(245, 243, 255, 0.75) 0%, rgba(255, 255, 255, 1) 60%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    borderBottom: "1px solid rgba(0,0,0,0.02)",
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "3.5rem",
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    alignItems: "center",
    "@media(max-width: 990px)": {
      gridTemplateColumns: "1fr",
      textAlign: "center" as const,
      gap: "3rem",
      paddingTop: "30px",
    },
  },
  leftCol: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    "@media(max-width: 990px)": {
      alignItems: "center",
    },
  },
  rightCol: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    padding: "0.4rem 1rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--accent-purple)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "1.5rem",
  },
  badgeSpark: {
    fontSize: "1rem",
  },
  title: {
    fontSize: "4.5rem",
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-2px",
    color: "var(--text-primary)",
    marginBottom: "1.5rem",
    textAlign: "left" as const,
    "@media(max-width: 990px)": {
      textAlign: "center" as const,
      fontSize: "3.5rem",
    },
    "@media(max-width: 480px)": {
      fontSize: "2.75rem",
    },
  },
  highlight: {
    background: "var(--accent-gradient)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "1.35rem",
    fontWeight: 500,
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    marginBottom: "1.5rem",
    textAlign: "left" as const,
    maxWidth: "540px",
    "@media(max-width: 990px)": {
      textAlign: "center" as const,
    },
  },
  bulletsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    marginBottom: "2.5rem",
    alignItems: "flex-start",
    "@media(max-width: 990px)": {
      alignItems: "center",
    },
  },
  bulletItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  checkIcon: {
    color: "var(--accent-purple)",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
  ctaGroup: {
    display: "flex",
    gap: "1.25rem",
    marginBottom: "2.5rem",
    flexWrap: "wrap" as const,
    "@media(max-width: 990px)": {
      justifyContent: "center",
    },
  },
  primaryBtn: {
    background: "var(--accent-gradient)",
    color: "#fff",
    fontSize: "1.05rem",
    fontWeight: 700,
    padding: "0.95rem 2.25rem",
    borderRadius: "20px",
    boxShadow: "0 6px 20px rgba(219, 39, 119, 0.25)",
    transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
    display: "inline-flex",
    alignItems: "center",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 25px rgba(219, 39, 119, 0.35)",
    },
  },
  secondaryBtn: {
    background: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    color: "var(--text-primary)",
    fontSize: "1.05rem",
    fontWeight: 600,
    padding: "0.95rem 2.25rem",
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
    transition: "all var(--transition-fast)",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    ":hover": {
      background: "#f9fafb",
      borderColor: "rgba(0, 0, 0, 0.15)",
    },
  },
  playIcon: {
    color: "var(--accent-purple)",
    fontSize: "0.9rem",
  },
  ratingsBlock: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    "@media(max-width: 990px)": {
      justifyContent: "center",
    },
  },
  avatarGroup: {
    display: "flex",
    alignItems: "center",
  },
  miniAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "2px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    color: "#fff",
  },
  miniAvatarMic: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "2px solid #fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    background: "var(--accent-gradient)",
    color: "#fff",
  },
  ratingText: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    textAlign: "left" as const,
  },
  stars: {
    color: "#f59e0b",
    fontSize: "1rem",
    marginTop: "0.15rem",
  },
  starText: {
    color: "var(--text-primary)",
    fontWeight: 700,
    marginLeft: "0.25rem",
  },
};
