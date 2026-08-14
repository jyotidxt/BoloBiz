"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Insight {
  type: string;
  title: string;
  fact: string;
  suggestion: string;
  priority: number;
  metadata?: any;
}

interface TrendItem {
  date: string;
  amount: number;
}

interface Debtor {
  name: string;
  balance: number;
  phone: string;
  oldestPendingDays: number;
}

interface LowStock {
  name: string;
  stock: number;
  threshold: number;
}

interface BIStats {
  timezone: string;
  salesToday: number;
  salesTodayCount: number;
  salesYesterday: number;
  salesYesterdayCount: number;
  salesChangePercent: number;
  salesThisWeek: number;
  salesThisMonth: number;
  salesPrevMonth: number;
  monthSalesChangePercent: number;
  expensesToday: number;
  expensesThisWeek: number;
  expensesThisMonth: number;
  salesAfterExpensesToday: number;
  totalOutstandingCredit: number;
  debtorsCount: number;
  highestOutstandingCustomer: { name: string; balance: number } | null;
  oldestOutstandingDays: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  recentSalesTrend: TrendItem[];
  debtorsList: Debtor[];
  lowStockList: LowStock[];
  insights: Insight[];
}

export default function DashboardHome() {
  const [stats, setStats] = useState<BIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAllInsights, setShowAllInsights] = useState(false);

  const fetchInsights = async () => {
    try {
      const res = await fetch("/api/dashboard/insights");
      if (!res.ok) {
        throw new Error("Failed to load business intelligence metrics");
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: "var(--text-secondary)" }}>Analyzing business records & generating insights...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-panel" style={styles.errorCard}>
        <h3 style={{ color: "var(--text-primary)" }}>⚠️ Error Loading Intelligence</h3>
        <p style={{ color: "var(--text-secondary)" }}>{error || "Failed to retrieve business metrics."}</p>
        <button onClick={fetchInsights} style={styles.retryBtn}>Retry Load</button>
      </div>
    );
  }

  // Detect empty state onboarding requirement
  const isEmptyBusiness = stats.totalCustomers === 0 && stats.totalProducts === 0;

  if (isEmptyBusiness) {
    return (
      <div style={styles.container} className="animate-fade-in">
        <div className="glass-panel" style={styles.welcomeBanner}>
          <h2 style={styles.welcomeTitle}>Welcome to BoloBiz! 👋</h2>
          <p style={styles.welcomeSubtitle}>Your voice-first assistant is ready. Let's get your business set up.</p>
        </div>

        <div className="glass-panel" style={styles.onboardingCard}>
          <span style={styles.onboardingIcon}>🚀</span>
          <h3 style={styles.onboardingTitle}>Getting Started Guide</h3>
          <p style={styles.onboardingDesc}>
            BoloBiz operates using natural speech and text. You can seed your database automatically by typing or talking.
          </p>

          <div style={styles.stepsList}>
            <div style={styles.stepRow}>
              <span style={styles.stepNum}>1</span>
              <div>
                <h4 style={styles.stepHeading}>Add Your Products</h4>
                <p style={styles.stepText}>Say: <span style={styles.codeText}>"Add Maggi product price 20 rupees"</span> or click the button below.</p>
              </div>
            </div>

            <div style={styles.stepRow}>
              <span style={styles.stepNum}>2</span>
              <div>
                <h4 style={styles.stepHeading}>Add Your Customers</h4>
                <p style={styles.stepText}>Say: <span style={styles.codeText}>"Create Ramesh customer phone 9876543210"</span></p>
              </div>
            </div>

            <div style={styles.stepRow}>
              <span style={styles.stepNum}>3</span>
              <div>
                <h4 style={styles.stepHeading}>Log Sales & Credit Ledger</h4>
                <p style={styles.stepText}>Say: <span style={styles.codeText}>"Ramesh ko 500 rupaye udhaar diye"</span> or <span style={styles.codeText}>"aaj 1200 ka payment received hua"</span></p>
              </div>
            </div>
          </div>

          <div style={styles.onboardingActions}>
            <Link href="/dashboard/assistant" style={styles.actionBtnPrimary}>🎙️ Open AI Assistant</Link>
            <Link href="/dashboard/inventory" style={styles.actionBtnSecondary}>📦 Add Products Manual</Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter insights based on toggle
  const visibleInsights = showAllInsights ? stats.insights : stats.insights.slice(0, 3);
  
  // Find highest sales value for scaling SVG chart bars
  const maxSalesVal = Math.max(...stats.recentSalesTrend.map(t => t.amount), 500);

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Overview Greeting */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Dashboard Overview</h2>
          <p style={styles.subtitle}>Here is what requires your attention today.</p>
        </div>
        <div style={styles.timezoneBadge}>🕒 {stats.timezone}</div>
      </div>

      {/* Metrics Grid */}
      <div style={styles.grid}>
        {/* Today's Sales */}
        <div className="glass-panel glass-panel-hover" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Today's Sales</span>
            <span style={styles.cardIcon}>💰</span>
          </div>
          <div style={styles.cardValue}>₹{stats.salesToday.toLocaleString("en-IN")}</div>
          <div style={styles.cardFooter}>
            {stats.salesChangePercent > 0 ? (
              <span style={styles.trendUp}>↑ {stats.salesChangePercent}% vs yesterday</span>
            ) : stats.salesChangePercent < 0 ? (
              <span style={styles.trendDown}>↓ {Math.abs(stats.salesChangePercent)}% vs yesterday</span>
            ) : (
              <span style={styles.trendFlat}>Same as yesterday</span>
            )}
            <div style={styles.subLabel}>Count: {stats.salesTodayCount} transactions</div>
          </div>
        </div>

        {/* Today's Expenses */}
        <div className="glass-panel glass-panel-hover" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Today's Expenses</span>
            <span style={styles.cardIcon}>💸</span>
          </div>
          <div style={styles.cardValue}>₹{stats.expensesToday.toLocaleString("en-IN")}</div>
          <div style={styles.cardFooter}>
            <span style={styles.trendFlat}>Weekly: ₹{stats.expensesThisWeek.toLocaleString("en-IN")}</span>
            <div style={styles.subLabel}>Monthly: ₹{stats.expensesThisMonth.toLocaleString("en-IN")}</div>
          </div>
        </div>

        {/* Sales after Expenses */}
        <div className="glass-panel glass-panel-hover" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Sales after Expenses</span>
            <span style={styles.cardIcon}>📊</span>
          </div>
          <div style={{ ...styles.cardValue, color: stats.salesAfterExpensesToday >= 0 ? "var(--status-success)" : "var(--status-danger)" }}>
            ₹{stats.salesAfterExpensesToday.toLocaleString("en-IN")}
          </div>
          <div style={styles.cardFooter}>
            <span style={styles.trendFlat}>Today's net cash flow balance</span>
            <div style={styles.subLabel}>Calculated deterministically</div>
          </div>
        </div>

        {/* Total Udhaar / Credit */}
        <div className="glass-panel glass-panel-hover" style={{ ...styles.card, borderLeft: "4px solid var(--accent-purple)" }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Total Udhaar (Credit)</span>
            <span style={styles.cardIcon}>👥</span>
          </div>
          <div style={styles.cardValue}>₹{stats.totalOutstandingCredit.toLocaleString("en-IN")}</div>
          <div style={styles.cardFooter}>
            <span style={styles.trendFlat}>Lent to {stats.debtorsCount} customer(s)</span>
            {stats.highestOutstandingCustomer && (
              <div style={styles.subLabel}>Top: {stats.highestOutstandingCustomer.name} (₹{stats.highestOutstandingCustomer.balance})</div>
            )}
          </div>
        </div>
      </div>

      {/* Main content grid layout */}
      <div style={styles.mainGrid}>
        
        {/* Left column: Insights and Charts */}
        <div style={styles.leftColumn}>
          
          {/* Insights Panel */}
          <div className="glass-panel" style={styles.panel}>
            <div style={styles.panelHeader}>
              <h3 style={styles.panelTitle}>💡 Proactive Insights Feed</h3>
              <span style={styles.badgeCount}>{stats.insights.length} alerts</span>
            </div>
            
            {stats.insights.length === 0 ? (
              <div style={styles.emptyInsights}>
                <span>✨</span> No urgent business alerts detected today. All operations are running smoothly!
              </div>
            ) : (
              <div style={styles.insightsList}>
                {visibleInsights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      ...styles.insightCard, 
                      borderColor: insight.priority === 1 ? "var(--status-danger)" : insight.priority === 2 ? "var(--status-warning)" : "var(--glass-border)"
                    }}
                  >
                    <div style={styles.insightHeader}>
                      <span style={{ 
                        ...styles.insightType, 
                        color: insight.priority === 1 ? "var(--status-danger)" : insight.priority === 2 ? "var(--status-warning)" : "var(--accent-purple)"
                      }}>
                        {insight.title}
                      </span>
                      <span style={styles.priorityBadge}>
                        {insight.priority === 1 ? "Critical" : insight.priority === 2 ? "Important" : "Info"}
                      </span>
                    </div>
                    <p style={styles.insightFact}><strong>Fact:</strong> {insight.fact}</p>
                    <p style={styles.insightSuggestion}><strong>Suggestion:</strong> {insight.suggestion}</p>
                  </div>
                ))}

                {stats.insights.length > 3 && (
                  <button 
                    onClick={() => setShowAllInsights(!showAllInsights)} 
                    style={styles.toggleInsightsBtn}
                  >
                    {showAllInsights ? "Show Less Insights" : `View All Insights (${stats.insights.length})`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SVG Sales Trend Chart */}
          <div className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>📈 7-Day Sales Trend</h3>
            <div style={styles.chartContainer}>
              <svg viewBox="0 0 500 180" style={styles.svgChart}>
                {/* Horizontal grid lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="var(--glass-border)" strokeDasharray="3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="var(--glass-border)" strokeDasharray="3" />
                <line x1="40" y1="130" x2="480" y2="130" stroke="var(--glass-border)" strokeDasharray="3" />
                
                {/* Chart bars */}
                {stats.recentSalesTrend.map((item, idx) => {
                  const barWidth = 32;
                  const gap = 30;
                  const x = 55 + idx * (barWidth + gap);
                  const barHeight = (item.amount / maxSalesVal) * 110;
                  const y = 140 - barHeight;

                  return (
                    <g key={idx}>
                      {/* Bar Background for hover area */}
                      <rect 
                        x={x} 
                        y={30} 
                        width={barWidth} 
                        height={110} 
                        fill="transparent" 
                      />
                      {/* Interactive Bar */}
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={barHeight} 
                        rx="4"
                        fill="url(#barGradient)" 
                        style={{ transition: "height 0.5s ease, y 0.5s ease" }}
                      />
                      {/* Amount Labels */}
                      <text 
                        x={x + barWidth / 2} 
                        y={y - 8} 
                        textAnchor="middle" 
                        fontSize="9" 
                        fill="var(--text-secondary)"
                        fontWeight="700"
                      >
                        {item.amount > 0 ? `₹${Math.round(item.amount)}` : ""}
                      </text>
                      {/* Day Labels */}
                      <text 
                        x={x + barWidth / 2} 
                        y="158" 
                        textAnchor="middle" 
                        fontSize="10" 
                        fill="var(--text-secondary)"
                        fontWeight="600"
                      >
                        {item.date}
                      </text>
                    </g>
                  );
                })}
                
                {/* Gradients */}
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-purple)" />
                    <stop offset="100%" stopColor="var(--accent-pink)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

        </div>

        {/* Right column: Aged Credit Follow-up, Low stock list & AI banner */}
        <div style={styles.rightColumn}>
          
          {/* Ask BoloBiz voice widget */}
          <div className="glass-panel" style={styles.assistantWidget}>
            <div style={styles.assistantIcon}>🎙️</div>
            <h3 style={styles.assistantWidgetTitle}>Ask BoloBiz</h3>
            <p style={styles.assistantWidgetText}>
              Simply type or click the microphone to ask questions about your ledger:
            </p>
            <div style={styles.queryExamples}>
              <div style={styles.queryChip}>"Who owes me the most money?"</div>
              <div style={styles.queryChip}>"Maggi stock kitni bachi hai?"</div>
              <div style={styles.queryChip}>"Kya koi product stock out hai?"</div>
            </div>
            <Link href="/dashboard/assistant" style={styles.assistantWidgetLink}>
              🎙️ Start Talking now
            </Link>
          </div>

          {/* Aged Udhaar list */}
          <div className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>👥 Credit Aging (Outstanding)</h3>
            {stats.debtorsList.length === 0 ? (
              <p style={styles.emptyText}>No outstanding balances.</p>
            ) : (
              <div style={styles.miniList}>
                {stats.debtorsList.map((debtor, idx) => (
                  <div key={idx} style={styles.miniListItem}>
                    <div>
                      <div style={styles.listItemName}>{debtor.name}</div>
                      <div style={styles.listItemSubtitle}>Pending: {debtor.oldestPendingDays} day(s)</div>
                    </div>
                    <div style={styles.listItemValue}>₹{debtor.balance.toLocaleString("en-IN")}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low stock list */}
          <div className="glass-panel" style={styles.panel}>
            <h3 style={styles.panelTitle}>📦 Low Safety Stock Items</h3>
            {stats.lowStockList.length === 0 ? (
              <p style={styles.emptyText}>All products are in safe quantities.</p>
            ) : (
              <div style={styles.miniList}>
                {stats.lowStockList.map((product, idx) => (
                  <div key={idx} style={styles.miniListItem}>
                    <div>
                      <div style={styles.listItemName}>{product.name}</div>
                      <div style={styles.listItemSubtitle}>Safety Limit: {product.threshold} units</div>
                    </div>
                    <div style={{ 
                      ...styles.listItemValue, 
                      color: product.stock === 0 ? "var(--status-danger)" : "var(--status-warning)",
                      fontWeight: 800
                    }}>
                      {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
    padding: "0.25rem",
  },
  loadingContainer: {
    height: "60vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
  },
  spinner: {
    width: "42px",
    height: "42px",
    border: "3px solid rgba(124, 58, 237, 0.1)",
    borderTop: "3px solid var(--accent-purple)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorCard: {
    padding: "2.5rem",
    textAlign: "center" as const,
    maxWidth: "500px",
    margin: "4rem auto",
  },
  retryBtn: {
    background: "var(--accent-purple)",
    color: "#fff",
    padding: "0.6rem 1.75rem",
    borderRadius: "20px",
    marginTop: "1.25rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textAlign: "left" as const,
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
  },
  timezoneBadge: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "0.4rem 0.85rem",
    borderRadius: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "1.25rem",
  },
  card: {
    padding: "1.5rem",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column" as const,
    textAlign: "left" as const,
    borderLeft: "4px solid var(--accent-purple)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  cardLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--text-muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  cardIcon: {
    fontSize: "1.1rem",
  },
  cardValue: {
    fontSize: "1.85rem",
    fontWeight: 850,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
  },
  cardFooter: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.15rem",
  },
  trendUp: {
    fontSize: "0.8rem",
    color: "var(--status-success)",
    fontWeight: 700,
  },
  trendDown: {
    fontSize: "0.8rem",
    color: "var(--status-danger)",
    fontWeight: 700,
  },
  trendFlat: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    fontWeight: 600,
  },
  subLabel: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.6fr 1fr",
    gap: "1.5rem",
    alignItems: "start",
    "@media(max-width: 1024px)": {
      gridTemplateColumns: "1fr",
    },
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  panel: {
    padding: "1.5rem",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column" as const,
    textAlign: "left" as const,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
  },
  panelTitle: {
    fontSize: "1.1rem",
    fontWeight: 750,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
  },
  badgeCount: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    color: "var(--accent-purple)",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "0.2rem 0.6rem",
    borderRadius: "10px",
  },
  emptyInsights: {
    padding: "2rem",
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
  },
  insightsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  insightCard: {
    padding: "1rem 1.25rem",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
    borderLeftWidth: "4px",
    background: "var(--bg-secondary)",
  },
  insightHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  insightType: {
    fontSize: "0.85rem",
    fontWeight: 700,
  },
  priorityBadge: {
    fontSize: "0.65rem",
    background: "rgba(0,0,0,0.04)",
    color: "var(--text-muted)",
    padding: "0.15rem 0.4rem",
    borderRadius: "4px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
  },
  insightFact: {
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    lineHeight: 1.4,
    marginBottom: "0.25rem",
  },
  insightSuggestion: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  toggleInsightsBtn: {
    background: "transparent",
    border: "1px solid var(--glass-border)",
    color: "var(--accent-purple)",
    padding: "0.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    transition: "background 0.2s ease",
    ":hover": {
      background: "rgba(124, 58, 237, 0.05)",
    },
  },
  chartContainer: {
    width: "100%",
    paddingTop: "1rem",
    display: "flex",
    justifyContent: "center",
  },
  svgChart: {
    width: "100%",
    maxHeight: "180px",
  },
  assistantWidget: {
    padding: "1.5rem",
    borderRadius: "16px",
    background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(219,39,119,0.06) 100%)",
    border: "1px solid rgba(124, 58, 237, 0.2)",
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "0.75rem",
  },
  assistantIcon: {
    fontSize: "2.5rem",
  },
  assistantWidgetTitle: {
    fontSize: "1.15rem",
    fontWeight: 750,
    color: "var(--text-primary)",
  },
  assistantWidgetText: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  queryExamples: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
    width: "100%",
    margin: "0.25rem 0",
  },
  queryChip: {
    background: "var(--bg-primary)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    fontSize: "0.75rem",
    padding: "0.4rem",
    borderRadius: "8px",
    fontStyle: "italic",
  },
  assistantWidgetLink: {
    background: "var(--accent-gradient)",
    color: "#fff",
    padding: "0.6rem 1.25rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 700,
    marginTop: "0.25rem",
    width: "100%",
    boxShadow: "0 4px 12px rgba(219, 39, 119, 0.2)",
  },
  miniList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  miniListItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    borderRadius: "10px",
  },
  listItemName: {
    fontWeight: 700,
    fontSize: "0.85rem",
    color: "var(--text-primary)",
  },
  listItemSubtitle: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  listItemValue: {
    fontWeight: 750,
    fontSize: "0.9rem",
    color: "var(--text-primary)",
  },
  emptyText: {
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    padding: "1rem 0",
  },
  welcomeBanner: {
    padding: "1.5rem 2rem",
    background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(219,39,119,0.06) 100%)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    borderRadius: "16px",
    textAlign: "left" as const,
  },
  welcomeTitle: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "0.25rem",
  },
  welcomeSubtitle: {
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
  },
  onboardingCard: {
    padding: "2.5rem",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    textAlign: "center" as const,
    gap: "1.25rem",
  },
  onboardingIcon: {
    fontSize: "3.5rem",
  },
  onboardingTitle: {
    fontSize: "1.45rem",
    fontWeight: 800,
    color: "var(--text-primary)",
  },
  onboardingDesc: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    maxWidth: "500px",
    lineHeight: 1.5,
  },
  stepsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
    textAlign: "left" as const,
    maxWidth: "460px",
    width: "100%",
    margin: "1rem 0",
  },
  stepRow: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
  },
  stepNum: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    color: "var(--accent-purple)",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.85rem",
    flexShrink: 0,
  },
  stepHeading: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.15rem",
  },
  stepText: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  codeText: {
    fontFamily: "monospace",
    background: "var(--bg-secondary)",
    padding: "0.1rem 0.3rem",
    borderRadius: "4px",
    fontSize: "0.8rem",
    color: "var(--accent-pink)",
  },
  onboardingActions: {
    display: "flex",
    gap: "1rem",
    width: "100%",
    maxWidth: "420px",
    marginTop: "0.5rem",
    "@media(max-width: 500px)": {
      flexDirection: "column" as const,
    },
  },
  actionBtnPrimary: {
    flex: 1,
    background: "var(--accent-gradient)",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(219, 39, 119, 0.25)",
  },
  actionBtnSecondary: {
    flex: 1,
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    padding: "0.75rem 1.5rem",
    borderRadius: "20px",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
};
