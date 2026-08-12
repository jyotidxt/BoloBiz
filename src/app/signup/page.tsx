"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Successful signup, redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <Link href="/" style={styles.logo}>
            🎙️ BoloBiz
          </Link>
          <h2 style={styles.title}>Create your account</h2>
          <p style={styles.subtitle}>Register your business to get started</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Your Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Jyoti Sharma"
              style={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Business Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Sharma Kirana Store"
              style={styles.input}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              required
              placeholder="name@business.com"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              style={styles.input}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Registering Account..." : "Create Account 🚀"}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{" "}
          <Link href="/login" style={styles.link}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "radial-gradient(circle at center, #111827 0%, #070a13 100%)",
    padding: "1.5rem",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    padding: "2.5rem",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  logo: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "1rem",
    display: "inline-block",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#fff",
    marginBottom: "0.25rem",
  },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid var(--status-danger)",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
    lineHeight: 1.4,
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
  label: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  input: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    padding: "0.85rem 1rem",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    ":focus": {
      borderColor: "var(--accent-cyan)",
      background: "rgba(255,255,255,0.05)",
    },
  },
  submitBtn: {
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)",
    color: "#fff",
    fontWeight: 600,
    padding: "0.95rem",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "0.5rem",
    boxShadow: "0 4px 15px rgba(6, 182, 212, 0.2)",
  },
  footer: {
    marginTop: "1.75rem",
    textAlign: "center" as const,
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
  },
  link: {
    color: "var(--accent-cyan)",
    fontWeight: 500,
  },
};
