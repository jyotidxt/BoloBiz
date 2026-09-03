"use client";

import { useState, useEffect, useRef } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  const { loaded: isClerkLoaded, client, setActive } = useClerk();
  const { isLoaded: isUserLoaded, isSignedIn } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepComplete, setStepComplete] = useState(false);
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);

  // Check on initial page load only: If already signed in before opening signup, forward to dashboard
  const initialMountChecked = useRef(false);
  useEffect(() => {
    if (!initialMountChecked.current && isUserLoaded && isSignedIn && !pendingVerification && !stepComplete) {
      initialMountChecked.current = true;
      window.location.href = "/dashboard";
    }
  }, [isUserLoaded, isSignedIn, pendingVerification, stepComplete]);

  // Fallback timeout to prevent infinite stuck loading state if network fails
  useEffect(() => {
    if (isClerkLoaded) return;
    const timer = setTimeout(() => {
      if (!isClerkLoaded) {
        setTimedOut(true);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [isClerkLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!isClerkLoaded || !client) {
      setError("Authentication is still loading. Please wait a moment.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create Clerk SignUp session
      const signUp = await client.signUp.create({
        emailAddress: email.trim(),
        password,
      });

      // 2. Check if immediate complete or email verification code required
      if (signUp.status === "complete") {
        setStepComplete(true);
        await setActive({ session: signUp.createdSessionId });
        window.location.href = "/onboarding";
      } else {
        // Prepare email code verification
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setPendingVerification(true);
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Failed to create account.";
      
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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!isClerkLoaded || !client) {
      setError("Authentication is still loading. Please wait a moment.");
      return;
    }

    setLoading(true);

    try {
      const completeSignUp = await client.signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (completeSignUp.status === "complete") {
        setStepComplete(true);
        await setActive({ session: completeSignUp.createdSessionId });
        // Forward directly to Step 2 (Shop Onboarding)
        window.location.href = "/onboarding";
      } else {
        setError("Verification incomplete. Please verify your code and try again.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid verification code.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isAuthReady = isClerkLoaded;

  return (
    <div style={styles.pageWrapper}>
      {/* Animated background glowing gradient blobs */}
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
              Start your business <br />
              <span style={styles.brandHighlight}>with AI</span>
            </h1>
            <p style={styles.hindiSubtitle}>
              &ldquo;अपनी दुकान को स्मार्ट तरीके से मैनेज कीजिये।&rdquo;
            </p>
          </div>

          {/* Feature Illustration Preview Box */}
          <div style={styles.illustrationCard}>
            <div style={styles.illustrationHeader}>
              <div style={styles.illMicCircle}>
                <span>🎙️</span>
              </div>
              <div>
                <div style={styles.illTitle}>BoloBiz AI Merchant OS</div>
                <div style={styles.illSubtitle}>Voice-Led Kirana Intelligence</div>
              </div>
            </div>
            <div style={styles.illWaveform}>
              <div style={styles.illBar1}></div>
              <div style={styles.illBar2}></div>
              <div style={styles.illBar3}></div>
              <div style={styles.illBar4}></div>
              <div style={styles.illBar5}></div>
            </div>
          </div>

          {/* Three Feature Bullets */}
          <div style={styles.bulletList}>
            <div style={styles.bulletItem}>
              <div style={styles.bulletIcon}>✓</div>
              <span style={styles.bulletText}>Voice-powered ledger & transactions</span>
            </div>
            <div style={styles.bulletItem}>
              <div style={styles.bulletIcon}>✓</div>
              <span style={styles.bulletText}>Hindi + English natural dialect support</span>
            </div>
            <div style={styles.bulletItem}>
              <div style={styles.bulletIcon}>✓</div>
              <span style={styles.bulletText}>Automated AI business analytics & alerts</span>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT SIDE: Custom Auth Card                            */}
        {/* ======================================================= */}
        <div style={styles.rightCol}>
          <div style={styles.authCard}>

            {/* 1. Transitioning to Step 2 State */}
            {stepComplete && (
              <div style={styles.loadingBox} className="animate-fade-in">
                <div style={styles.spinnerWrapper}>
                  <div style={styles.spinner} />
                  <span style={styles.spinnerCenterIcon}>🏪</span>
                </div>
                <div style={styles.loadingTitle}>Step 1 Complete!</div>
                <div style={styles.loadingSubtitle}>Proceeding to Step 2: Shop Setup...</div>
              </div>
            )}

            {/* 2. Branded Loading State before Clerk is initialized */}
            {!isAuthReady && !timedOut && !stepComplete && (
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
            {!isAuthReady && timedOut && !stepComplete && (
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

            {/* 4. Render Step 1 Form */}
            {isAuthReady && !stepComplete && !pendingVerification && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={styles.cardHeader}>
                  <div style={styles.stepBadge}>Step 1 of 2</div>
                  <h2 style={styles.cardTitle}>Create your account</h2>
                  <p style={styles.cardSubtitle}>
                    Get started with your smart Kirana assistant in seconds.
                  </p>
                </div>

                {error && <div style={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
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
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                      className="auth-input-focus"
                      disabled={loading}
                    />
                    <span style={styles.ruleNote}>
                      🔒 Minimum 8 characters required
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-btn-primary"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {loading ? "Creating Account..." : "Create Account →"}
                  </button>
                </form>

                <div style={styles.cardFooter}>
                  <span style={styles.footerText}>Already have an account? </span>
                  <Link href="/login" style={styles.footerLink}>
                    Sign In
                  </Link>
                </div>
              </div>
            )}

            {/* 5. Step 1.5: Email Verification Code (If required by Clerk) */}
            {isAuthReady && !stepComplete && pendingVerification && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div style={styles.cardHeader}>
                  <div style={styles.stepBadge}>Verification</div>
                  <h2 style={styles.cardTitle}>Verify your email</h2>
                  <p style={styles.cardSubtitle}>
                    We sent a 6-digit verification code to <strong>{email}</strong>
                  </p>
                </div>

                {error && <div style={styles.errorAlert}>{error}</div>}

                <form onSubmit={handleVerifyCode} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      style={{ ...styles.input, textAlign: "center", letterSpacing: "4px", fontSize: "1.25rem" }}
                      className="auth-input-focus"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-btn-primary"
                    style={{ marginTop: "0.5rem" }}
                  >
                    {loading ? "Verifying..." : "Verify & Continue to Step 2 →"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingVerification(false)}
                    style={styles.backBtn}
                  >
                    ← Back to signup
                  </button>
                </form>
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
  illWaveform: {
    display: "flex",
    gap: "5px",
    alignItems: "center",
    height: "16px",
    paddingLeft: "0.25rem",
  },
  illBar1: { width: "4px", height: "60%", background: "var(--accent-purple)", borderRadius: "2px" },
  illBar2: { width: "4px", height: "100%", background: "var(--accent-pink)", borderRadius: "2px" },
  illBar3: { width: "4px", height: "80%", background: "var(--accent-purple)", borderRadius: "2px" },
  illBar4: { width: "4px", height: "40%", background: "var(--accent-pink)", borderRadius: "2px" },
  illBar5: { width: "4px", height: "90%", background: "var(--accent-purple)", borderRadius: "2px" },
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
  stepBadge: {
    display: "inline-block",
    width: "fit-content",
    background: "rgba(124, 58, 237, 0.1)",
    border: "1px solid rgba(124, 58, 237, 0.2)",
    color: "var(--accent-purple)",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "0.25rem",
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
  ruleNote: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    marginTop: "0.15rem",
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
