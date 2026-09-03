"use client";

import { useState, useEffect } from "react";
import LogoutButton from "../LogoutButton";

export default function SettingsPage() {
  // Section 1: Business Profile State
  const [profile, setProfile] = useState({
    shopName: "",
    ownerName: "",
    phoneNumber: "",
    address: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Section 2: AI & Voice State
  const [voiceResponsesEnabled, setVoiceResponsesEnabled] = useState(true);
  const [inputLanguage, setInputLanguage] = useState<"auto" | "hi" | "en">("auto");
  const [clearingChat, setClearingChat] = useState(false);
  const [chatClearSuccess, setChatClearSuccess] = useState("");
  const [chatClearError, setChatClearError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Section 3: Security State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Section 4: Preferences State
  const [appLanguage, setAppLanguage] = useState<"en" | "hi">("en");
  const [currency, setCurrency] = useState("INR");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [prefSuccess, setPrefSuccess] = useState("");

  // Load existing profile, AI, and preference configurations on mount
  useEffect(() => {
    // 1. Fetch backend profile
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/dashboard/setup");
        if (res.ok) {
          const data = await res.json();
          setProfile((prev) => ({
            ...prev,
            shopName: data.shopName || "",
            ownerName: data.ownerName || "",
          }));
          if (data.currency) setCurrency(data.currency);
          if (data.timezone) setTimeZone(data.timezone);
        }
      } catch (err) {
        console.warn("Could not load profile from server:", err);
      }
    };
    fetchProfile();

    // 2. Load LocalStorage configs
    if (typeof window !== "undefined") {
      const savedTts = localStorage.getItem("bolobiz_tts_enabled");
      if (savedTts !== null) {
        setVoiceResponsesEnabled(savedTts === "true");
      }

      const savedLang = localStorage.getItem("bolobiz_language");
      if (savedLang === "hi" || savedLang === "en") {
        setAppLanguage(savedLang);
        setInputLanguage(savedLang);
      }

      const savedPhone = localStorage.getItem("bolobiz_shop_phone");
      if (savedPhone) setProfile((prev) => ({ ...prev, phoneNumber: savedPhone }));

      const savedAddr = localStorage.getItem("bolobiz_shop_address");
      if (savedAddr) setProfile((prev) => ({ ...prev, address: savedAddr }));
    }
  }, []);

  // Save Business Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    setProfileLoading(true);

    if (!profile.shopName.trim()) {
      setProfileError("Shop Name is required.");
      setProfileLoading(false);
      return;
    }

    if (!profile.ownerName.trim()) {
      setProfileError("Owner Name is required.");
      setProfileLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/dashboard/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: profile.shopName,
          ownerName: profile.ownerName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("bolobiz_shop_phone", profile.phoneNumber);
        localStorage.setItem("bolobiz_shop_address", profile.address);
      }

      setProfileSuccess("Business profile updated successfully!");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  // Toggle Voice Synthesis
  const handleToggleVoice = (enabled: boolean) => {
    setVoiceResponsesEnabled(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("bolobiz_tts_enabled", enabled ? "true" : "false");
    }
  };

  // Update Input Language
  const handleInputLanguageChange = (lang: "auto" | "hi" | "en") => {
    setInputLanguage(lang);
    if (typeof window !== "undefined" && lang !== "auto") {
      localStorage.setItem("bolobiz_language", lang);
    }
  };

  // Clear Chat History
  const handleClearChatHistory = async () => {
    setChatClearSuccess("");
    setChatClearError("");
    setClearingChat(true);

    try {
      const res = await fetch("/api/chat", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to clear chat history.");
      }

      setChatClearSuccess("Chat history cleared successfully.");
      setShowClearConfirm(false);
    } catch (err: any) {
      setChatClearError(err.message || "Error clearing chat history.");
    } finally {
      setClearingChat(false);
    }
  };

  // Update Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");
    setPasswordLoading(true);

    if (passwordData.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      setPasswordLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setPasswordSuccess("Your password has been successfully updated.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Save Preferences
  const handleSavePreferences = async () => {
    setPrefSuccess("");
    if (typeof window !== "undefined") {
      localStorage.setItem("bolobiz_language", appLanguage);
    }

    try {
      await fetch("/api/dashboard/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName: profile.shopName || "My Store",
          ownerName: profile.ownerName || "Merchant",
          currency,
          timezone: timeZone,
        }),
      });
      setPrefSuccess("Preferences saved successfully!");
    } catch (err) {
      setPrefSuccess("Preferences saved locally!");
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Centered Settings Header */}
      <div className="dashboard-page-header">
        <h2 className="page-title">⚙️ Settings & Store Preferences</h2>
        <p className="page-subtitle">
          Customize your business details, AI voice assistant settings, security, and regional formats.
        </p>
      </div>

      {/* 4 Responsive Settings Sections */}
      <div style={styles.sectionsContainer}>

        {/* ================================================================= */}
        {/* 1. BUSINESS PROFILE SECTION */}
        {/* ================================================================= */}
        <section className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🏪</span>
            <div>
              <h3 style={styles.cardTitle}>1. Business Profile</h3>
              <p style={styles.cardSubtitle}>
                Manage your shop identity, merchant name, contact details, and location.
              </p>
            </div>
          </div>

          {profileError && <div style={styles.errorAlert}>{profileError}</div>}
          {profileSuccess && <div style={styles.successAlert}>{profileSuccess}</div>}

          <form onSubmit={handleSaveProfile} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Super Market"
                  style={styles.input}
                  value={profile.shopName}
                  onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                  disabled={profileLoading}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  style={styles.input}
                  value={profile.ownerName}
                  onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                  disabled={profileLoading}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  style={styles.input}
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  disabled={profileLoading}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Business Address (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Shop #4, Main Market, Delhi"
                  style={styles.input}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={profileLoading}
                />
              </div>
            </div>

            <div style={styles.actionRow}>
              <button type="submit" disabled={profileLoading} style={styles.primaryBtn}>
                {profileLoading ? "Saving Changes..." : "💾 Save Profile Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* ================================================================= */}
        {/* 2. AI & VOICE SECTION */}
        {/* ================================================================= */}
        <section className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🎙️</span>
            <div>
              <h3 style={styles.cardTitle}>2. AI & Voice Settings</h3>
              <p style={styles.cardSubtitle}>
                Configure voice readouts, speech recognition dialects, and conversation management.
              </p>
            </div>
          </div>

          <div style={styles.settingRows}>
            {/* Toggle: Voice Responses */}
            <div style={styles.settingItem}>
              <div>
                <div style={styles.settingTitle}>Voice Readout Responses</div>
                <div style={styles.settingDesc}>
                  Automatically speak assistant responses aloud in natural Hindi or English.
                </div>
              </div>
              <div style={styles.toggleGroup}>
                <button
                  type="button"
                  onClick={() => handleToggleVoice(true)}
                  style={{
                    ...styles.toggleSegment,
                    ...(voiceResponsesEnabled ? styles.toggleSegmentActive : {}),
                  }}
                >
                  🔊 Enabled
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleVoice(false)}
                  style={{
                    ...styles.toggleSegment,
                    ...(!voiceResponsesEnabled ? styles.toggleSegmentActive : {}),
                  }}
                >
                  🔇 Muted
                </button>
              </div>
            </div>

            {/* Input Language */}
            <div style={styles.settingItem}>
              <div>
                <div style={styles.settingTitle}>Voice Input Language</div>
                <div style={styles.settingDesc}>
                  Select your preferred speech dialect for the AI microphone.
                </div>
              </div>
              <div style={styles.pillGroup}>
                <button
                  type="button"
                  onClick={() => handleInputLanguageChange("auto")}
                  style={{
                    ...styles.pillBtn,
                    ...(inputLanguage === "auto" ? styles.pillBtnActive : {}),
                  }}
                >
                  🌐 Auto-Detect
                </button>
                <button
                  type="button"
                  onClick={() => handleInputLanguageChange("hi")}
                  style={{
                    ...styles.pillBtn,
                    ...(inputLanguage === "hi" ? styles.pillBtnActive : {}),
                  }}
                >
                  🇮🇳 Hindi (हिंदी)
                </button>
                <button
                  type="button"
                  onClick={() => handleInputLanguageChange("en")}
                  style={{
                    ...styles.pillBtn,
                    ...(inputLanguage === "en" ? styles.pillBtnActive : {}),
                  }}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Clear Chat History */}
            <div style={styles.settingItemDestructive}>
              <div>
                <div style={styles.settingTitle}>Clear AI Chat History</div>
                <div style={styles.settingDesc}>
                  Reset stored chat sessions and start fresh. Your financial ledger data remains intact.
                </div>
                {chatClearSuccess && <div style={{ ...styles.successAlert, marginTop: "0.5rem" }}>{chatClearSuccess}</div>}
                {chatClearError && <div style={{ ...styles.errorAlert, marginTop: "0.5rem" }}>{chatClearError}</div>}
              </div>

              <div>
                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    style={styles.dangerBtn}
                  >
                    🗑️ Clear History
                  </button>
                ) : (
                  <div style={styles.confirmBox}>
                    <span style={styles.confirmText}>Are you sure?</span>
                    <button
                      type="button"
                      onClick={handleClearChatHistory}
                      disabled={clearingChat}
                      style={styles.dangerConfirmBtn}
                    >
                      {clearingChat ? "Clearing..." : "Yes, Clear"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(false)}
                      style={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 3. SECURITY SECTION */}
        {/* ================================================================= */}
        <section className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>🔐</span>
            <div>
              <h3 style={styles.cardTitle}>3. Security & Access</h3>
              <p style={styles.cardSubtitle}>
                Update your account password and manage your active login session.
              </p>
            </div>
          </div>

          {passwordError && <div style={styles.errorAlert}>{passwordError}</div>}
          {passwordSuccess && <div style={styles.successAlert}>{passwordSuccess}</div>}

          <form onSubmit={handlePasswordSubmit} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Current Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  disabled={passwordLoading}
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
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  disabled={passwordLoading}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  disabled={passwordLoading}
                />
              </div>
            </div>

            <div style={styles.actionRow}>
              <button type="submit" disabled={passwordLoading} style={styles.primaryBtn}>
                {passwordLoading ? "Updating..." : "🔑 Update Password"}
              </button>
            </div>
          </form>

          <hr style={styles.divider} />

          <div style={styles.logoutRow}>
            <div>
              <div style={styles.settingTitle}>End Active Session</div>
              <div style={styles.settingDesc}>
                Securely sign out of this device.
              </div>
            </div>
            <LogoutButton />
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. PREFERENCES SECTION */}
        {/* ================================================================= */}
        <section className="glass-panel" style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>⚙️</span>
            <div>
              <h3 style={styles.cardTitle}>4. Regional Preferences</h3>
              <p style={styles.cardSubtitle}>
                Select default currency symbols, application language, and local time calculation zone.
              </p>
            </div>
          </div>

          {prefSuccess && <div style={styles.successAlert}>{prefSuccess}</div>}

          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>App Language</label>
              <select
                style={styles.select}
                value={appLanguage}
                onChange={(e) => setAppLanguage(e.target.value as "en" | "hi")}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Store Currency</label>
              <select
                style={styles.select}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="INR">₹ — Indian Rupee (INR)</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Time Zone</label>
              <select
                style={styles.select}
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST — UTC+05:30)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
              </select>
            </div>
          </div>

          <div style={{ ...styles.actionRow, marginTop: "1.25rem" }}>
            <button
              type="button"
              onClick={handleSavePreferences}
              style={styles.primaryBtn}
            >
              🌐 Save Preferences
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.75rem",
    maxWidth: "1000px",
    width: "100%",
    margin: "0 auto",
  },
  header: {
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    marginTop: "0.25rem",
    lineHeight: 1.5,
  },
  sectionsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.75rem",
  },
  card: {
    padding: "2rem",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
    boxShadow: "0 4px 20px var(--glass-shadow)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "1rem",
    borderBottom: "1px solid var(--glass-border)",
    paddingBottom: "1.25rem",
  },
  cardIcon: {
    fontSize: "1.75rem",
    background: "rgba(124, 58, 237, 0.08)",
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.3px",
  },
  cardSubtitle: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: 1.4,
    marginTop: "0.2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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
    color: "var(--accent-purple)",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
  },
  input: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
  },
  select: {
    background: "var(--bg-secondary)",
    border: "1px solid var(--glass-border)",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    outline: "none",
    width: "100%",
    cursor: "pointer",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "0.5rem",
  },
  primaryBtn: {
    background: "var(--accent-purple)",
    color: "#ffffff",
    fontWeight: 700,
    padding: "0.8rem 1.75rem",
    borderRadius: "10px",
    cursor: "pointer",
    border: "none",
    boxShadow: "0 4px 14px rgba(124, 58, 237, 0.25)",
    transition: "all 0.2s ease",
    fontSize: "0.95rem",
  },
  settingRows: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.25rem",
  },
  settingItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "1rem",
    paddingBottom: "1.25rem",
    borderBottom: "1px solid var(--glass-border)",
  },
  settingItemDestructive: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "1rem",
    paddingTop: "0.5rem",
  },
  settingTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--text-primary)",
  },
  settingDesc: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    marginTop: "0.2rem",
    lineHeight: 1.4,
  },
  toggleGroup: {
    display: "flex",
    background: "var(--bg-secondary)",
    borderRadius: "10px",
    border: "1px solid var(--glass-border)",
    padding: "3px",
  },
  toggleSegment: {
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    color: "var(--text-secondary)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  toggleSegmentActive: {
    background: "var(--accent-purple)",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(124, 58, 237, 0.3)",
  },
  pillGroup: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap" as const,
  },
  pillBtn: {
    padding: "0.5rem 0.85rem",
    borderRadius: "20px",
    border: "1px solid var(--glass-border)",
    background: "var(--bg-secondary)",
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  pillBtnActive: {
    background: "rgba(124, 58, 237, 0.15)",
    border: "1px solid var(--accent-purple)",
    color: "var(--accent-purple)",
  },
  dangerBtn: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid var(--status-danger)",
    color: "#ef4444",
    padding: "0.6rem 1.25rem",
    borderRadius: "8px",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  confirmBox: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  confirmText: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#ef4444",
  },
  dangerConfirmBtn: {
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    fontWeight: 700,
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "var(--bg-tertiary)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    padding: "0.5rem 0.85rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  divider: {
    border: "none",
    borderTop: "1px solid var(--glass-border)",
    margin: "0.5rem 0",
  },
  logoutRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: "1rem",
    paddingTop: "0.5rem",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.12)",
    border: "1px solid var(--status-danger)",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
  },
  successAlert: {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid var(--status-success)",
    color: "#a7f3d0",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
  },
};
