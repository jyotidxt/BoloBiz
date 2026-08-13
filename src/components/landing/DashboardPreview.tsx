"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

export default function DashboardPreview() {
  const { language } = useLanguage();
  const [observerRef, isVisible] = useIntersectionObserver({ threshold: 0.15 });

  const debtors = [
    { 
      name: language === "hi" ? "रमेश गुप्ता" : "Ramesh Gupta", 
      amount: "₹2,350", 
      color: "#fca5a5" 
    },
    { 
      name: language === "hi" ? "अमित कुमार" : "Amit Kumar", 
      amount: "₹1,800", 
      color: "#fca5a5" 
    },
    { 
      name: language === "hi" ? "सुरेश यादव" : "Suresh Yadav", 
      amount: "₹1,200", 
      color: "#fca5a5" 
    },
    { 
      name: language === "hi" ? "विक्रम सिंह" : "Vikram Singh", 
      amount: "₹950", 
      color: "#fca5a5" 
    },
  ];

  const activities = [
    { 
      title: language === "hi" ? "रमेश को ₹500 उधार दिया" : "Gave ₹500 credit to Ramesh", 
      time: "10:30 AM", 
      type: "credit" 
    },
    { 
      title: language === "hi" ? "अमित से ₹800 भुगतान प्राप्त" : "Received ₹800 payment from Amit", 
      time: "10:15 AM", 
      type: "payment" 
    },
    { 
      title: language === "hi" ? "20 मैगी पैकेट स्टॉक में जोड़े" : "Added 20 Maggi packets to stock", 
      time: "09:40 AM", 
      type: "stock" 
    },
    { 
      title: language === "hi" ? "कोक 10 बोतल स्टॉक में जोड़ी" : "Added 10 Coke bottles to stock", 
      time: "09:20 AM", 
      type: "stock" 
    },
  ];

  return (
    <section id="dashboard-preview" style={styles.section}>
      <div style={styles.container}>
        {/* Left Side: Product Intro */}
        <div style={styles.leftCol} key={language} className="animate-fade-in">
          <div style={styles.badgePill}>
            {language === "hi" ? "स्मार्ट डैशबोर्ड" : "Smart Dashboard"}
          </div>
          <h2 style={styles.heading}>
            {language === "hi" ? "अपने बिज़नेस पर पूरी नज़र रखें" : "Keep Total Track of Your Business"}
          </h2>
          <p style={styles.subtext}>
            {language === "hi" 
              ? "क्लियर डैशबोर्ड और आसान रिपोर्ट्स के साथ अपने बिज़नेस को बेहतर तरीके से समझें।"
              : "Understand your business better with simple charts, stock statuses, and clear reports."
            }
          </p>

          <div style={styles.checkList}>
            <div style={styles.checkItem}>
              <span style={styles.checkIcon}>✓</span> {language === "hi" ? "आज की बिक्री और भुगतान" : "Today's Sales & Payments"}
            </div>
            <div style={styles.checkItem}>
              <span style={styles.checkIcon}>✓</span> {language === "hi" ? "बकाया राशि की स्थिति" : "Outstanding Balances Status"}
            </div>
            <div style={styles.checkItem}>
              <span style={styles.checkIcon}>✓</span> {language === "hi" ? "लो स्टॉक अलर्ट" : "Low Stock Warnings"}
            </div>
            <div style={styles.checkItem}>
              <span style={styles.checkIcon}>✓</span> {language === "hi" ? "हाल की गतिविधियां" : "Recent Activity Audits"}
            </div>
          </div>
        </div>

        {/* Right Side: Mockup Dashboard App Window */}
        <div
          ref={observerRef}
          style={{
            ...styles.rightCol,
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0) scale(1)" : "translateY(35px) scale(0.97)",
            transition: "opacity var(--transition-slow), transform var(--transition-slow)",
          }}
        >
          <div style={styles.appWindow}>
            {/* Window Header */}
            <div style={styles.windowHeader}>
              <div style={styles.windowDots}>
                <span style={{ ...styles.windowDot, backgroundColor: "#ff5f56" }}></span>
                <span style={{ ...styles.windowDot, backgroundColor: "#ffbd2e" }}></span>
                <span style={{ ...styles.windowDot, backgroundColor: "#27c93f" }}></span>
              </div>
              <div style={styles.windowHeaderTitle}>
                {language === "hi" ? "🏬 किरण स्टोर · BoloBiz कंट्रोल पैनल" : "🏬 Kirana Store · BoloBiz Control Panel"}
              </div>
              <div style={{ width: "40px" }}></div>
            </div>

            <div style={styles.windowLayout}>
              {/* App Sidebar */}
              <aside style={styles.sidebar}>
                <div style={styles.sidebarBrand}>🎙_ BoloBiz</div>
                <nav style={styles.sidebarNav}>
                  <div style={styles.activeSidebarLink}>
                    📊 {language === "hi" ? "डैशबोर्ड" : "Dashboard"}
                  </div>
                  <div style={styles.sidebarLink}>
                    👥 {language === "hi" ? "ग्राहक" : "Customers"}
                  </div>
                  <div style={styles.sidebarLink}>
                    📈 {language === "hi" ? "बिक्री" : "Sales"}
                  </div>
                  <div style={styles.sidebarLink}>
                    📦 {language === "hi" ? "इन्वेंट्री" : "Inventory"}
                  </div>
                  <div style={styles.sidebarLink}>
                    💸 {language === "hi" ? "लेन-देन" : "Transactions"}
                  </div>
                  <div style={styles.sidebarLink}>
                    👛 {language === "hi" ? "खर्च" : "Expenses"}
                  </div>
                  <div style={styles.sidebarLink}>
                    📑 {language === "hi" ? "रिपोर्ट्स" : "Reports"}
                  </div>
                  <div style={styles.sidebarLink}>
                    ⚙️ {language === "hi" ? "सेटिंग्स" : "Settings"}
                  </div>
                </nav>
              </aside>

              {/* App Workspace */}
              <div style={styles.workspace}>
                {/* Workspace Header */}
                <div style={styles.workspaceHeader}>
                  <div style={styles.searchBar}>
                    {language === "hi" ? "🔍 खोजें..." : "🔍 Search..."}
                  </div>
                  <div style={styles.profileBox}>
                    <span>🔔</span>
                    <span style={styles.avatarMini}>🤵</span>
                    <span>{language === "hi" ? "किरण स्टोर ∨" : "Kirana Store ∨"}</span>
                  </div>
                </div>

                {/* Metrics Cards Grid */}
                <div style={styles.metricsGrid}>
                  <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>
                      {language === "hi" ? "आज की बिक्री" : "Today's Sales"}
                    </span>
                    <div style={styles.metricVal}>₹ 8,450</div>
                    <span style={styles.metricTrendGreen}>
                      {language === "hi" ? "▲ 12% कल से" : "▲ 12% vs yesterday"}
                    </span>
                  </div>
                  <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>
                      {language === "hi" ? "प्राप्त भुगतान" : "Payments Received"}
                    </span>
                    <div style={styles.metricVal}>₹ 2,100</div>
                    <span style={styles.metricTrendGreen}>
                      {language === "hi" ? "▲ 8% कल से" : "▲ 8% vs yesterday"}
                    </span>
                  </div>
                  <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>
                      {language === "hi" ? "बकाया राशि" : "Outstanding Credit"}
                    </span>
                    <div style={{ ...styles.metricVal, color: "var(--status-danger)" }}>₹ 18,750</div>
                    <span style={styles.metricTrendPurple}>
                      {language === "hi" ? "▲ 15% कल से" : "▲ 15% vs yesterday"}
                    </span>
                  </div>
                  <div style={styles.metricCard}>
                    <span style={styles.metricLabel}>
                      {language === "hi" ? "कुल खर्च" : "Total Expenses"}
                    </span>
                    <div style={styles.metricVal}>₹ 3,240</div>
                    <span style={styles.metricTrendRed}>
                      {language === "hi" ? "▼ 5% कल से" : "▼ 5% vs yesterday"}
                    </span>
                  </div>
                </div>

                {/* Double Panel Layout */}
                <div style={styles.dbPanels}>
                  {/* Debtors List */}
                  <div style={styles.panel}>
                    <div style={styles.panelHeaderRow}>
                      <h4 style={styles.panelTitle}>
                        {language === "hi" ? "बकाया राशि वाले ग्राहक" : "Outstanding Customers"}
                      </h4>
                      <span style={styles.panelLink}>
                        {language === "hi" ? "सभी देखें" : "See All"}
                      </span>
                    </div>
                    <div style={styles.panelList}>
                      {debtors.map((item, idx) => (
                        <div key={idx} style={styles.panelItem}>
                          <div style={styles.customerNameBox}>
                            <span style={styles.customerAvatar}>👤</span>
                            <span>{item.name}</span>
                          </div>
                          <span style={styles.customerAmt}>{item.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity History */}
                  <div style={styles.panel}>
                    <div style={styles.panelHeaderRow}>
                      <h4 style={styles.panelTitle}>
                        {language === "hi" ? "हाल की गतिविधियां" : "Recent Activity"}
                      </h4>
                      <span style={styles.panelLink}>
                        {language === "hi" ? "सभी देखें" : "See All"}
                      </span>
                    </div>
                    <div style={styles.panelList}>
                      {activities.map((act, idx) => (
                        <div key={idx} style={styles.panelItem}>
                          <div style={styles.activityInfo}>
                            <span>
                              {act.type === "credit" && "💰"}
                              {act.type === "payment" && "💸"}
                              {act.type === "stock" && "📦"}
                            </span>
                            <span>{act.title}</span>
                          </div>
                          <span style={styles.activityTime}>{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "90px 2rem",
    backgroundColor: "var(--bg-primary)",
    position: "relative" as const,
    borderBottom: "1px solid rgba(0, 0, 0, 0.02)",
  },
  container: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1.8fr",
    gap: "4rem",
    alignItems: "center",
    "@media(max-width: 990px)": {
      gridTemplateColumns: "1fr",
      gap: "3rem",
    },
  },
  leftCol: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    textAlign: "left" as const,
    "@media(max-width: 990px)": {
      alignItems: "center",
      textAlign: "center" as const,
    },
  },
  badgePill: {
    display: "inline-block",
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    color: "var(--accent-purple)",
    padding: "0.3rem 1rem",
    borderRadius: "15px",
    fontSize: "0.85rem",
    fontWeight: 700,
    marginBottom: "1rem",
  },
  heading: {
    fontSize: "2.75rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-1px",
    marginBottom: "1rem",
  },
  subtext: {
    fontSize: "1.15rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    marginBottom: "2rem",
    maxWidth: "460px",
  },
  checkList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.85rem",
    alignItems: "flex-start",
  },
  checkItem: {
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
  },
  rightCol: {
    width: "100%",
  },
  appWindow: {
    width: "100%",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    background: "#ffffff",
  },
  windowHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1.25rem",
    background: "#f9fafb",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  },
  windowDots: {
    display: "flex",
    gap: "0.4rem",
  },
  windowDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  windowHeaderTitle: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    fontWeight: 600,
  },
  windowLayout: {
    display: "flex",
    height: "460px",
    "@media(max-width: 600px)": {
      height: "auto",
      flexDirection: "column" as const,
    },
  },
  sidebar: {
    width: "160px",
    background: "#f9fafb",
    borderRight: "1px solid rgba(0,0,0,0.05)",
    padding: "1.25rem 0.85rem",
    display: "flex",
    flexDirection: "column" as const,
    "@media(max-width: 600px)": {
      width: "100%",
      borderRight: "none",
      borderBottom: "1px solid rgba(0,0,0,0.05)",
    },
  },
  sidebarBrand: {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#7c3aed",
    marginBottom: "1.5rem",
    textAlign: "left" as const,
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  sidebarLink: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    padding: "0.4rem 0.5rem",
    borderRadius: "6px",
    textAlign: "left" as const,
    cursor: "pointer",
  },
  activeSidebarLink: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#7c3aed",
    background: "rgba(124, 58, 237, 0.08)",
    padding: "0.4rem 0.5rem",
    borderRadius: "6px",
    textAlign: "left" as const,
  },
  workspace: {
    flex: 1,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
    background: "#ffffff",
    overflowY: "auto" as const,
  },
  workspaceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
  },
  searchBar: {
    background: "#f3f4f6",
    padding: "0.35rem 1rem",
    borderRadius: "20px",
    color: "var(--text-muted)",
  },
  profileBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  avatarMini: {
    fontSize: "1.1rem",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "1rem",
  },
  metricCard: {
    background: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    borderRadius: "10px",
    padding: "0.85rem",
    textAlign: "left" as const,
    boxShadow: "0 4px 10px rgba(0,0,0,0.01)",
  },
  metricLabel: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  metricVal: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    margin: "0.2rem 0",
  },
  metricTrendGreen: {
    fontSize: "0.65rem",
    color: "var(--status-success)",
    fontWeight: 700,
  },
  metricTrendPurple: {
    fontSize: "0.65rem",
    color: "var(--accent-purple)",
    fontWeight: 700,
  },
  metricTrendRed: {
    fontSize: "0.65rem",
    color: "var(--status-danger)",
    fontWeight: 700,
  },
  dbPanels: {
    display: "grid",
    gridTemplateColumns: "1fr 1.2fr",
    gap: "1rem",
    "@media(max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  },
  panel: {
    border: "1px solid rgba(0, 0, 0, 0.05)",
    borderRadius: "10px",
    padding: "1rem",
    textAlign: "left" as const,
  },
  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  panelTitle: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  panelLink: {
    fontSize: "0.75rem",
    color: "#7c3aed",
    fontWeight: 600,
    cursor: "pointer",
  },
  panelList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  panelItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0.65rem",
    background: "#f9fafb",
    borderRadius: "6px",
    fontSize: "0.75rem",
  },
  customerNameBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  customerAvatar: {
    fontSize: "0.95rem",
  },
  customerAmt: {
    color: "var(--status-danger)",
    fontWeight: 700,
  },
  activityInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  activityTime: {
    fontSize: "0.7rem",
    color: "var(--text-muted)",
  },
};
