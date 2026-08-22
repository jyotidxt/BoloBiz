"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess("Your password has been successfully updated.");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.header}>
        <h2 style={styles.title}>Account Settings</h2>
        <p style={styles.subtitle}>Manage your profile details and security credentials</p>
      </div>

      <div style={styles.grid}>
        {/* Security / Password section */}
        <div className="glass-panel" style={styles.settingsCard}>
          <h3 style={styles.cardTitle}>🔐 Update Password</h3>
          <p style={styles.cardSubtitle}>
            Change your account password. For security, you must enter your current password.
          </p>

          {error && <div style={styles.errorAlert}>{error}</div>}
          {success && <div style={styles.successAlert}>{success}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                style={styles.input}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>New Password</label>
                <button
                  type="button"
                  style={styles.toggleBtn}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Minimum 8 characters"
                style={styles.input}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                style={styles.input}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Updating Password..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* Tenant Organization context info (read-only verification) */}
        <div className="glass-panel" style={styles.infoCard}>
          <h3 style={styles.cardTitle}>🏢 Business Organization</h3>
          <p style={styles.cardSubtitle}>
            Review your active tenant boundaries and organization credentials.
          </p>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>Security Context:</span>
              <span style={styles.infoValue}>Multi-Tenant Sandbox Isolated</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>Database Link:</span>
              <span style={styles.infoValue}>SQLite Local (Source of Truth)</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoKey}>Password Policy:</span>
              <span style={styles.infoValue}>bcrypt cryptographic hash (10 rounds)</span>
            </div>
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
  },
  header: {
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "var(--text-primary)",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "1.5rem",
    alignItems: "start",
    "@media(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  settingsCard: {
    padding: "2rem",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
  },
  infoCard: {
    padding: "2rem",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
  },
  cardSubtitle: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
    marginBottom: "1.5rem",
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
  successAlert: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid var(--status-success)",
    color: "#a7f3d0",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "1.25rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  toggleBtn: {
    background: "transparent",
    border: "none",
    color: "var(--accent-cyan)",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  input: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.2s ease",
  },
  submitBtn: {
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
  infoList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.85rem",
    borderBottom: "1px solid var(--glass-border)",
    paddingBottom: "0.75rem",
  },
  infoKey: {
    color: "var(--text-secondary)",
  },
  infoValue: {
    color: "var(--text-primary)",
    fontWeight: 600,
  },
};
