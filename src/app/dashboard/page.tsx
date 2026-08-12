"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
  customer?: {
    name: string;
  } | null;
}

interface Stats {
  todaySalesAmount: number;
  todaySalesCount: number;
  outstandingCreditAmount: number;
  outstandingCreditCustomersCount: number;
  lowStockProductsCount: number;
  recentTransactions: Transaction[];
}

export default function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) {
        throw new Error("Failed to load dashboard metrics");
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
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading business overview...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="glass-panel" style={styles.errorCard}>
        <h3>⚠️ Error Loading Dashboard</h3>
        <p>{error || "Failed to retrieve statistics."}</p>
        <button onClick={fetchStats} style={styles.retryBtn}>Retry Load</button>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Quick speech banner */}
      <div className="glass-panel" style={styles.assistantBanner}>
        <div style={styles.bannerInfo}>
          <span style={styles.bannerIcon}>🎙️</span>
          <div>
            <h3 style={styles.bannerTitle}>Run Your Business. बस बोलकर।</h3>
            <p style={styles.bannerText}>
              Try speaking to BoloBiz: <span style={styles.bannerQuery}>"Aaj Ramesh ko 500 rupaye udhaar diye"</span> or <span style={styles.bannerQuery}>"aaj ki sales kitni hui?"</span>
            </p>
          </div>
        </div>
        <Link href="/dashboard/assistant" style={styles.bannerBtn}>
          Open Assistant 🗣️
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={styles.grid}>
        <div className="glass-panel glass-panel-hover" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Today's Sales</span>
            <span style={styles.cardIcon}>💰</span>
          </div>
          <div style={styles.cardValue}>₹{stats.todaySalesAmount.toLocaleString("en-IN")}</div>
          <div style={styles.cardDesc}>From {stats.todaySalesCount} transactions today</div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.cardCredit}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Total Udhaar (Credit)</span>
            <span style={styles.cardIcon}>👥</span>
          </div>
          <div style={styles.cardValue}>₹{stats.outstandingCreditAmount.toLocaleString("en-IN")}</div>
          <div style={styles.cardDesc}>Lent to {stats.outstandingCreditCustomersCount} customer(s)</div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.cardWarning}>
          <div style={styles.cardHeader}>
            <span style={styles.cardLabel}>Low Stock Items</span>
            <span style={styles.cardIcon}>📦</span>
          </div>
          <div style={styles.cardValue}>{stats.lowStockProductsCount}</div>
          <div style={styles.cardDesc}>Need replenishment soon</div>
        </div>
      </div>

      {/* Main layout split */}
      <div style={styles.splitGrid}>
        {/* Recent Transactions list */}
        <div className="glass-panel" style={styles.tablePanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.panelTitle}>Recent Activity</h3>
            <Link href="/dashboard/transactions" style={styles.panelLink}>View Ledger</Link>
          </div>
          {stats.recentTransactions.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📝</span>
              <p>No transactions recorded yet.</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                Use the AI assistant to register your first sale or credit!
              </p>
            </div>
          ) : (
            <div style={styles.list}>
              {stats.recentTransactions.map((tx) => (
                <div key={tx.id} style={styles.listItem}>
                  <div style={styles.listInfo}>
                    <div style={styles.listTitle}>
                      {tx.type === "CREDIT" && `Credit (Udhaar) to ${tx.customer?.name || "Customer"}`}
                      {tx.type === "PAYMENT_RECEIVED" && `Payment from ${tx.customer?.name || "Customer"}`}
                      {tx.type === "SALE" && `Sale recorded`}
                      {tx.type === "PURCHASE" && `Inventory Purchase`}
                      {tx.type === "EXPENSE" && `Expense logged`}
                      {tx.type === "REFUND" && `Refund executed`}
                    </div>
                    <div style={styles.listTime}>
                      {new Date(tx.createdAt).toLocaleDateString("en-IN")} · {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {tx.description && <div style={styles.listDesc}>{tx.description}</div>}
                  </div>
                  <div style={getTransactionStyle(tx.type)}>
                    {tx.type === "CREDIT" || tx.type === "EXPENSE" || tx.type === "PURCHASE" ? "-" : "+"}
                    ₹{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shortcuts / Quick Actions */}
        <div className="glass-panel" style={styles.shortcutsPanel}>
          <h3 style={styles.panelTitle}>Quick Actions</h3>
          <div style={styles.shortcutsGrid}>
            <Link href="/dashboard/customers" style={styles.shortcutBtn}>
              <span style={styles.shortcutIcon}>👥</span>
              <div>
                <h4>Manage Customers</h4>
                <p>Register names & contact information</p>
              </div>
            </Link>
            <Link href="/dashboard/inventory" style={styles.shortcutBtn}>
              <span style={styles.shortcutIcon}>📦</span>
              <div>
                <h4>Inventory stock</h4>
                <p>Update quantities & add product cards</p>
              </div>
            </Link>
            <Link href="/dashboard/transactions" style={styles.shortcutBtn}>
              <span style={styles.shortcutIcon}>💰</span>
              <div>
                <h4>Manual Entry</h4>
                <p>Log a direct cash flow or expense</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTransactionStyle(type: string) {
  const base = {
    fontSize: "1.1rem",
    fontWeight: 700,
  };
  if (type === "CREDIT" || type === "EXPENSE" || type === "PURCHASE") {
    return { ...base, color: "var(--status-danger)" };
  }
  return { ...base, color: "var(--status-success)" };
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "2rem",
  },
  loadingContainer: {
    height: "60vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    color: "var(--text-secondary)",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(6, 182, 212, 0.1)",
    borderTop: "3px solid var(--accent-cyan)",
    borderRadius: "50%",
    animation: "voice-bars 1s infinite linear", // reuse standard animations or inline spin
  },
  errorCard: {
    padding: "2rem",
    textAlign: "center" as const,
    maxWidth: "500px",
    margin: "4rem auto",
  },
  retryBtn: {
    background: "var(--accent-cyan)",
    color: "#fff",
    padding: "0.5rem 1.5rem",
    borderRadius: "20px",
    marginTop: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  assistantBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1.5rem 2rem",
    background: "linear-gradient(90deg, rgba(6,182,212,0.08) 0%, rgba(99,102,241,0.08) 100%)",
    border: "1px solid rgba(6, 182, 212, 0.2)",
    borderRadius: "16px",
    flexWrap: "wrap" as const,
    gap: "1.5rem",
  },
  bannerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1.25rem",
    textAlign: "left" as const,
  },
  bannerIcon: {
    fontSize: "2.25rem",
  },
  bannerTitle: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "0.2rem",
  },
  bannerText: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  bannerQuery: {
    color: "var(--accent-cyan)",
    fontStyle: "italic",
    fontWeight: 500,
  },
  bannerBtn: {
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    borderRadius: "25px",
    fontSize: "0.95rem",
    fontWeight: 600,
    boxShadow: "0 4px 15px rgba(6, 182, 212, 0.25)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    padding: "1.75rem",
    borderLeft: "4px solid var(--accent-cyan)",
  },
  cardCredit: {
    padding: "1.75rem",
    borderLeft: "4px solid var(--accent-indigo)",
    background: "rgba(17, 24, 39, 0.7)",
    backdropFilter: "blur(16px)",
    borderTop: "1px solid var(--glass-border)",
    borderBottom: "1px solid var(--glass-border)",
    borderRight: "1px solid var(--glass-border)",
    borderRadius: "var(--radius-md)",
  },
  cardWarning: {
    padding: "1.75rem",
    borderLeft: "4px solid var(--status-warning)",
    background: "rgba(17, 24, 39, 0.7)",
    backdropFilter: "blur(16px)",
    borderTop: "1px solid var(--glass-border)",
    borderBottom: "1px solid var(--glass-border)",
    borderRight: "1px solid var(--glass-border)",
    borderRadius: "var(--radius-md)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  cardLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  cardIcon: {
    fontSize: "1.25rem",
  },
  cardValue: {
    fontSize: "2.25rem",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "0.25rem",
  },
  cardDesc: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  splitGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "1.5rem",
    flexWrap: "wrap" as const,
    "@media(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  tablePanel: {
    padding: "1.75rem",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  panelTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#fff",
  },
  panelLink: {
    fontSize: "0.85rem",
    color: "var(--accent-cyan)",
    fontWeight: 500,
  },
  emptyState: {
    padding: "4rem 2rem",
    textAlign: "center" as const,
    color: "var(--text-secondary)",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
    display: "block",
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: "10px",
  },
  listInfo: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.2rem",
    textAlign: "left" as const,
  },
  listTitle: {
    fontWeight: 600,
    color: "#fff",
    fontSize: "0.95rem",
  },
  listTime: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  listDesc: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
  },
  shortcutsPanel: {
    padding: "1.75rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  shortcutsGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  shortcutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    transition: "all 0.2s ease",
    textAlign: "left" as const,
    ":hover": {
      background: "rgba(255, 255, 255, 0.04)",
      borderColor: "rgba(6, 182, 212, 0.2)",
    },
  },
  shortcutIcon: {
    fontSize: "1.75rem",
  },
};
