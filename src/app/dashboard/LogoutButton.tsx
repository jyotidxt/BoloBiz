"use client";

import { SignOutButton } from "@clerk/nextjs";

export default function LogoutButton() {
  return (
    <SignOutButton redirectUrl="/">
      <button style={styles.button}>
        Sign Out 🚪
      </button>
    </SignOutButton>
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
  },
};
