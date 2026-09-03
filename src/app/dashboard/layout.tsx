import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardNav from "./DashboardNav";

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
    <div className="dashboard-layout-container">
      {/* Navigation (Desktop Sidebar & Mobile Drawer/Header) */}
      <DashboardNav
        businessName={businessName}
        userName={session.name}
        userEmail={session.email}
      />

      {/* Main content workspace */}
      <div className="dashboard-workspace">
        <header className="dashboard-workspace-header glass-panel">
          <div className="header-title">
            Business Manager
          </div>
          <div className="header-status">
            <span className="pulse-dot"></span> System Live (Tenant Isolated)
          </div>
        </header>
        <main className="dashboard-main-content">{children}</main>
      </div>
    </div>
  );
}
