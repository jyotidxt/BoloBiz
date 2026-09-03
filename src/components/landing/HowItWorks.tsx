"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function HowItWorks() {
  const { language, t } = useLanguage();
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.15 });

  const steps = [
    {
      num: "01",
      icon: "🎙️",
      titleKey: "howItWorks.step1Title",
      descKey: "howItWorks.step1Desc",
    },
    {
      num: "02",
      icon: "🧠",
      titleKey: "howItWorks.step2Title",
      descKey: "howItWorks.step2Desc",
    },
    {
      num: "03",
      icon: "⚡",
      titleKey: "howItWorks.step3Title",
      descKey: "howItWorks.step3Desc",
    },
    {
      num: "04",
      icon: "📊",
      titleKey: "howItWorks.step4Title",
      descKey: "howItWorks.step4Desc",
    },
  ];

  return (
    <section id="how-it-works" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.sectionHeader} key={language} className="animate-fade-in">
          <h2 style={styles.heading}>{t("howItWorks.heading")}</h2>
          <p style={styles.subtext}>{t("howItWorks.subheading")}</p>
        </div>

        {/* Process Steps Stepper */}
        <div
          ref={observerRef}
          style={{
            ...styles.stepperContainer,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(30px)",
            transition: "opacity var(--transition-slow), transform var(--transition-slow)",
          }}
        >
          {steps.map((st, idx) => (
            <div key={idx} style={styles.stepCardContainer}>
              {/* Connector line (except last item) */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    ...styles.connectorLine,
                    opacity: isVisible ? 1 : 0,
                    transition: `opacity 0.6s ease ${idx * 0.3}s`,
                  }}
                ></div>
              )}

              <div style={styles.stepCard}>
                <div style={styles.numBadge}>
                  <span style={styles.numText}>{st.num}</span>
                </div>
                <div style={styles.iconCircle}>
                  {st.icon}
                </div>
                <h3 style={styles.stepTitle}>{t(st.titleKey)}</h3>
                <p style={styles.stepDesc}>{t(st.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "100px 2rem",
    backgroundColor: "var(--bg-primary)",
    position: "relative" as const,
    overflow: "hidden",
  },
  container: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center" as const,
    marginBottom: "5rem",
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
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  stepperContainer: {
    display: "flex",
    gap: "2rem",
    justifyContent: "space-between",
    position: "relative" as const,
    flexWrap: "wrap" as const,
    width: "100%",
  },
  stepCardContainer: {
    flex: 1,
    minWidth: "220px",
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  },
  connectorLine: {
    position: "absolute" as const,
    top: "70px",
    left: "60%",
    width: "80%",
    height: "2px",
    background: "linear-gradient(90deg, var(--accent-purple) 0%, rgba(0,0,0,0.05) 100%)",
    zIndex: 1,
  },
  stepCard: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    zIndex: 2,
    maxWidth: "280px",
  },
  numBadge: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    padding: "0.2rem 0.6rem",
    borderRadius: "12px",
    marginBottom: "1rem",
  },
  numText: {
    fontSize: "0.75rem",
    color: "var(--accent-purple)",
    fontWeight: 700,
  },
  iconCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    marginBottom: "1.25rem",
    boxShadow: "0 8px 20px var(--glass-shadow)",
  },
  stepTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.75rem",
  },
  stepDesc: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
};
