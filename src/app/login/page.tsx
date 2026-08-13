"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();
    window.addEventListener("theme-change", checkTheme);
    return () => window.removeEventListener("theme-change", checkTheme);
  }, []);

  const appearanceConfig = isDark ? darkAppearance : lightAppearance;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Link href="/" style={styles.logo}>
            🎙️ BoloBiz
          </Link>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to your merchant dashboard</p>
        </div>

        <div style={styles.clerkWrapper}>
          <SignIn
            routing="hash"
            signUpUrl="/signup"
            forceRedirectUrl="/dashboard"
            appearance={appearanceConfig}
          />
        </div>
      </div>
    </div>
  );
}

const darkAppearance = {
  variables: {
    colorPrimary: "#06b6d4",
    colorBackground: "#0b0f19",
    colorText: "#ffffff",
    colorInputBackground: "rgba(255, 255, 255, 0.02)",
    colorInputText: "#ffffff",
    colorTextSecondary: "#9ca3af",
    colorTextOnPrimaryBackground: "#ffffff",
    borderRadius: "12px",
  },
  elements: {
    cardBox: { boxShadow: "none", background: "transparent" },
    card: {
      backgroundColor: "rgba(13, 17, 28, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 10px 45px rgba(0,0,0,0.6)",
      width: "100%",
    },
    headerTitle: { color: "#ffffff", fontSize: "1.25rem" },
    headerSubtitle: { color: "#9ca3af" },
    socialButtonsBlockButton: {
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderColor: "rgba(255, 255, 255, 0.06)",
      color: "#ffffff",
      "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.06)" }
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)",
      border: "none",
      boxShadow: "0 4px 15px rgba(6, 182, 212, 0.25)",
      "&:hover": { opacity: 0.95 }
    },
    dividerLine: { backgroundColor: "rgba(255, 255, 255, 0.08)" },
    dividerText: { color: "#6b7280" },
    footerActionText: { color: "#9ca3af" },
    footerActionLink: {
      color: "#06b6d4",
      fontWeight: 600,
      "&:hover": { color: "#22d3ee" }
    },
    formFieldLabel: { color: "#9ca3af", fontWeight: 500 },
    formFieldInput: {
      border: "1px solid rgba(255, 255, 255, 0.08)",
      color: "#ffffff",
      background: "rgba(0, 0, 0, 0.2)",
      "&:focus": { borderColor: "#06b6d4" }
    },
    identityPreviewText: { color: "#ffffff" },
    identityPreviewEditButtonIcon: { color: "#06b6d4" }
  }
};

const lightAppearance = {
  variables: {
    colorPrimary: "#7c3aed",
    colorBackground: "#ffffff",
    colorText: "#111827",
    colorInputBackground: "#f9fafb",
    colorInputText: "#111827",
    colorTextSecondary: "#4b5563",
    colorTextOnPrimaryBackground: "#ffffff",
    borderRadius: "12px",
  },
  elements: {
    cardBox: { boxShadow: "none", background: "transparent" },
    card: {
      backgroundColor: "rgba(255, 255, 255, 0.55)",
      border: "1px solid rgba(0, 0, 0, 0.05)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 10px 45px rgba(0,0,0,0.06)",
      width: "100%",
    },
    headerTitle: { color: "#111827", fontSize: "1.25rem" },
    headerSubtitle: { color: "#4b5563" },
    socialButtonsBlockButton: {
      backgroundColor: "#ffffff",
      borderColor: "rgba(0, 0, 0, 0.08)",
      color: "#111827",
      "&:hover": { backgroundColor: "#f9fafb" }
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
      border: "none",
      boxShadow: "0 4px 15px rgba(124, 58, 237, 0.2)",
      "&:hover": { opacity: 0.95 }
    },
    dividerLine: { backgroundColor: "rgba(0, 0, 0, 0.08)" },
    dividerText: { color: "#9ca3af" },
    footerActionText: { color: "#4b5563" },
    footerActionLink: {
      color: "#7c3aed",
      fontWeight: 600,
      "&:hover": { color: "#6d28d9" }
    },
    formFieldLabel: { color: "#4b5563", fontWeight: 500 },
    formFieldInput: {
      border: "1px solid rgba(0, 0, 0, 0.08)",
      color: "#111827",
      background: "#ffffff",
      "&:focus": { borderColor: "#7c3aed" }
    },
    identityPreviewText: { color: "#111827" },
    identityPreviewEditButtonIcon: { color: "#7c3aed" }
  }
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-radial)",
    padding: "1.5rem",
    transition: "background 0.3s ease",
  },
  card: {
    width: "100%",
    maxWidth: "500px",
    padding: "2.5rem",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(30px)",
    borderRadius: "24px",
    boxShadow: "0 15px 50px var(--glass-shadow)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    transition: "all 0.3s ease",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "1rem",
    width: "100%",
  },
  logo: {
    fontSize: "1.85rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: "0.5rem",
    display: "inline-block",
  },
  title: {
    fontSize: "1.45rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.25rem",
  },
  subtitle: {
    color: "var(--text-secondary)",
    fontSize: "0.9rem",
  },
  clerkWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
};
