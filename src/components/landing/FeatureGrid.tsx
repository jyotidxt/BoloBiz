"use client";

import { useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function FeatureGrid() {
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      id: 1,
      icon: "💳",
      title: "बिक्री और लेन-देन",
      desc: "बिक्री, उधार, भुगतान और खर्च को आसानी से रिकॉर्ड करें।",
      visual: (isHovered: boolean) => (
        <div style={styles.cardVisualContainer}>
          <div
            style={{
              ...styles.salesIcon,
              transform: isHovered ? "rotate(-10deg) scale(1.1)" : "rotate(0) scale(1)",
              transition: "transform 0.3s ease",
            }}
          >
            💸
          </div>
          <div style={styles.miniLedger}>
            <div style={styles.ledgerRow}>
              <span>बिक्री</span>
              <span style={{ color: "var(--status-success)", fontWeight: 700 }}>+₹1,200</span>
            </div>
            <div style={styles.ledgerRow}>
              <span>खर्च</span>
              <span style={{ color: "var(--status-danger)", fontWeight: 700 }}>-₹450</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      icon: "👥",
      title: "ग्राहक प्रबंधन",
      desc: "ग्राहकों का पूरा रिकॉर्ड, बकाया राशि और भुगतान इतिहास देखें।",
      visual: (isHovered: boolean) => (
        <div style={styles.cardVisualContainer}>
          <div style={styles.barGraph}>
            <div
              style={{
                ...styles.bar,
                height: isHovered ? "45px" : "15px",
                background: "#7c3aed",
                transition: "height 0.4s ease",
              }}
            ></div>
            <div
              style={{
                ...styles.bar,
                height: isHovered ? "65px" : "30px",
                background: "#db2777",
                transition: "height 0.4s ease 0.1s",
              }}
            ></div>
            <div
              style={{
                ...styles.bar,
                height: isHovered ? "80px" : "20px",
                background: "#06b6d4",
                transition: "height 0.4s ease 0.2s",
              }}
            ></div>
          </div>
          <span style={styles.graphLabel}>Outstanding Credit</span>
        </div>
      ),
    },
    {
      id: 3,
      icon: "📦",
      title: "इन्वेंट्री मैनेजमेंट",
      desc: "स्टॉक की स्थिति ट्रैक करें और कम स्टॉक होने पर अलर्ट पाएं।",
      visual: (isHovered: boolean) => (
        <div style={styles.cardVisualContainer}>
          <div style={styles.stockBox}>
            <span style={styles.stockItemName}>Maggi Packets</span>
            <span
              style={{
                ...(isHovered ? styles.stockHealthy : styles.stockLow),
                transition: "all 0.3s ease",
              }}
            >
              {isHovered ? "स्टॉक: 52 (सुरक्षित)" : "स्टॉक: 2 (लो स्टॉक अलर्ट)"}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      icon: "🧠",
      title: "AI से पूछें कुछ भी",
      desc: "अपने बिज़नेस से जुड़े सवाल सीधे बोलकर पूछें और तुरंत जवाब पाएं।",
      visual: (isHovered: boolean) => (
        <div style={styles.cardVisualContainer}>
          <div
            style={{
              ...styles.aiOrb,
              animation: isHovered ? "pulse-wave 1s infinite ease-in-out" : "pulse-wave 2s infinite ease-in-out",
              background: isHovered
                ? "radial-gradient(circle, var(--accent-pink) 0%, transparent 70%)"
                : "radial-gradient(circle, var(--accent-purple) 0%, transparent 70%)",
              transition: "background 0.3s ease",
            }}
          >
            🤖
          </div>
        </div>
      ),
    },
    {
      id: 5,
      icon: "🔔",
      title: "स्मार्ट रिमाइंडर",
      desc: "बकाया भुगतान के लिए रिमाइंडर भेजें और महत्वपूर्ण अलर्ट प्राप्त करें।",
      visual: (isHovered: boolean) => (
        <div style={styles.cardVisualContainer}>
          <div
            style={{
              ...styles.bellIcon,
              animation: isHovered ? "bell-ring 0.5s ease-in-out infinite" : "none",
            }}
          >
            🔔
          </div>
          <span style={styles.bellSubtext}>पेमेंट रिमाइंडर सेंड</span>
        </div>
      ),
    },
    {
      id: 6,
      icon: "📊",
      title: "रिपोर्ट्स और इनसाइट्स",
      desc: "डिटेल रिपोर्ट्स और इनसाइट्स से अपने बिज़नेस को बेहतर समझें।",
      visual: (isHovered: boolean) => (
        <div style={styles.cardVisualContainer}>
          <svg style={styles.svgChart} viewBox="0 0 100 40">
            <path
              d="M0 35 Q 25 10, 50 25 T 100 5"
              fill="none"
              stroke="var(--accent-purple)"
              strokeWidth="2.5"
              strokeDasharray="120"
              style={{
                strokeDashoffset: isHovered ? 0 : 120,
                transition: "stroke-dashoffset 1s ease",
              }}
            />
          </svg>
          <span style={styles.chartCaption}>+24% बिक्री बढ़ोतरी</span>
        </div>
      ),
    },
  ];

  return (
    <section id="features" style={styles.features}>
      <div style={styles.container}>
        {/* Section Header */}
        <div style={styles.sectionHeader}>
          <div style={styles.badgePill}>सब कुछ एक जगह</div>
          <h2 style={styles.mainHeading}>आपके बिज़नेस के लिए सब कुछ</h2>
          <p style={styles.mainSubtext}>एक ही प्लेटफॉर्म पर सभी जरूरी सुविधाएं</p>
        </div>

        {/* Feature Cards Grid */}
        <div
          ref={observerRef}
          style={{
            ...styles.grid,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(40px)",
            transition: "opacity var(--transition-slow), transform var(--transition-slow)",
          }}
        >
          {features.map((feat) => {
            const isHovered = hoveredCard === feat.id;

            return (
              <div
                key={feat.id}
                className="glass-panel"
                style={{
                  ...styles.card,
                  ...(isHovered ? styles.cardHovered : {}),
                }}
                onMouseEnter={() => setHoveredCard(feat.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={styles.iconRow}>
                  <span style={styles.icon}>{feat.icon}</span>
                  <span style={styles.arrowIcon}>→</span>
                </div>
                <h3 style={styles.cardTitle}>{feat.title}</h3>
                <p style={styles.cardDesc}>{feat.desc}</p>
                {feat.visual(isHovered)}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
      `}</style>
    </section>
  );
}

const styles = {
  features: {
    padding: "90px 2rem",
    backgroundColor: "var(--bg-secondary)",
    borderTop: "1px solid rgba(0,0,0,0.02)",
    position: "relative" as const,
  },
  container: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center" as const,
    marginBottom: "4rem",
  },
  badgePill: {
    display: "inline-block",
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    color: "var(--accent-purple)",
    padding: "0.3rem 1rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: 700,
    marginBottom: "1rem",
  },
  mainHeading: {
    fontSize: "2.75rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-1px",
    marginBottom: "0.5rem",
  },
  mainSubtext: {
    fontSize: "1.15rem",
    color: "var(--text-secondary)",
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "2rem",
  },
  card: {
    padding: "2.25rem",
    borderRadius: "20px",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column" as const,
    height: "100%",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
    transition: "transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal)",
    position: "relative" as const,
    overflow: "hidden",
  },
  cardHovered: {
    transform: "translateY(-4px)",
    borderColor: "rgba(124, 58, 237, 0.25)",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.08)",
  },
  iconRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  icon: {
    fontSize: "2.25rem",
  },
  arrowIcon: {
    fontSize: "1.2rem",
    color: "var(--text-muted)",
  },
  cardTitle: {
    fontSize: "1.35rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.75rem",
    textAlign: "left" as const,
  },
  cardDesc: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    lineHeight: 1.6,
    marginBottom: "1.75rem",
    flex: 1,
    textAlign: "left" as const,
  },
  cardVisualContainer: {
    height: "110px",
    background: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    position: "relative" as const,
    overflow: "hidden",
  },
  salesIcon: {
    fontSize: "1.75rem",
    marginBottom: "0.25rem",
  },
  miniLedger: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
  },
  ledgerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  barGraph: {
    display: "flex",
    alignItems: "flex-end",
    gap: "0.85rem",
    height: "80px",
    marginBottom: "0.2rem",
  },
  bar: {
    width: "16px",
    borderRadius: "4px 4px 0 0",
  },
  graphLabel: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  stockBox: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
    textAlign: "center" as const,
  },
  stockItemName: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  stockLow: {
    background: "rgba(239, 68, 68, 0.08)",
    color: "var(--status-danger)",
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  stockHealthy: {
    background: "rgba(16, 185, 129, 0.08)",
    color: "var(--status-success)",
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 700,
  },
  aiOrb: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  bellIcon: {
    fontSize: "2rem",
    transformOrigin: "top center",
    marginBottom: "0.25rem",
  },
  bellSubtext: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
  },
  svgChart: {
    width: "100%",
    height: "40px",
  },
  chartCaption: {
    fontSize: "0.7rem",
    color: "var(--status-success)",
    fontWeight: 700,
    marginTop: "0.25rem",
  },
};
