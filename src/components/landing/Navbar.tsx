"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectLanguage = (lang: "en" | "hi") => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, lang: "en" | "hi") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectLanguage(lang);
    }
  };

  return (
    <header style={{ ...styles.header, ...(scrolled ? styles.headerScrolled : {}) }}>
      <div style={styles.container}>
        {/* Logo */}
        <Link href="/" style={styles.logo}>
          <div style={styles.logoBadge}>🎙️</div>
          <span style={styles.logoText}>BoloBiz</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-desktop-only" style={styles.navDesktop}>
          <a href="#hero" style={styles.navLink}>{t("nav.home")}</a>
          <a href="#features" style={styles.navLink}>{t("nav.features")}</a>
          <a href="#how-it-works" style={styles.navLink}>{t("nav.howItWorks")}</a>
          <a href="#vision" style={styles.navLink}>{t("nav.vision")}</a>
          <a href="#about" style={styles.navLink}>{t("nav.about")}</a>
        </nav>

        {/* Right CTA / Language Bar */}
        <div className="nav-desktop-only" style={styles.rightNav}>
          {/* Custom Accessible Dropdown */}
          <div style={styles.dropdownWrapper} ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={styles.langSelectorBtn}
              aria-haspopup="listbox"
              aria-expanded={dropdownOpen}
              aria-label="Select Interface Language"
            >
              <span>🌐</span>
              <span style={styles.langTextLabel}>{language === "en" ? "English" : "हिंदी"}</span>
              <span style={{ ...styles.chevron, ...(dropdownOpen ? styles.chevronOpen : {}) }}>▾</span>
            </button>

            {dropdownOpen && (
              <ul style={styles.dropdownMenu} role="listbox" aria-label="Languages">
                <li
                  onClick={() => selectLanguage("en")}
                  onKeyDown={(e) => handleKeyDown(e, "en")}
                  tabIndex={0}
                  role="option"
                  aria-selected={language === "en"}
                  style={{
                    ...styles.dropdownItem,
                    ...(language === "en" ? styles.dropdownItemActive : {}),
                  }}
                >
                  🇬🇧 English
                </li>
                <li
                  onClick={() => selectLanguage("hi")}
                  onKeyDown={(e) => handleKeyDown(e, "hi")}
                  tabIndex={0}
                  role="option"
                  aria-selected={language === "hi"}
                  style={{
                    ...styles.dropdownItem,
                    ...(language === "hi" ? styles.dropdownItemActive : {}),
                  }}
                >
                  🇮🇳 हिंदी
                </li>
              </ul>
            )}
          </div>

          <Link href="/login" style={styles.signInBtn}>{t("nav.signIn")}</Link>
          <Link href="/signup" style={styles.startBtn}>{t("nav.startFree")}</Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="nav-mobile-hamburger"
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
        <div className="glass-panel animate-fade-in nav-mobile-drawer" style={styles.mobileDrawer}>
          <nav style={styles.mobileNav}>
            <a href="#hero" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>{t("nav.home")}</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>{t("nav.features")}</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>{t("nav.howItWorks")}</a>
            <a href="#vision" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>{t("nav.vision")}</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>{t("nav.about")}</a>
            
            <hr style={styles.divider} />

            {/* Mobile Language Selector Selector */}
            <div style={styles.mobileLangRow}>
              <span style={styles.mobileLangLabel}>🌐 भाषा (Language):</span>
              <div style={styles.mobileLangToggleBox}>
                <button
                  onClick={() => selectLanguage("en")}
                  style={{
                    ...styles.mobileLangBtn,
                    ...(language === "en" ? styles.mobileLangBtnActive : {}),
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => selectLanguage("hi")}
                  style={{
                    ...styles.mobileLangBtn,
                    ...(language === "hi" ? styles.mobileLangBtnActive : {}),
                  }}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <hr style={styles.divider} />

            <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={styles.mobileNavLink}>{t("nav.signIn")}</Link>
            <Link href="/signup" onClick={() => setMobileMenuOpen(false)} style={styles.mobileStartBtn}>{t("nav.startFree")}</Link>
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
    background: "var(--sidebar-bg)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--glass-border)",
    boxShadow: "0 4px 30px var(--glass-shadow)",
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
    gap: "2rem",
    alignItems: "center",
  },
  navLink: {
    fontSize: "0.95rem",
    color: "var(--text-primary)",
    fontWeight: 600,
    transition: "color var(--transition-fast)",
    cursor: "pointer",
  },
  rightNav: {
    alignItems: "center",
    gap: "1.25rem",
  },
  dropdownWrapper: {
    position: "relative" as const,
  },
  langSelectorBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    transition: "all var(--transition-fast)",
    outline: "none",
  },
  langTextLabel: {
    minWidth: "48px",
    textAlign: "left" as const,
  },
  chevron: {
    display: "inline-block",
    transition: "transform var(--transition-fast)",
  },
  chevronOpen: {
    transform: "rotate(180deg)",
  },
  dropdownMenu: {
    position: "absolute" as const,
    top: "calc(100% + 8px)",
    right: 0,
    background: "var(--bg-primary)",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 10px 30px var(--glass-shadow)",
    borderRadius: "12px",
    padding: "0.5rem",
    listStyle: "none",
    minWidth: "130px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
    zIndex: 110,
    animation: "slide-up 0.2s ease-out forwards",
  },
  dropdownItem: {
    padding: "0.5rem 0.85rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    outline: "none",
    textAlign: "left" as const,
  },
  dropdownItemActive: {
    background: "rgba(124, 58, 237, 0.06)",
    color: "var(--accent-purple)",
  },
  signInBtn: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    fontWeight: 600,
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    transition: "all var(--transition-fast)",
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
  },
  mobileNav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
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
  mobileLangRow: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    alignItems: "center",
  },
  mobileLangLabel: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  mobileLangToggleBox: {
    display: "flex",
    background: "rgba(0,0,0,0.03)",
    border: "1px solid rgba(0,0,0,0.06)",
    padding: "0.25rem",
    borderRadius: "15px",
    gap: "0.25rem",
  },
  mobileLangBtn: {
    padding: "0.4rem 1.25rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  mobileLangBtnActive: {
    background: "var(--bg-primary)",
    color: "var(--accent-purple)",
    boxShadow: "0 2px 6px var(--glass-shadow)",
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
