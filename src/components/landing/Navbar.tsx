"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header style={{ ...styles.header, ...(scrolled ? styles.headerScrolled : {}) }}>
      <div style={styles.container}>
        {/* Logo */}
        <Link href="/" style={styles.logo}>
          <div style={styles.logoBadge}>🎙️</div>
          <span style={styles.logoText}>BoloBiz</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={styles.navDesktop}>
          <a href="#hero" style={styles.navLink}>होम</a>
          <a href="#features" style={styles.navLink}>फीचर्स</a>
          <a href="#how-it-works" style={styles.navLink}>काम कैसे करता है</a>
          <a href="#vision" style={styles.navLink}>विज़न</a>
          <a href="#about" style={styles.navLink}>हमारे बारे में</a>
        </nav>

        {/* Desktop CTA & Controls */}
        <div style={styles.rightNav}>
          <div style={styles.langSelector}>
            <span>🌐</span>
            <select style={styles.langSelect} defaultValue="hindi">
              <option value="hindi">हिंदी ∨</option>
              <option value="english">English</option>
            </select>
          </div>
          <Link href="/login" style={styles.signInBtn}>Sign In</Link>
          <Link href="/signup" style={styles.startBtn}>शुरू करें मुफ्त में</Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={styles.mobileMenuTrigger}
          aria-label="Toggle Navigation Menu"
        >
          <span style={{ ...styles.bar, ...(mobileMenuOpen ? styles.bar1Open : {}) }}></span>
          <span style={{ ...styles.bar, ...(mobileMenuOpen ? styles.bar2Open : {}) }}></span>
          <span style={{ ...styles.bar, ...(mobileMenuOpen ? styles.bar3Open : {}) }}></span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="glass-panel animate-fade-in" style={styles.mobileDrawer}>
          <nav style={styles.mobileNav}>
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>होम</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>फीचर्स</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>काम कैसे करता है</a>
            <a href="#vision" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>विज़न</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>हमारे बारे में</a>
            <hr style={styles.divider} />
            <Link href="/login" style={styles.mobileNavLink}>Sign In</Link>
            <Link href="/signup" style={styles.mobileStartBtn}>शुरू करें मुफ्त में</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

const styles = {
  header: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "80px",
    display: "flex",
    alignItems: "center",
    zIndex: 100,
    transition: "background var(--transition-normal), backdrop-filter var(--transition-normal), box-shadow var(--transition-normal)",
    borderBottom: "1px solid transparent",
  },
  headerScrolled: {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--glass-border)",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05)",
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    padding: "0 2rem",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  logoBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    boxShadow: "0 4px 15px rgba(219, 39, 119, 0.25)",
  },
  logoText: {
    fontSize: "1.55rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  navDesktop: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
    "@media(max-width: 900px)": {
      display: "none",
    },
  },
  navLink: {
    fontSize: "0.95rem",
    color: "var(--text-primary)",
    fontWeight: 600,
    transition: "color var(--transition-fast)",
    cursor: "pointer",
    ":hover": {
      color: "var(--accent-pink)",
    },
  },
  rightNav: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    "@media(max-width: 900px)": {
      display: "none",
    },
  },
  langSelector: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "rgba(0, 0, 0, 0.02)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    padding: "0.4rem 0.75rem",
    borderRadius: "20px",
  },
  langSelect: {
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    cursor: "pointer",
    background: "transparent",
    border: "none",
    fontWeight: 600,
  },
  signInBtn: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    fontWeight: 600,
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    transition: "all var(--transition-fast)",
    ":hover": {
      background: "rgba(0, 0, 0, 0.03)",
      color: "var(--text-primary)",
    },
  },
  startBtn: {
    background: "var(--accent-gradient)",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 700,
    padding: "0.65rem 1.5rem",
    borderRadius: "20px",
    boxShadow: "0 4px 15px rgba(219, 39, 119, 0.25)",
    transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
    ":hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 6px 20px rgba(219, 39, 119, 0.35)",
    },
  },
  mobileMenuTrigger: {
    display: "none",
    flexDirection: "column" as const,
    justifyContent: "space-between",
    width: "24px",
    height: "18px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    zIndex: 101,
    "@media(max-width: 900px)": {
      display: "flex",
    },
  },
  bar: {
    width: "100%",
    height: "2.5px",
    backgroundColor: "var(--text-primary)",
    transition: "transform var(--transition-normal), opacity var(--transition-normal)",
    borderRadius: "2px",
  },
  bar1Open: { transform: "rotate(45deg) translate(5px, 6px)" },
  bar2Open: { opacity: 0 },
  bar3Open: { transform: "rotate(-45deg) translate(5px, -6px)" },
  mobileDrawer: {
    position: "fixed" as const,
    top: "80px",
    left: "5%",
    width: "90%",
    maxHeight: "calc(100vh - 100px)",
    padding: "2rem",
    zIndex: 99,
    overflowY: "auto" as const,
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    "@media(min-width: 901px)": {
      display: "none",
    },
  },
  mobileNav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  mobileNavLink: {
    fontSize: "1.1rem",
    color: "var(--text-primary)",
    fontWeight: 600,
    textAlign: "center" as const,
  },
  divider: {
    border: "none",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    margin: "0.5rem 0",
  },
  mobileStartBtn: {
    background: "var(--accent-gradient)",
    color: "#fff",
    fontSize: "1.05rem",
    fontWeight: 700,
    padding: "0.85rem",
    borderRadius: "12px",
    textAlign: "center" as const,
    boxShadow: "0 4px 15px rgba(219, 39, 119, 0.25)",
  },
};
