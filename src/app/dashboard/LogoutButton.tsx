"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        router.refresh();
        router.push("/");
      } else {
        console.error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={styles.button}
    >
      {loading ? "Signing Out..." : "Sign Out 🚪"}
    </button>
  );
}

const styles = {
  button: {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "8px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.15)",
    color: "#fca5a5",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center" as const,
    fontSize: "0.9rem",
    ":hover": {
      background: "rgba(239, 68, 68, 0.15)",
    },
  },
};
