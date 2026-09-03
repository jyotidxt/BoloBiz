"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language, setLanguage, t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer style={styles.footer}>
      <div style={styles.container} key={language} className="animate-fade-in">
        {/* Brand details */}
        <div style={styles.brandCol}>
          <Link href="/" style={styles.logo}>
            <div style={styles.logoBadge}>🎙️</div>
            <span style={styles.logoText}>BoloBiz</span>
          </Link>
          <p style={styles.brandDesc}>
            {t("footer.desc")}
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
            <h4 style={styles.colTitle}>{t("footer.prodColTitle")}</h4>
            <a href="#features" style={styles.link}>{t("footer.features")}</a>
            <span style={styles.placeholderLink}>{t("footer.pricing")}</span>
            <span style={styles.placeholderLink}>{t("footer.updates")}</span>
            <span style={styles.placeholderLink}>{t("footer.integrations")}</span>
          </div>

          <div style={styles.col}>
            <h4 style={styles.colTitle}>{t("footer.compColTitle")}</h4>
            <a href="#vision" style={styles.link}>{t("footer.about")}</a>
            <span style={styles.placeholderLink}>{t("footer.careers")}</span>
            <span style={styles.placeholderLink}>{t("footer.blog")}</span>
            <span style={styles.placeholderLink}>{t("footer.contact")}</span>
          </div>

          <div style={styles.col}>
            <h4 style={styles.colTitle}>{t("footer.helpColTitle")}</h4>
            <span style={styles.placeholderLink}>{t("footer.helpCenter")}</span>
            <span style={styles.placeholderLink}>{t("footer.privacy")}</span>
            <span style={styles.placeholderLink}>{t("footer.terms")}</span>
            <span style={styles.placeholderLink}>{t("footer.refund")}</span>
          </div>

          <div style={styles.col}>
            <h4 style={styles.colTitle}>{t("footer.subscribeColTitle")}</h4>
            <div style={styles.subscribeBox}>
              <input
                type="email"
                placeholder={t("footer.subscribePlaceholder")}
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
          <span style={styles.copy}>
            © 2024 - {currentYear} {t("footer.copy")}
          </span>
          
          <div style={styles.langSelector}>
            <span>🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              style={styles.langSelect}
              aria-label="Toggle Interface Language"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी ∨</option>
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
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "4rem",
    marginBottom: "4rem",
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
