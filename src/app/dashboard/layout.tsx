import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import LogoutButton from "./LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  const business = await prisma.business.findUnique({
    where: { id: session.businessId },
    select: { name: true },
  });

  const businessName = business?.name || "My Business";

  return (
    <div style={styles.container}>
      {/* Sidebar navigation */}
      <aside className="glass-panel" style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>🎙️</span> BoloBiz
        </div>
        <div style={styles.businessBadge}>
          <div style={styles.bizName}>{businessName}</div>
          <div style={styles.roleName}>Owner Profile</div>
        </div>

        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.navLink}>
            <span style={styles.navIcon}>📊</span> Dashboard
          </Link>
          <Link href="/dashboard/assistant" style={styles.navLinkHighlight}>
            <span style={styles.navIcon}>🎙️</span> AI Assistant
          </Link>
          <Link href="/dashboard/customers" style={styles.navLink}>
            <span style={styles.navIcon}>👥</span> Customers (Khata)
          </Link>
          <Link href="/dashboard/inventory" style={styles.navLink}>
            <span style={styles.navIcon}>📦</span> Inventory Stock
          </Link>
          <Link href="/dashboard/transactions" style={styles.navLink}>
            <span style={styles.navIcon}>💰</span> Transaction Log
          </Link>
          <Link href="/dashboard/settings" style={styles.navLink}>
            <span style={styles.navIcon}>⚙️</span> Settings
          </Link>
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userName}>{session.name}</div>
            <div style={styles.userEmail}>{session.email}</div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main content workspace */}
      <div style={styles.workspace}>
        <header className="glass-panel" style={styles.header}>
          <div style={styles.headerTitle}>
            Business Manager
          </div>
          <div style={styles.headerStatus}>
            <span style={styles.pulseDot}></span> System Live (Tenant Isolated)
          </div>
        </header>
        <main style={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
    background: "var(--bg-radial)",
  },
  sidebar: {
    width: "280px",
    display: "flex",
    flexDirection: "column" as const,
    padding: "2rem 1.5rem",
    borderRadius: "0px",
    borderTop: "none",
    borderBottom: "none",
    borderLeft: "none",
    borderRight: "1px solid var(--glass-border)",
    height: "100vh",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    background: "var(--sidebar-bg)",
    backdropFilter: "blur(20px)",
  },
  brand: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  brandIcon: {
    fontSize: "1.75rem",
  },
  businessBadge: {
    background: "var(--glass-bg)",
    border: "1px solid var(--glass-border)",
    borderRadius: "12px",
    padding: "0.75rem 1rem",
    marginBottom: "2rem",
  },
  bizName: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  roleName: {
    fontSize: "0.75rem",
    color: "var(--accent-purple)",
    fontWeight: 600,
    marginTop: "0.2rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    flex: 1,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.85rem 1rem",
    borderRadius: "10px",
    color: "var(--text-secondary)",
    fontSize: "0.95rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
    ":hover": {
      background: "var(--bg-tertiary)",
      color: "var(--text-primary)",
    },
  },
  navLinkHighlight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.85rem 1rem",
    borderRadius: "10px",
    color: "var(--accent-purple)",
    fontSize: "0.95rem",
    fontWeight: 600,
    background: "rgba(124, 58, 237, 0.06)",
    border: "1px solid rgba(124, 58, 237, 0.12)",
  },
  navIcon: {
    fontSize: "1.15rem",
  },
  sidebarFooter: {
    marginTop: "auto",
    borderTop: "1px solid var(--glass-border)",
    paddingTop: "1.5rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  userInfo: {
    overflow: "hidden",
  },
  userName: {
    fontWeight: 600,
    color: "var(--text-primary)",
    fontSize: "0.95rem",
  },
  userEmail: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap" as const,
  },
  workspace: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    overflowY: "auto" as const,
  },
  header: {
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    borderRadius: "0px",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "1px solid var(--glass-border)",
    position: "sticky" as const,
    top: 0,
    zIndex: 9,
    backdropFilter: "blur(12px)",
    background: "var(--sidebar-bg)",
  },
  headerTitle: {
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.2px",
  },
  headerStatus: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "rgba(16, 185, 129, 0.06)",
    padding: "0.4rem 0.8rem",
    borderRadius: "15px",
    border: "1px solid rgba(16, 185, 129, 0.15)",
  },
  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--status-success)",
    display: "inline-block",
    boxShadow: "0 0 8px var(--status-success)",
  },
  mainContent: {
    padding: "2rem",
    flex: 1,
  },
};
