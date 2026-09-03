"use client";

import { useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginPage() {
  const { loaded: isClerkLoaded, client, setActive } = useClerk();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);

  // Forgot password sub-flow state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  // 1. AUTO-REDIRECT: If already signed in, immediately forward to /dashboard
  useEffect(() => {
    if (isUserLoaded && isSignedIn) {
      window.location.href = "/dashboard";
    }
  }, [isUserLoaded, isSignedIn]);

  // 2. Fallback timeout to prevent infinite loading if network fails
  useEffect(() => {
    if (isClerkLoaded) return;
    const timer = setTimeout(() => {
      if (!isClerkLoaded) {
        setTimedOut(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isClerkLoaded]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (!isClerkLoaded || !client) {
      setError("Authentication is still loading. Please wait a moment.");
      return;
    }

    setLoading(true);

    try {
      const result = await client.signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        // Full page navigation ensures session cookies are propagated to server & middleware
        window.location.href = "/dashboard";
      } else {
        console.warn("Sign in status:", result.status);
        setError("Unable to complete sign-in. Please verify your credentials.");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid email or password.";
      
      // If Clerk reports session already exists, navigate directly to dashboard
      if (
        msg.toLowerCase().includes("already signed in") ||
        err.errors?.[0]?.code === "session_exists"
      ) {
        window.location.href = "/dashboard";
        return;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Request password reset code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    if (!isClerkLoaded || !client) {
      setError("Authentication is still loading. Please wait a moment.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await client.signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setResetCodeSent(true);
      setResetSuccess(`Verification code sent to ${email}`);
    } catch (err: any) {
      console.error("Password reset error:", err);
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Failed to send reset code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Submit reset code and new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    if (!isClerkLoaded || !client) {
      setError("Authentication is still loading. Please wait a moment.");
      return;
    }

    setLoading(true);

    try {
      const result = await client.signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: resetCode.trim(),
        password: newPassword,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        window.location.href = "/dashboard";
      } else {
        setError("Password reset incomplete. Please try again.");
      }
    } catch (err: any) {
      console.error("Reset submit error:", err);
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid reset code or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isAuthReady = isClerkLoaded && isUserLoaded;

  return (
    <div style={styles.pageWrapper}>
      {/* Animated glowing gradient background blobs */}
      <div className="auth-blob-1" />
      <div className="auth-blob-2" />

      <div style={styles.container} className="animate-fade-in">
        {/* ======================================================= */}
        {/* LEFT SIDE: Brand Showcase & Value Proposition (Desktop) */}
        {/* ======================================================= */}
        <div style={styles.leftCol}>
          <Link href="/" style={styles.logoBadge}>
            <span style={styles.logoIcon}>🎙️</span>
            <span style={styles.logoText}>BoloBiz</span>
          </Link>

          <div style={styles.brandHero}>
            <h1 style={styles.brandTitle}>
              Voice-First AI for <br />
              <span style={styles.brandHighlight}>Smart Merchants</span>
            </h1>
            <p style={styles.hindiSubtitle}>
              &ldquo;आवाज़ से हिसाब-किताब, स्टॉक और ग्राहक का खाता संभालें।&rdquo;
            </p>
          </div>

          {/* Quick status card preview */}
          <div style={styles.illustrationCard}>
            <div style={styles.illustrationHeader}>
              <div style={styles.illMicCircle}>
                <span>🏪</span>
              </div>
              <div>
                <div style={styles.illTitle}>Instant Daily Summary</div>
                <div style={styles.illSubtitle}>Multi-tenant Cloud Security</div>
              </div>
            </div>
            <div style={styles.pillRow}>
              <span style={styles.previewPill}>⚡ Real-Time Ledger</span>
              <span style={styles.previewPill}>🔒 End-to-End Secure</span>
            </div>
          </div>

          {/* Feature List */}
          <div style={styles.bulletList}>
            <div style={styles.bulletItem}>
              <div style={styles.bulletIcon}>✓</div>
              <span style={styles.bulletText}>Single-tap voice transaction logging</span>
            </div>
            <div style={styles.bulletItem}>
              <div style={styles.bulletIcon}>✓</div>
              <span style={styles.bulletText}>Customer Udhaar & payment tracking</span>
            </div>
            <div style={styles.bulletItem}>
              <div style={styles.bulletIcon}>✓</div>
              <span style={styles.bulletText}>Automated low stock inventory alerts</span>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT SIDE: Custom Sign In / Reset Card                 */}
        {/* ======================================================= */}
        <div style={styles.rightCol}>
          <div style={styles.authCard}>

            {/* 1. Signed-in redirection state */}
            {isUserLoaded && isSignedIn && (
              <div style={styles.loadingBox} className="animate-fade-in">
                <div style={styles.spinnerWrapper}>
                  <div style={styles.spinner} />
                  <span style={styles.spinnerCenterIcon}>🏪</span>
                </div>
                <div style={styles.loadingTitle}>Opening Dashboard...</div>
                <div style={styles.loadingSubtitle}>You are already signed in. Redirecting now.</div>
              </div>
            )}

            {/* 2. Branded Loading State before Clerk is initialized */}
            {!isAuthReady && !timedOut && !isSignedIn && (
              <div style={styles.loadingBox} className="animate-fade-in">
                <div style={styles.spinnerWrapper}>
                  <div style={styles.spinner} />
                  <span style={styles.spinnerCenterIcon}>🎙️</span>
                </div>
                <div style={styles.loadingTitle}>Preparing secure session...</div>
                <div style={styles.loadingSubtitle}>Connecting to BoloBiz merchant services</div>
              </div>
            )}

            {/* 3. Timeout / Retry State if network is slow or interrupted */}
            {!isAuthReady && timedOut && !isSignedIn && (
              <div style={styles.loadingBox} className="animate-fade-in">
                <span style={{ fontSize: "2.5rem" }}>⚠️</span>
                <div style={styles.loadingTitle}>Taking longer than usual</div>
                <p style={styles.loadingSubtitle}>
                  Unable to initialize authentication service. Please check your internet connection or reload.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="auth-btn-primary"
                  style={{ marginTop: "1rem", width: "auto", padding: "0.75rem 1.75rem" }}
                >
                  🔄 Reload Page
                </button>
              </div>
            )}

            {/* 4. Render Form once Clerk is loaded & user is not signed in */}
            {isAuthReady && !isSignedIn && !isResetMode && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Welcome back 👋</h2>
                  <p style={styles.cardSubtitle}>
                    Continue managing your business.
                  </p>
                </div>

                {error && <div style={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleSignIn} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="merchant@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                      className="auth-input-focus"
                      disabled={loading}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <div style={styles.labelRow}>
                      <label style={styles.label}>Password</label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.toggleBtn}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      className="auth-input-focus"
                      disabled={loading}
                    />
                  </div>

                  <div style={styles.forgotRow}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(true);
                        setError("");
                      }}
                      style={styles.forgotBtn}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-btn-primary"
                  >
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </form>

                <div style={styles.cardFooter}>
                  <span style={styles.footerText}>Don&apos;t have an account? </span>
                  <Link href="/signup" style={styles.footerLink}>
                    Create Account
                  </Link>
                </div>
              </div>
            )}

            {/* 5. Forgot Password Flow once Clerk is loaded & user is not signed in */}
            {isAuthReady && !isSignedIn && isResetMode && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.cardTitle}>Reset Password 🔑</h2>
                  <p style={styles.cardSubtitle}>
                    {!resetCodeSent
                      ? "Enter your email to receive a password reset code."
                      : `Enter the code sent to ${email} and set your new password.`}
                  </p>
                </div>

                {error && <div style={styles.errorAlert}>{error}</div>}
                {resetSuccess && <div style={styles.successAlert}>{resetSuccess}</div>}

                {!resetCodeSent ? (
                  <form onSubmit={handleSendResetCode} style={styles.form}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="merchant@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={styles.input}
                        className="auth-input-focus"
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-btn-primary"
                    >
                      {loading ? "Sending Code..." : "Send Reset Code →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setError("");
                      }}
                      style={styles.backBtn}
                    >
                      ← Back to sign in
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} style={styles.form}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>6-Digit Reset Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        style={{ ...styles.input, textAlign: "center", letterSpacing: "3px" }}
                        className="auth-input-focus"
                        disabled={loading}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={styles.input}
                        className="auth-input-focus"
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="auth-btn-primary"
                    >
                      {loading ? "Updating Password..." : "Set New Password & Sign In →"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setResetCodeSent(false);
                        setError("");
                      }}
                      style={styles.backBtn}
                    >
                      ← Back to sign in
                    </button>
                  </form>
                )}
              </div>
            )}

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
    maxWidth: "1100px",
    width: "100%",
    gap: "3.5rem",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    flexWrap: "wrap" as const,
  },
  leftCol: {
    flex: "1 1 450px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.75rem",
    maxWidth: "500px",
  },
  logoBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.6rem",
    textDecoration: "none",
  },
  logoIcon: {
    fontSize: "1.75rem",
    background: "var(--accent-gradient)",
    width: "44px",
    height: "44px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 15px rgba(219, 39, 119, 0.25)",
  },
  logoText: {
    fontSize: "1.65rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  brandHero: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
  },
  brandTitle: {
    fontSize: "3rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    lineHeight: 1.15,
    letterSpacing: "-1px",
  },
  brandHighlight: {
    background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  hindiSubtitle: {
    fontSize: "1.15rem",
    color: "var(--text-secondary)",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  illustrationCard: {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "1.25rem 1.5rem",
    boxShadow: "0 10px 30px var(--glass-shadow)",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  illustrationHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  illMicCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "rgba(124, 58, 237, 0.12)",
    color: "var(--accent-purple)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
  },
  illTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  illSubtitle: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
  },
  pillRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap" as const,
  },
  previewPill: {
    background: "rgba(124, 58, 237, 0.08)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    color: "var(--accent-purple)",
    padding: "0.25rem 0.65rem",
    borderRadius: "15px",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  bulletList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.85rem",
  },
  bulletItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  bulletIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    background: "rgba(16, 185, 129, 0.12)",
    color: "var(--status-success)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    fontWeight: 800,
  },
  bulletText: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
  rightCol: {
    flex: "1 1 420px",
    display: "flex",
    justifyContent: "center",
    maxWidth: "480px",
    width: "100%",
  },
  authCard: {
    width: "100%",
    minHeight: "420px",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(24px)",
    borderRadius: "24px",
    padding: "2.5rem 2.25rem",
    boxShadow: "0 20px 50px rgba(124, 58, 237, 0.12)",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    padding: "2rem 1rem",
    gap: "1rem",
  },
  spinnerWrapper: {
    position: "relative" as const,
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.5rem",
  },
  spinner: {
    position: "absolute" as const,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    border: "3px solid rgba(124, 58, 237, 0.15)",
    borderTopColor: "#7c3aed",
    animation: "spin 0.9s linear infinite",
  },
  spinnerCenterIcon: {
    fontSize: "1.5rem",
  },
  loadingTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  loadingSubtitle: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    maxWidth: "300px",
    lineHeight: 1.4,
  },
  cardHeader: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  cardTitle: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  cardSubtitle: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
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
    gap: "0.45rem",
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
    color: "var(--accent-purple)",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
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
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "-0.25rem",
  },
  forgotBtn: {
    background: "transparent",
    border: "none",
    color: "var(--accent-purple)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
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
  successAlert: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid var(--status-success)",
    color: "#a7f3d0",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontSize: "0.85rem",
    lineHeight: 1.4,
  },
  cardFooter: {
    borderTop: "1px solid var(--glass-border)",
    paddingTop: "1.25rem",
    textAlign: "center" as const,
    fontSize: "0.9rem",
  },
  footerText: {
    color: "var(--text-secondary)",
  },
  footerLink: {
    color: "var(--accent-purple)",
    fontWeight: 700,
    textDecoration: "none",
    marginLeft: "0.25rem",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    cursor: "pointer",
    textAlign: "center" as const,
    marginTop: "0.5rem",
  },
};
