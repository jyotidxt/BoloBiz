"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils/format";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  costPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  createdAt: string;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [formLoading, setFormLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Stock update adjustment state
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load inventory logs");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    // Validate fields as positive values
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      setError("Selling price must be greater than zero.");
      return;
    }
    const numericCostPrice = costPrice ? parseFloat(costPrice) : 0;
    if (isNaN(numericCostPrice) || numericCostPrice < 0) {
      setError("Cost price cannot be negative.");
      return;
    }
    const numericStock = stockQuantity ? parseFloat(stockQuantity) : 0;
    if (isNaN(numericStock) || numericStock < 0) {
      setError("Initial stock quantity cannot be negative.");
      return;
    }
    const numericThreshold = lowStockThreshold ? parseFloat(lowStockThreshold) : 0;
    if (isNaN(numericThreshold) || numericThreshold < 0) {
      setError("Low stock threshold cannot be negative.");
      return;
    }

    setFormLoading(true);
    setError("");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sku: sku || undefined,
          price: parseFloat(price),
          costPrice: costPrice ? parseFloat(costPrice) : undefined,
          stockQuantity: stockQuantity ? parseFloat(stockQuantity) : undefined,
          lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product card");

      // Reset form & reload
      setName("");
      setSku("");
      setPrice("");
      setCostPrice("");
      setStockQuantity("");
      setLowStockThreshold("5");
      setShowAddForm(false);
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdjustStock = async (productId: string, productName: string) => {
    const adj = parseFloat(adjustmentValue);
    if (isNaN(adj) || adj === 0) return;

    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Update stock of product "${productName}" by ${adj}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust stock level");

      // Reset adjust states & refresh
      setAdjustingId(null);
      setAdjustmentValue("");
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading inventory catalogs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📦 Product Inventory Catalog</h2>
          <p style={styles.subtitle}>Track product prices, margins, stock levels, and threshold warnings</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={styles.addBtn}
        >
          {showAddForm ? "Close Form" : "+ Create Product Card"}
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Product additions Form */}
      {showAddForm && (
        <div className="glass-panel" style={styles.formPanel}>
          <h3 style={styles.panelTitle}>Create Product Card</h3>
          <form onSubmit={handleAddProduct} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Maggi Noodles 2-Min"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>SKU / Barcode (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., MG-0912"
                  style={styles.input}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Selling Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g., 14.00"
                  style={styles.input}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Cost Price (₹ - Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 11.50"
                  style={styles.input}
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Initial Stock Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g., 50"
                  style={styles.input}
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Low Stock Warning Threshold</label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  style={styles.input}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" disabled={formLoading} style={styles.submitBtn}>
              {formLoading ? "Saving Product..." : "Save Product Card"}
            </button>
          </form>
        </div>
      )}

      {/* Search Filter */}
      <div className="glass-panel" style={styles.searchPanel}>
        <input
          type="text"
          placeholder="🔍 Search inventory by item name or SKU code..."
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Products table list */}
      <div className="glass-panel" style={styles.tableCard}>
        {filteredProducts.length === 0 ? (
          <div style={styles.emptyState}>
            <span>📦</span>
            <p>No inventory items registered.</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Product Title / SKU</th>
                <th style={styles.th}>Selling Price</th>
                <th style={styles.th}>Cost Price</th>
                <th style={styles.th}>Margin</th>
                <th style={styles.th}>Stock Status</th>
                <th style={styles.th}>Adjust Stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const margin = p.price - p.costPrice;
                const marginPercent = p.price > 0 ? (margin / p.price) * 100 : 0;
                const isLow = p.stockQuantity <= p.lowStockThreshold;

                return (
                  <tr key={p.id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <strong>{p.name}</strong>
                      {p.sku && <div style={styles.skuText}>SKU: {p.sku}</div>}
                    </td>
                    <td style={styles.td}>{formatCurrency(p.price)}</td>
                    <td style={styles.td}>{formatCurrency(p.costPrice)}</td>
                    <td style={styles.td}>
                      <span style={{ color: margin >= 0 ? "var(--status-success)" : "var(--status-danger)" }}>
                        {formatCurrency(margin)} ({marginPercent.toFixed(0)}%)
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={isLow ? styles.lowStockBadge : styles.healthyStockBadge}>
                        {p.stockQuantity} remaining {isLow && "(Low Stock)"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {adjustingId === p.id ? (
                        <div style={styles.adjustWrapper}>
                          <input
                            type="number"
                            placeholder="Qty (+5 or -3)"
                            style={styles.adjustInput}
                            value={adjustmentValue}
                            onChange={(e) => setAdjustmentValue(e.target.value)}
                          />
                          <button
                            onClick={() => handleAdjustStock(p.id, p.name)}
                            style={styles.adjustSubmitBtn}
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => setAdjustingId(null)}
                            style={styles.adjustCancelBtn}
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAdjustingId(p.id);
                            setAdjustmentValue("");
                          }}
                          style={styles.adjustBtnTrigger}
                        >
                          ✏️ Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
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
  submitBtn: {
    background: "var(--accent-teal)",
    color: "#0a0f1d",
    fontWeight: 700,
    padding: "0.75rem 2rem",
    borderRadius: "8px",
    cursor: "pointer",
    alignSelf: "flex-end" as const,
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
  },
  tableRow: {
    borderBottom: "1px solid rgba(255,255,255,0.03)",
  },
  td: {
    padding: "1.2rem 1rem",
    fontSize: "0.95rem",
  },
  skuText: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    marginTop: "0.2rem",
  },
  lowStockBadge: {
    background: "rgba(239, 68, 68, 0.12)",
    color: "var(--status-danger)",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  healthyStockBadge: {
    background: "rgba(16, 185, 129, 0.1)",
    color: "var(--status-success)",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  adjustBtnTrigger: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.85rem",
  },
  adjustWrapper: {
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
  },
  adjustInput: {
    width: "80px",
    padding: "0.35rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "0.85rem",
  },
  adjustSubmitBtn: {
    background: "var(--accent-cyan)",
    color: "#fff",
    padding: "0.35rem 0.6rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  adjustCancelBtn: {
    color: "var(--text-muted)",
    padding: "0.35rem",
    cursor: "pointer",
    fontSize: "0.85rem",
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
