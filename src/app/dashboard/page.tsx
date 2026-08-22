"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils/format";

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
  businessName: string;
  ownerName: string;
  totalTransactions: number;
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

  // Setup form states
  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");

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

  useEffect(() => {
    if (stats) {
      if (stats.businessName && (stats.businessName.endsWith("'s Kirana Store") || stats.businessName === "My's Kirana Store")) {
        setShopName(stats.businessName);
      }
      if (stats.ownerName) {
        setOwnerName(stats.ownerName);
      }
    }
  }, [stats]);

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError("");
    setSetupLoading(true);

    try {
      const res = await fetch("/api/dashboard/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, ownerName }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update business profile");
      }
      window.location.reload();
    } catch (err: any) {
      setSetupError(err.message);
      setSetupLoading(false);
    }
  };

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

  // Heuristic: setup is required if stats has no transactions, no customers, no products, and name ends with default pattern
  const isSetupRequired = 
    stats.totalCustomers === 0 && 
    stats.totalProducts === 0 && 
    stats.totalTransactions === 0 && 
    (stats.businessName.endsWith("'s Kirana Store") || stats.businessName === "My's Kirana Store");

  // Detect empty state onboarding requirement
  const isEmptyBusiness = stats.totalCustomers === 0 && stats.totalProducts === 0 && stats.totalTransactions === 0;

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

      {isSetupRequired ? (
        <div className="glass-panel animate-fade-in" style={styles.setupCard}>
          <div style={styles.setupHeader}>
            <span style={styles.setupIcon}>🏪</span>
            <div>
              <h3 style={styles.setupTitle}>Setup Your Business Profile</h3>
              <p style={styles.setupDesc}>
                Please configure your store details to activate your voice assistant and business intelligence dashboard.
              </p>
            </div>
          </div>

          {setupError && <div style={styles.errorAlert}>{setupError}</div>}

          <form onSubmit={handleSetupSubmit} style={styles.setupForm}>
            <div style={styles.setupInputGroup}>
              <label style={styles.setupLabel}>Business / Shop Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Jyoti General Store"
                style={styles.setupInput}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>

            <div style={styles.setupInputGroup}>
              <label style={styles.setupLabel}>Owner Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Ramesh Kumar"
                style={styles.setupInput}
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>

            <button type="submit" disabled={setupLoading} style={styles.setupSubmitBtn}>
              {setupLoading ? "Saving Profile..." : "Complete Setup & Launch 🚀"}
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Conditional Onboarding Component (Compact Getting Started Guide) */}
          {isEmptyBusiness && (
            <div className="glass-panel" style={styles.compactOnboardingCard}>
              <div style={styles.compactOnboardingHeader}>
                <span style={styles.compactOnboardingIcon}>🚀</span>
                <div>
                  <h3 style={styles.compactOnboardingTitle}>Getting Started Guide</h3>
                  <p style={styles.compactOnboardingDesc}>
                    BoloBiz is a voice-first assistant. You can manage your ledger simply by speaking or typing naturally in Hindi, Hinglish, or English to record sales, credit, and products.
                  </p>
                </div>
              </div>

              <div style={styles.compactStepsGrid}>
                <div style={styles.compactStepRow}>
                  <span style={styles.stepNumMini}>1</span>
                  <div>
                    <h4 style={styles.stepHeadingMini}>Add Products</h4>
                    <p style={styles.stepTextMini}>Say: <span style={styles.codeTextMini}>"Add Maggi price 20 rupees"</span></p>
                  </div>
                </div>
                <div style={styles.compactStepRow}>
                  <span style={styles.stepNumMini}>2</span>
                  <div>
                    <h4 style={styles.stepHeadingMini}>Add Customers</h4>
                    <p style={styles.stepTextMini}>Say: <span style={styles.codeTextMini}>"Create Ramesh customer"</span></p>
                  </div>
                </div>
                <div style={styles.compactStepRow}>
                  <span style={styles.stepNumMini}>3</span>
                  <div>
                    <h4 style={styles.stepHeadingMini}>Log Credit/Sales</h4>
                    <p style={styles.stepTextMini}>Say: <span style={styles.codeTextMini}>"Ramesh ko 500 udhaar diye"</span></p>
                  </div>
                </div>
              </div>

              <div style={styles.compactOnboardingActions}>
                <Link href="/dashboard/assistant" style={styles.actionBtnPrimaryMini}>🎙️ Open AI Assistant</Link>
                <Link href="/dashboard/inventory" style={styles.actionBtnSecondaryMini}>📦 Add Products</Link>
                <Link href="/dashboard/customers" style={styles.actionBtnSecondaryMini}>👥 Add Customers</Link>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div style={styles.grid}>
            {/* Today's Sales */}
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricIcon}>💰</span>
                <span style={{
                  ...styles.trendIndicator,
                  color: stats.salesChangePercent >= 0 ? "var(--status-success)" : "var(--status-danger)"
                }}>
                  {stats.salesChangePercent >= 0 ? `+${stats.salesChangePercent}%` : `${stats.salesChangePercent}%`}
                </span>
              </div>
              <div style={styles.metricLabel}>Today's Sales</div>
              <div style={styles.metricValue}>{formatCurrency(stats.salesToday)}</div>
              <div style={styles.metricSub}>{stats.salesTodayCount} transaction(s) logged</div>
            </div>

            {/* Expenses */}
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricIcon}>💸</span>
              </div>
              <div style={styles.metricLabel}>Today's Expenses</div>
              <div style={styles.metricValue}>{formatCurrency(stats.expensesToday)}</div>
              <div style={styles.metricSub}>Weekly: {formatCurrency(stats.expensesThisWeek)}</div>
            </div>

            {/* Sales After Expenses */}
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricIcon}>📈</span>
              </div>
              <div style={styles.metricLabel}>Sales after Expenses</div>
              <div style={{
                ...styles.metricValue,
                color: stats.salesAfterExpensesToday >= 0 ? "var(--accent-cyan)" : "var(--status-danger)"
              }}>
                {formatCurrency(stats.salesAfterExpensesToday)}
              </div>
              <div style={styles.metricSub}>Net Cash Position (Today)</div>
            </div>

            {/* Outstanding Udhaar */}
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricIcon}>🔴</span>
                {stats.debtorsCount > 0 && (
                  <span style={{ ...styles.trendIndicator, color: "var(--status-warning)" }}>
                    {stats.debtorsCount} debtor(s)
                  </span>
                )}
              </div>
              <div style={styles.metricLabel}>Outstanding Udhaar</div>
              <div style={{ ...styles.metricValue, color: "var(--status-warning)" }}>
                {formatCurrency(stats.totalOutstandingCredit)}
              </div>
              <div style={styles.metricSub}>
                {stats.highestOutstandingCustomer 
                  ? `Top: ${stats.highestOutstandingCustomer.name} (${formatCurrency(stats.highestOutstandingCustomer.balance)})`
                  : "No pending collections"
                }
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={styles.mainColumns}>
            
            {/* Left column: Proactive Insights & 7-Day Trend */}
            <div style={styles.leftColumn}>
              
              {/* Proactive Business Insights Feed */}
              <div className="glass-panel" style={styles.panel}>
                <div style={styles.panelHeaderRow}>
                  <h3 style={styles.panelTitle}>💡 BoloBiz Smart Insights</h3>
                  {stats.insights.length > 3 && (
                    <button 
                      onClick={() => setShowAllInsights(!showAllInsights)}
                      style={styles.toggleInsightsBtn}
                    >
                      {showAllInsights ? "Show Less" : `View All (${stats.insights.length})`}
                    </button>
                  )}
                </div>
                <div style={styles.insightsList}>
                  {visibleInsights.length === 0 ? (
                    <div style={styles.emptyInsightsContainer}>
                      <span style={{ fontSize: "2rem" }}>🎯</span>
                      <h4 style={{ color: "var(--text-primary)", margin: "0.5rem 0 0.2rem" }}>All Set for Today!</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0 }}>
                        Your business reports are clean. Log more daily sales to trigger intelligence rules.
                      </p>
                    </div>
                  ) : (
                    visibleInsights.map((insight, idx) => (
                      <div key={idx} style={{
                        ...styles.insightItem,
                        borderLeft: insight.priority === 1 
                          ? "4px solid var(--status-danger)" 
                          : insight.priority === 2 
                            ? "4px solid var(--status-warning)" 
                            : "4px solid var(--accent-purple)",
                        background: insight.priority === 1
                          ? "rgba(239, 68, 68, 0.03)"
                          : "var(--bg-secondary)"
                      }}>
                        <div style={styles.insightHeader}>
                          <span style={styles.insightTitle}>{insight.title}</span>
                          <span style={{
                            ...styles.insightPriorityBadge,
                            color: insight.priority === 1 
                              ? "var(--status-danger)" 
                              : insight.priority === 2 
                                ? "var(--status-warning)" 
                                : "var(--accent-purple)",
                            borderColor: insight.priority === 1 
                              ? "rgba(239, 68, 68, 0.2)" 
                              : insight.priority === 2 
                                ? "rgba(245, 158, 11, 0.2)" 
                                : "rgba(124, 58, 237, 0.2)"
                          }}>
                            {insight.priority === 1 ? "Critical" : insight.priority === 2 ? "Important" : "Info"}
                          </span>
                        </div>
                        <div style={styles.insightFact}>{insight.fact}</div>
                        <div style={styles.insightSuggestion}>💡 <strong>Suggestion:</strong> {insight.suggestion}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 7-day Sales Trend SVG */}
              <div className="glass-panel" style={styles.panel}>
                <h3 style={styles.panelTitle}>📊 7-Day Sales Trend (Weekly)</h3>
                <div style={styles.chartContainer}>
                  <svg viewBox="0 0 520 180" style={styles.svgChart}>
                    {/* Y-axis helper lines */}
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
                        <div style={styles.listItemValue}>{formatCurrency(debtor.balance)}</div>
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
        </>
      )}
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
  metricCard: {
    padding: "1.5rem",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--glass-border)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    boxShadow: "0 8px 32px var(--glass-shadow)",
  },
  metricHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricIcon: {
    fontSize: "1.5rem",
  },
  metricLabel: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  metricValue: {
    fontSize: "1.85rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    lineHeight: 1.2,
  },
  metricSub: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    marginTop: "0.25rem",
  },
  trendIndicator: {
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "0.2rem 0.5rem",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
  },
  mainColumns: {
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
  panelHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.25rem",
  },
  panelTitle: {
    fontSize: "1.15rem",
    fontWeight: 800,
    color: "var(--text-primary)",
  },
  toggleInsightsBtn: {
    background: "transparent",
    border: "none",
    color: "var(--accent-cyan)",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  insightsList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  emptyInsightsContainer: {
    textAlign: "center" as const,
    padding: "2rem",
    color: "var(--text-secondary)",
  },
  insightItem: {
    padding: "1rem 1.25rem",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    transition: "transform 0.2s ease",
  },
  insightHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  insightTitle: {
    fontSize: "0.95rem",
    fontWeight: 750,
    color: "var(--text-primary)",
  },
  insightPriorityBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "0.2rem 0.5rem",
    borderRadius: "12px",
    border: "1px solid",
    textTransform: "uppercase" as const,
  },
  insightFact: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  insightSuggestion: {
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    lineHeight: 1.4,
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
  compactOnboardingCard: {
    padding: "1.5rem",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
    background: "linear-gradient(135deg, rgba(124, 58, 237, 0.04) 0%, rgba(219, 39, 119, 0.04) 100%)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    textAlign: "left" as const,
    boxShadow: "0 8px 32px var(--glass-shadow)",
  },
  compactOnboardingHeader: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  compactOnboardingIcon: {
    fontSize: "2rem",
  },
  compactOnboardingTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "0.15rem",
  },
  compactOnboardingDesc: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  compactStepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    width: "100%",
  },
  compactStepRow: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "flex-start",
    background: "var(--bg-secondary)",
    padding: "0.85rem",
    borderRadius: "10px",
    border: "1px solid var(--glass-border)",
  },
  stepNumMini: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    color: "var(--accent-purple)",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: "0.75rem",
    flexShrink: 0,
    marginTop: "0.1rem",
  },
  stepHeadingMini: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.1rem",
  },
  stepTextMini: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
  },
  codeTextMini: {
    fontFamily: "monospace",
    background: "var(--bg-primary)",
    padding: "0.05rem 0.2rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    color: "var(--accent-pink)",
  },
  compactOnboardingActions: {
    display: "flex",
    gap: "0.75rem",
    flexWrap: "wrap" as const,
  },
  actionBtnPrimaryMini: {
    background: "var(--accent-gradient)",
    color: "#fff",
    padding: "0.5rem 1.25rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(219, 39, 119, 0.2)",
  },
  actionBtnSecondaryMini: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    padding: "0.5rem 1.25rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: 600,
  },
  setupCard: {
    padding: "2.5rem",
    borderRadius: "20px",
    background: "linear-gradient(135deg, rgba(6, 182, 212, 0.04) 0%, rgba(99, 102, 241, 0.04) 100%)",
    border: "1px solid rgba(6, 182, 212, 0.15)",
    boxShadow: "0 10px 45px var(--glass-shadow)",
    maxWidth: "550px",
    margin: "2rem auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  setupHeader: {
    display: "flex",
    gap: "1.25rem",
    alignItems: "center",
  },
  setupIcon: {
    fontSize: "2.5rem",
  },
  setupTitle: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "0.25rem",
  },
  setupDesc: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  setupForm: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
    width: "100%",
  },
  setupInputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  setupLabel: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  setupInput: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.2s ease",
  },
  setupSubmitBtn: {
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)",
    color: "#fff",
    fontWeight: 700,
    padding: "0.85rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    marginTop: "0.5rem",
    boxShadow: "0 4px 12px rgba(6, 182, 212, 0.15)",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid var(--status-danger)",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
  },
};
