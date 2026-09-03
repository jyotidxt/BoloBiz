"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function OnboardingPage() {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();

  const [shopName, setShopName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("Kirana & Grocery");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to login if user is not signed in
  useEffect(() => {
    if (isUserLoaded && !isSignedIn) {
      window.location.href = "/login";
    }
  }, [isUserLoaded, isSignedIn]);

  // Pre-populate owner name from Clerk account if available
  useEffect(() => {
    if (user && !ownerName) {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      if (name) {
        setOwnerName(name);
        if (!shopName) {
          setShopName(`${user.firstName || "My"}'s Kirana Store`);
        }
      }
    }
  }, [user, ownerName, shopName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!shopName.trim()) {
      setError("Please provide your Shop or Business Name.");
      return;
    }

    if (!ownerName.trim()) {
      setError("Please provide the Owner / Merchant Name.");
      return;
    }

    setLoading(true);

    try {
      // 1. Update business & user records via backend setup API
      const res = await fetch("/api/dashboard/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: shopName.trim(),
          ownerName: ownerName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to set up shop details.");
      }

      // 2. Persist store metadata locally
      if (typeof window !== "undefined") {
        if (phone.trim()) localStorage.setItem("bolobiz_shop_phone", phone.trim());
        if (businessType) localStorage.setItem("bolobiz_business_type", businessType);
      }

      // 3. Seamlessly redirect to Dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to save shop details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isUserLoaded) {
    return (
      <div style={styles.pageWrapper}>
        <div className="auth-blob-1" />
        <div className="auth-blob-2" />
        <div style={styles.card} className="animate-fade-in">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", padding: "2rem" }}>
            <div style={styles.spinner} />
            <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Loading onboarding...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* Animated glowing gradient background blobs */}
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />

      <div style={styles.container} className="animate-fade-in">
        {/* Onboarding Card */}
        <div style={styles.card}>
          
          <div style={styles.cardHeader}>
            <div style={styles.brandRow}>
              <Link href="/" style={styles.logoBadge}>
                <span style={styles.logoIcon}>🎙️</span>
                <span style={styles.logoText}>BoloBiz</span>
              </Link>
              <div style={styles.stepBadge}>Step 2 of 2</div>
            </div>

            <h1 style={styles.title}>Let&apos;s set up your shop</h1>
            <p style={styles.subtitle}>
              Tell us about your business to personalize your voice assistant and financial reports.
            </p>
          </div>

          {error && <div style={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Shop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kirana & General Store"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                style={styles.input}
                className="auth-input-focus"
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Owner Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Sharma"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                style={styles.input}
                className="auth-input-focus"
                disabled={loading}
              />
            </div>

            <div style={styles.inputRow}>
              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={styles.input}
                  className="auth-input-focus"
                  disabled={loading}
                />
              </div>

              <div style={{ ...styles.inputGroup, flex: 1 }}>
                <label style={styles.label}>Business Type (Optional)</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  style={styles.select}
                  className="auth-input-focus"
                  disabled={loading}
                >
                  <option value="Kirana & Grocery">Kirana & Grocery</option>
                  <option value="General Store">General Store</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Dairy & Sweets">Dairy & Sweets</option>
                  <option value="Medical & Pharmacy">Medical & Pharmacy</option>
                  <option value="Electronics & Mobile">Electronics & Mobile</option>
                  <option value="Wholesale Distribution">Wholesale Distribution</option>
                  <option value="Other Retail">Other Retail Business</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? "Configuring Shop..." : "Continue to BoloBiz →"}
            </button>
          </form>

          <div style={styles.cardFooter}>
            <span style={styles.footerNote}>
              💡 You can always update your profile and details in Settings later.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "var(--bg-primary)",
    background: "var(--bg-radial)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
    overflow: "hidden",
    padding: "2rem 1.5rem",
  },
  container: {
    display: "flex",
    maxWidth: "580px",
    width: "100%",
    zIndex: 1,
  },
  card: {
    width: "100%",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(24px)",
    borderRadius: "24px",
    padding: "2.5rem 2.25rem",
    boxShadow: "0 20px 50px rgba(124, 58, 237, 0.12)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  spinner: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "3px solid rgba(124, 58, 237, 0.15)",
    borderTopColor: "#7c3aed",
    animation: "spin 0.9s linear infinite",
  },
  cardHeader: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  brandRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  logoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    textDecoration: "none",
  },
  logoIcon: {
    fontSize: "1.4rem",
  },
  logoText: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  stepBadge: {
    background: "rgba(124, 58, 237, 0.12)",
    border: "1px solid rgba(124, 58, 237, 0.25)",
    color: "var(--accent-purple)",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  title: {
    fontSize: "1.85rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  inputRow: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap" as const,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.45rem",
    minWidth: "220px",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  input: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    padding: "0.85rem 1rem",
    borderRadius: "12px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    width: "100%",
  },
  select: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    padding: "0.85rem 1rem",
    borderRadius: "12px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    width: "100%",
    cursor: "pointer",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid var(--status-danger)",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    lineHeight: 1.4,
  },
  cardFooter: {
    borderTop: "1px solid var(--glass-border)",
    paddingTop: "1rem",
    textAlign: "center" as const,
  },
  footerNote: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
};
