"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  outstandingBalance: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to load customers list");
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setFormLoading(true);
    setError("");

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create customer");

      // Reset form & reload
      setName("");
      setPhone("");
      setShowAddForm(false);
      fetchCustomers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading customers khata...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>👥 Customers (Khata Book)</h2>
          <p style={styles.subtitle}>Manage customer profiles and pending balances</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addBtn}
        >
          {showAddForm ? "Close Form" : "+ Add New Customer"}
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Add Customer Form */}
      {showAddForm && (
        <div className="glass-panel" style={styles.formPanel}>
          <h3 style={styles.panelTitle}>Add Customer Profile</h3>
          <form onSubmit={handleAddCustomer} style={styles.form}>
            <div style={styles.inputRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ramesh Kumar"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g., 9876543210"
                  style={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={formLoading} style={styles.submitBtn}>
              {formLoading ? "Saving Customer..." : "Save Customer Account"}
            </button>
          </form>
        </div>
      )}

      {/* Search Filter */}
      <div className="glass-panel" style={styles.searchPanel}>
        <input
          type="text"
          placeholder="🔍 Search customers by name or phone..."
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table grid */}
      <div className="glass-panel" style={styles.tableCard}>
        {filteredCustomers.length === 0 ? (
          <div style={styles.emptyState}>
            <span>👥</span>
            <p>No customers found.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Customer Name</th>
                <th style={styles.th}>Contact Phone</th>
                <th style={styles.th}>Outstanding Udhaar</th>
                <th style={styles.th}>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id} style={styles.tableRow}>
                  <td style={styles.td}>
                    <strong>{c.name}</strong>
                  </td>
                  <td style={styles.td}>{c.phone || "—"}</td>
                  <td style={{ ...styles.td, ...getBalanceStyle(c.outstandingBalance) }}>
                    ₹{c.outstandingBalance.toLocaleString("en-IN")}
                  </td>
                  <td style={styles.td}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN")}
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

function getBalanceStyle(balance: number) {
  if (balance > 0) {
    return {
      color: "var(--status-danger)",
      fontWeight: 700,
    };
  }
  return {
    color: "var(--text-muted)",
  };
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
    gap: "1rem",
  },
  inputRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
  },
  inputGroup: {
    flex: 1,
    minWidth: "200px",
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
  submitBtn: {
    background: "var(--accent-teal)",
    color: "#0a0f1d",
    fontWeight: 700,
    padding: "0.75rem",
    borderRadius: "8px",
    cursor: "pointer",
    alignSelf: "flex-end" as const,
    width: "fit-content" as const,
    paddingLeft: "2rem",
    paddingRight: "2rem",
  },
  searchPanel: {
    padding: "0.5rem",
  },
  searchInput: {
    width: "100%",
    padding: "0.75rem 1rem",
    color: "#fff",
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
    letterSpacing: "0.5px",
  },
  tableRow: {
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    ":hover": {
      background: "rgba(255,255,255,0.01)",
    },
  },
  td: {
    padding: "1.2rem 1rem",
    fontSize: "0.95rem",
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
