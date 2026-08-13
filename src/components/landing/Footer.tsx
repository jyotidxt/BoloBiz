"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Brand details */}
        <div style={styles.brandCol}>
          <Link href="/" style={styles.logo}>
            <div style={styles.logoBadge}>🎙️</div>
            <span style={styles.logoText}>BoloBiz</span>
          </Link>
          <p style={styles.brandDesc}>
            आपकी भाषा में आपका बिज़नेस असिस्टेंट। <br />
            बोलें और अपने बिज़नेस को आसान बनाएं।
          </p>
          <div style={styles.socials}>
            <span style={styles.socialIcon}>📞</span> {/* Mock WhatsApp */}
            <span style={styles.socialIcon}>📘</span> {/* Mock FB */}
            <span style={styles.socialIcon}>📸</span> {/* Mock Insta */}
            <span style={styles.socialIcon}>📺</span> {/* Mock YT */}
          </div>
        </div>

        {/* Links lists */}
        <div style={styles.linksGrid}>
          <div style={styles.col}>
            <h4 style={styles.colTitle}>प्रोडक्ट</h4>
            <a href="#features" style={styles.link}>फीचर्स</a>
            <span style={styles.placeholderLink}>कीमतें</span>
            <span style={styles.placeholderLink}>अपडेट्स</span>
            <span style={styles.placeholderLink}>इंटीग्रेशन</span>
          </div>

          <div style={styles.col}>
            <h4 style={styles.colTitle}>कंपनी</h4>
            <a href="#vision" style={styles.link}>हमारे बारे में</a>
            <span style={styles.placeholderLink}>करियर</span>
            <span style={styles.placeholderLink}>ब्लॉग</span>
            <span style={styles.placeholderLink}>संपर्क करें</span>
          </div>

          <div style={styles.col}>
            <h4 style={styles.colTitle}>सहायता</h4>
            <span style={styles.placeholderLink}>हेल्प सेंटर</span>
            <span style={styles.placeholderLink}>गोपनीयता नीति</span>
            <span style={styles.placeholderLink}>नियम और शर्तें</span>
            <span style={styles.placeholderLink}>रिफंड नीति</span>
          </div>

          <div style={styles.col}>
            <h4 style={styles.colTitle}>हमारे साथ जुड़ें</h4>
            <div style={styles.subscribeBox}>
              <input
                type="email"
                placeholder="आपका ईमेल"
                style={styles.subscribeInput}
                disabled
              />
              <button style={styles.subscribeBtn} aria-label="Subscribe">
                🚀
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomContainer}>
          <span style={styles.copy}>© 2024 BoloBiz. सभी अधिकार सुरक्षित।</span>
          
          <div style={styles.langSelector}>
            <span>🌐</span>
            <select style={styles.langSelect} defaultValue="hindi">
              <option value="hindi">हिंदी ∨</option>
              <option value="english">English</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: "#0d0f1a",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "80px 2rem 40px 2rem",
    position: "relative" as const,
  },
  container: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.2fr 2.5fr",
    gap: "4rem",
    marginBottom: "4rem",
    "@media(max-width: 900px)": {
      gridTemplateColumns: "1fr",
      gap: "3rem",
    },
  },
  brandCol: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    textAlign: "left" as const,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    marginBottom: "1.5rem",
  },
  logoBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.2rem",
  },
  logoText: {
    fontSize: "1.50rem",
    fontWeight: 800,
    color: "#fff",
  },
  brandDesc: {
    fontSize: "0.95rem",
    color: "#9ca3af",
    lineHeight: 1.6,
    marginBottom: "2rem",
  },
  socials: {
    display: "flex",
    gap: "0.75rem",
  },
  socialIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    cursor: "pointer",
  },
  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "2rem",
  },
  col: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.85rem",
    textAlign: "left" as const,
  },
  colTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "0.5px",
    marginBottom: "0.5rem",
  },
  link: {
    fontSize: "0.9rem",
    color: "#9ca3af",
    transition: "color var(--transition-fast)",
    cursor: "pointer",
    ":hover": {
      color: "var(--accent-pink)",
    },
  },
  placeholderLink: {
    fontSize: "0.9rem",
    color: "#4b5563",
    cursor: "default",
  },
  subscribeBox: {
    display: "flex",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "0.25rem",
    width: "100%",
    maxWidth: "240px",
  },
  subscribeInput: {
    flex: 1,
    padding: "0.4rem 0.75rem",
    color: "#fff",
    fontSize: "0.85rem",
  },
  subscribeBtn: {
    background: "var(--accent-gradient)",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  bottomBar: {
    borderTop: "1px solid rgba(255,255,255,0.03)",
    paddingTop: "2rem",
  },
  bottomContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    fontSize: "0.85rem",
    color: "#4b5563",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  copy: {
    textAlign: "left" as const,
  },
  langSelector: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "0.3rem 0.75rem",
    borderRadius: "20px",
  },
  langSelect: {
    fontSize: "0.8rem",
    color: "#9ca3af",
    cursor: "pointer",
    background: "transparent",
    border: "none",
  },
};
