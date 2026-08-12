"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: string;
  name: string;
}

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [type, setType] = useState("SALE");
  const [amount, setAmount] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [description, setDescription] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = async () => {
    try {
      const [txRes, custRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/customers"),
      ]);

      if (!txRes.ok || !custRes.ok) {
        throw new Error("Failed to load transactions or customer data");
      }

      const txData = await txRes.json();
      const custData = await custRes.json();

      setTransactions(txData);
      setCustomers(custData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !amount) return;

    setFormLoading(true);
    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          customerId: customerId || undefined,
          description: description || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save transaction record");

      // Reset & Refresh
      setAmount("");
      setCustomerId("");
      setDescription("");
      setShowAddForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading transactions ledger...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>💰 Audit & Transaction Ledger</h2>
          <p style={styles.subtitle}>Review logs, cash flows, credits, and manual entries</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addBtn}
        >
          {showAddForm ? "Close Form" : "+ Log Transaction Manual"}
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Manual Transaction Input Form */}
      {showAddForm && (
        <div className="glass-panel" style={styles.formPanel}>
          <h3 style={styles.panelTitle}>Manual Entry Form</h3>
          <form onSubmit={handleAddTransaction} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Transaction Type</label>
                <select
                  style={styles.select}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="SALE">Cash Sale (SALE)</option>
                  <option value="PURCHASE">Inventory Purchase (PURCHASE)</option>
                  <option value="CREDIT">Loan Given (CREDIT / UDHAAR)</option>
                  <option value="PAYMENT_RECEIVED">Payment Received (PAYMENT_RECEIVED)</option>
                  <option value="EXPENSE">General Expense (EXPENSE)</option>
                  <option value="REFUND">Refund (REFUND)</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Amount in Rupees (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g., 500"
                  style={styles.input}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Association (Optional)</label>
                <select
                  style={styles.select}
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- None (Walk-in Customer) --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Brief Description</label>
                <input
                  type="text"
                  placeholder="e.g., Ramesh bought Maggi packets"
                  style={styles.input}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={formLoading} style={styles.submitBtn}>
              {formLoading ? "Recording..." : "Log Transaction"}
            </button>
          </form>
        </div>
      )}

      {/* Transactions Ledger Table */}
      <div className="glass-panel" style={styles.tableCard}>
        {transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <span>💰</span>
            <p>No transaction history logged.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Description</th>
                <th style={styles.th}>Ledger Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div>{new Date(tx.createdAt).toLocaleDateString("en-IN")}</div>
                    <div style={styles.timeText}>
                      {new Date(tx.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </td>
                  <td style={styles.td}>{tx.customer?.name || <span style={{ color: "var(--text-muted)" }}>Walk-in</span>}</td>
                  <td style={styles.td}>
                    <span style={getBadgeStyle(tx.type)}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={styles.td}>{tx.description || "—"}</td>
                  <td style={{ ...styles.td, ...getAmountStyle(tx.type) }}>
                    {tx.type === "CREDIT" || tx.type === "EXPENSE" || tx.type === "PURCHASE" ? "-" : "+"}
                    ₹{tx.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getBadgeStyle(type: string) {
  const base = {
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
  };
  if (type === "CREDIT") {
    return { ...base, background: "rgba(239, 68, 68, 0.12)", color: "#fca5a5", border: "1px solid rgba(239, 68, 68, 0.2)" };
  }
  if (type === "PAYMENT_RECEIVED") {
    return { ...base, background: "rgba(16, 185, 129, 0.12)", color: "#a7f3d0", border: "1px solid rgba(16, 185, 129, 0.2)" };
  }
  if (type === "SALE") {
    return { ...base, background: "rgba(6, 182, 212, 0.12)", color: "#99f6e4", border: "1px solid rgba(6, 182, 212, 0.2)" };
  }
  return { ...base, background: "rgba(255, 255, 255, 0.05)", color: "#e5e7eb", border: "1px solid rgba(255, 255, 255, 0.1)" };
}

function getAmountStyle(type: string) {
  const base = {
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
    gap: "1.5rem",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#fff",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  addBtn: {
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)",
    color: "#fff",
    padding: "0.6rem 1.5rem",
    borderRadius: "20px",
    fontWeight: 600,
    cursor: "pointer",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid var(--status-danger)",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
  },
  formPanel: {
    padding: "1.5rem",
  },
  panelTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  input: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    color: "#fff",
  },
  select: {
    background: "rgba(17, 24, 39, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
  submitBtn: {
    background: "var(--accent-teal)",
    color: "#0a0f1d",
    fontWeight: 700,
    padding: "0.75rem 2rem",
    borderRadius: "8px",
    cursor: "pointer",
    alignSelf: "flex-end" as const,
  },
  tableCard: {
    padding: "1rem",
    overflowX: "auto" as const,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  tableHeaderRow: {
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  th: {
    textAlign: "left" as const,
    padding: "1rem",
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
  },
  tableRow: {
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  td: {
    padding: "1.2rem 1rem",
    fontSize: "0.95rem",
  },
  timeText: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    marginTop: "0.2rem",
  },
  emptyState: {
    padding: "4rem 2rem",
    textAlign: "center" as const,
    color: "var(--text-secondary)",
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
    animation: "voice-bars 1s infinite linear",
  },
};
