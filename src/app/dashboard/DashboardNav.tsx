"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

interface DashboardNavProps {
  businessName: string;
  userName: string;
  userEmail: string;
}

export default function DashboardNav({ businessName, userName, userEmail }: DashboardNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/assistant", label: "AI Assistant", icon: "🎙️", highlight: true },
    { href: "/dashboard/customers", label: "Customers (Khata)", icon: "👥" },
    { href: "/dashboard/inventory", label: "Inventory Stock", icon: "📦" },
    { href: "/dashboard/transactions", label: "Transaction Log", icon: "💰" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <>
      {/* Mobile Top Header (Visible on screens < 1024px) */}
      <div className="dashboard-mobile-header glass-panel">
        <div className="mobile-header-brand">
          <span className="brand-icon">🎙️</span>
          <span className="brand-name">BoloBiz</span>
        </div>
        
        <div className="mobile-header-right">
          <div className="mobile-biz-badge">{businessName}</div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-nav-toggle"
            aria-label="Toggle Dashboard Menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileOpen && (
        <div className="dashboard-mobile-backdrop" onClick={() => setMobileOpen(false)}>
          <div className="dashboard-mobile-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div className="drawer-brand">
                <span>🎙️</span> BoloBiz
              </div>
              <button className="drawer-close" onClick={() => setMobileOpen(false)}>✕</button>
            </div>

            <div className="drawer-biz-card">
              <div className="drawer-biz-name">{businessName}</div>
              <div className="drawer-role">Store Owner Profile</div>
            </div>

            <nav className="drawer-nav">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`drawer-link ${isActive ? "active" : ""} ${item.highlight ? "highlight" : ""}`}
                  >
                    <span className="drawer-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="drawer-footer">
              <div className="drawer-user">
                <div className="drawer-username">{userName}</div>
                <div className="drawer-email">{userEmail}</div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar (Visible on screens >= 1024px) */}
      <aside className="dashboard-desktop-sidebar glass-panel">
        <div className="desktop-brand">
          <span className="brand-icon">🎙️</span> BoloBiz
        </div>

        <div className="desktop-biz-badge">
          <div className="biz-name">{businessName}</div>
          <div className="biz-role">Owner Profile</div>
        </div>

        <nav className="desktop-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`desktop-nav-link ${isActive ? "active" : ""} ${item.highlight ? "highlight" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="desktop-sidebar-footer">
          <div className="desktop-user-info">
            <div className="desktop-user-name">{userName}</div>
            <div className="desktop-user-email">{userEmail}</div>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
