"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function LanguageDemo() {
  const { language, t } = useLanguage();
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  const examples = [
    {
      locale: language === "hi" ? "🇮🇳 हिन्दी (Hindi)" : "🇮🇳 Hindi (हिन्दी)",
      input: "आज रमेश को ₹500 उधार दिए।",
      meaning: language === "hi" 
        ? "रमेश कुमार के खाते में ₹500 का उधार दर्ज किया गया।" 
        : "Sales credit of ₹500 registered to customer Ramesh Kumar.",
    },
    {
      locale: language === "hi" ? "🌐 हिंग्लिश (Hinglish)" : "🌐 Hinglish (हिंग्लिश)",
      input: "Ramesh ne ₹500 de diye, entry check karo.",
      meaning: language === "hi" 
        ? "रमेश कुमार का ₹500 का भुगतान दर्ज किया गया।" 
        : "Repayment of ₹500 logged for customer Ramesh Kumar.",
    },
    {
      locale: language === "hi" ? "🇬🇧 इंग्लिश (English)" : "🇬🇧 English (इंग्लिश)",
      input: "Add ₹500 credit transaction to Ramesh.",
      meaning: language === "hi" 
        ? "रमेश कुमार के खाते में ₹500 का उधार दर्ज किया गया।" 
        : "Sales credit of ₹500 registered to customer Ramesh Kumar.",
    },
  ];

  return (
    <section id="language-demo" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.header} key={language} className="animate-fade-in">
          <h2 style={styles.heading}>{t("languageDemo.heading")}</h2>
          <p style={styles.subtext}>
            {t("languageDemo.subtext")}
          </p>
        </div>

        <div
          ref={observerRef}
          style={{
            ...styles.workspace,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.95)",
            transition: "opacity var(--transition-slow), transform var(--transition-slow)",
          }}
        >
          {/* Inputs grid */}
          <div style={styles.inputGrid}>
            {examples.map((ex, idx) => (
              <div key={idx} className="glass-panel" style={styles.inputCard}>
                <div style={styles.localeLabel}>{ex.locale}</div>
                <div style={styles.quote}>“ {ex.input} ”</div>
                <div style={styles.interpretation}>
                  <span>🎯 Intent:</span> {ex.meaning}
                </div>
              </div>
            ))}
          </div>

          {/* Central mapping connector */}
          <div style={styles.connectorRow}>
            <div style={styles.downArrow}>⬇️</div>
            <div style={styles.downArrow}>⬇️</div>
            <div style={styles.downArrow}>⬇️</div>
          </div>

          {/* Structured Database Receipt Output */}
          <div className="glass-panel" style={styles.unifiedDatabaseCard}>
            <div style={styles.dbHeader}>
              <span style={styles.dbStatus}>🟢 Action Parser</span>
              <span>Structured Ledger Object</span>
            </div>
            <div style={styles.dbCode}>
              <pre style={styles.pre}>
{`{
  "tenantId": "org_sharma_store_8921",
  "operation": "CREATE_TRANSACTION",
  "payload": {
    "type": "CREDIT",
    "amount": 500.00,
    "customer": {
      "name": "Ramesh Kumar",
      "action": "AUTO_BALANCE_INCREMENT"
    }
  },
  "audit": {
    "channel": "VOICE_COMMAND_AGENT",
    "timestamp": "${new Date().toISOString()}"
  }
}`}
              </pre>
            </div>
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
    position: "relative" as const,
  },
  container: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    textAlign: "center" as const,
  },
  header: {
    marginBottom: "4rem",
  },
  heading: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "1rem",
    letterSpacing: "-1px",
  },
  subtext: {
    fontSize: "1.15rem",
    color: "var(--text-secondary)",
    maxWidth: "800px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  workspace: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: "100%",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
    width: "100%",
    marginBottom: "2rem",
  },
  inputCard: {
    padding: "2rem 1.5rem",
    borderRadius: "16px",
    textAlign: "left" as const,
    borderLeft: "3px solid var(--accent-purple)",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    boxShadow: "0 10px 30px var(--glass-shadow)",
  },
  localeLabel: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--accent-purple)",
    textTransform: "uppercase" as const,
    marginBottom: "1rem",
  },
  quote: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "var(--text-primary)",
    fontStyle: "italic",
    marginBottom: "1.25rem",
  },
  interpretation: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    background: "rgba(0, 0, 0, 0.02)",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
  },
  connectorRow: {
    display: "flex",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: "800px",
    marginBottom: "1.5rem",
    fontSize: "1.5rem",
  },
  downArrow: {
    animation: "pulse-wave 2s infinite ease-in-out",
  },
  unifiedDatabaseCard: {
    width: "100%",
    maxWidth: "600px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 30px var(--glass-shadow)",
    textAlign: "left" as const,
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
  },
  dbHeader: {
    background: "var(--bg-secondary)",
    padding: "0.75rem 1.25rem",
    borderBottom: "1px solid var(--glass-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    fontWeight: 600,
  },
  dbStatus: {
    color: "var(--status-success)",
  },
  dbCode: {
    padding: "1.5rem",
    background: "#0d0f1a",
    overflowX: "auto" as const,
  },
  pre: {
    fontFamily: "monospace",
    color: "#60a5fa",
    fontSize: "0.85rem",
    lineHeight: 1.4,
  },
};
