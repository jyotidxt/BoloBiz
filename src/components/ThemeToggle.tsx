"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Check local storage or system preference on load
    const savedTheme = localStorage.getItem("bolobiz_theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("bolobiz_theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      // Trigger a custom event so other components (like Clerk views) can react
      window.dispatchEvent(new Event("theme-change"));
    } else {
      document.documentElement.classList.remove("dark");
      window.dispatchEvent(new Event("theme-change"));
    }
  };

  return (
    <button
      onClick={toggleTheme}
      style={styles.toggleBtn}
      aria-label="Toggle dark/light theme"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      <span style={styles.icon}>{theme === "light" ? "🌙" : "☀️"}</span>
    </button>
  );
}

const styles = {
  toggleBtn: {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px var(--glass-shadow)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s ease",
    ":hover": {
      transform: "scale(1.1)",
      background: "var(--bg-tertiary)",
    },
  },
  icon: {
    fontSize: "1.4rem",
    lineHeight: 1,
  },
};
