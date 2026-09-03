import { prisma } from "@/lib/db";

export interface Insight {
  type: "LOW_STOCK" | "OUTSTANDING_PAYMENT" | "SALES_INCREASE" | "SALES_DECREASE" | "EXPENSE_SPIKE" | "TOP_PRODUCT" | "NO_SALES";
  title: string;
  fact: string;
  suggestion: string;
  priority: number; // 1 = Critical, 2 = Important, 3 = Info
  metadata?: any;
}

export interface BusinessAnalyticsSummary {
  businessName: string;
  ownerName: string;
  totalTransactions: number;
  timezone: string;
  salesToday: number;
  salesTodayCount: number;
  salesYesterday: number;
  salesYesterdayCount: number;
  salesChangePercent: number; // vs yesterday
  
  salesThisWeek: number;
  salesThisMonth: number;
  salesPrevMonth: number;
  monthSalesChangePercent: number; // vs prev month
  
  expensesToday: number;
  expensesThisWeek: number;
  expensesThisMonth: number;
  
  salesAfterExpensesToday: number;
  
  totalOutstandingCredit: number;
  debtorsCount: number;
  highestOutstandingCustomer: { name: string; balance: number } | null;
  oldestOutstandingDays: number;
  
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  
  recentSalesTrend: { date: string; amount: number }[];
  debtorsList: { name: string; balance: number; phone: string; oldestPendingDays: number }[];
  lowStockList: { name: string; stock: number; threshold: number }[];
  
  insights: Insight[];
}

export function getTimezoneOffsetMs(timeZone: string, date: Date = new Date()): number {
  try {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
    return tzDate.getTime() - utcDate.getTime();
  } catch {
    return 5.5 * 60 * 60 * 1000; // Fallback to +05:30 Asia/Kolkata
  }
}

/**
 * Calculates correct date boundaries in the target timezone converted to UTC for database querying.
 */
export function getDateRangesInTimezone(timezone: string = "Asia/Kolkata", baseDate: Date = new Date()) {
  let formattedParts;
  try {
    formattedParts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).formatToParts(baseDate);
  } catch {
    formattedParts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).formatToParts(baseDate);
  }

  const getPart = (type: string) => parseInt(formattedParts.find((p) => p.type === type)?.value || "0");

  const year = getPart("year");
  const month = getPart("month") - 1; // 0-indexed
  const day = getPart("day");

  const offsetMs = getTimezoneOffsetMs(timezone, baseDate);

  // Helper to resolve the correct UTC date from local date components using Date.UTC
  const getUtcDate = (yr: number, mo: number, dy: number, hr: number, mi: number, se: number, ms: number) => {
    const localUtcMs = Date.UTC(yr, mo, dy, hr, mi, se, ms);
    return new Date(localUtcMs - offsetMs);
  };

  const todayStart = getUtcDate(year, month, day, 0, 0, 0, 0);
  const todayEnd = getUtcDate(year, month, day, 23, 59, 59, 999);

  const yesterdayStart = getUtcDate(year, month, day - 1, 0, 0, 0, 0);
  const yesterdayEnd = getUtcDate(year, month, day - 1, 23, 59, 59, 999);

  // Find start of week (Monday)
  const localDayDate = new Date(Date.UTC(year, month, day));
  const dayOfWeek = localDayDate.getUTCDay(); // Sunday=0, Monday=1...
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekStart = getUtcDate(year, month, day - daysSinceMonday, 0, 0, 0, 0);

  const thisMonthStart = getUtcDate(year, month, 1, 0, 0, 0, 0);
  const prevMonthStart = getUtcDate(year, month - 1, 1, 0, 0, 0, 0);
  const prevMonthEnd = getUtcDate(year, month, 0, 23, 59, 59, 999);

  return {
    todayStart,
    todayEnd,
    yesterdayStart,
    yesterdayEnd,
    thisWeekStart,
    thisMonthStart,
    prevMonthStart,
    prevMonthEnd,
    localYear: year,
    localMonth: month,
    localDay: day,
  };
}

/**
 * Computes business intelligence aggregates and runs proactive insight rules.
 */
export async function getBusinessAnalyticsAndInsights(businessId: string): Promise<BusinessAnalyticsSummary> {
  // Fetch business timezone settings
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { timezone: true, name: true },
  });

  const owner = await prisma.user.findFirst({
    where: { businessId, role: "OWNER" },
    select: { name: true },
  });

  const totalTransactions = await prisma.transaction.count({ where: { businessId } });

  const timezone = business?.timezone || "Asia/Kolkata";
  const ranges = getDateRangesInTimezone(timezone);

  // 1. Sales metrics
  const todaySales = await prisma.transaction.aggregate({
    where: { businessId, type: "SALE", createdAt: { gte: ranges.todayStart, lte: ranges.todayEnd } },
    _sum: { amount: true },
    _count: { id: true },
  });

  const yesterdaySales = await prisma.transaction.aggregate({
    where: { businessId, type: "SALE", createdAt: { gte: ranges.yesterdayStart, lte: ranges.yesterdayEnd } },
    _sum: { amount: true },
    _count: { id: true },
  });

  const weekSales = await prisma.transaction.aggregate({
    where: { businessId, type: "SALE", createdAt: { gte: ranges.thisWeekStart, lte: ranges.todayEnd } },
    _sum: { amount: true },
  });

  const monthSales = await prisma.transaction.aggregate({
    where: { businessId, type: "SALE", createdAt: { gte: ranges.thisMonthStart, lte: ranges.todayEnd } },
    _sum: { amount: true },
  });

  const prevMonthSales = await prisma.transaction.aggregate({
    where: { businessId, type: "SALE", createdAt: { gte: ranges.prevMonthStart, lte: ranges.prevMonthEnd } },
    _sum: { amount: true },
  });

  const salesToday = todaySales._sum.amount || 0;
  const salesYesterday = yesterdaySales._sum.amount || 0;
  const salesThisWeek = weekSales._sum.amount || 0;
  const salesThisMonth = monthSales._sum.amount || 0;
  const salesPrevMonth = prevMonthSales._sum.amount || 0;

  let salesChangePercent = 0;
  if (salesYesterday > 0) {
    salesChangePercent = Math.round(((salesToday - salesYesterday) / salesYesterday) * 100);
  }

  let monthSalesChangePercent = 0;
  if (salesPrevMonth > 0) {
    monthSalesChangePercent = Math.round(((salesThisMonth - salesPrevMonth) / salesPrevMonth) * 100);
  }

  // 2. Expense metrics
  const todayExpenses = await prisma.transaction.aggregate({
    where: { businessId, type: "EXPENSE", createdAt: { gte: ranges.todayStart, lte: ranges.todayEnd } },
    _sum: { amount: true },
  });

  const weekExpenses = await prisma.transaction.aggregate({
    where: { businessId, type: "EXPENSE", createdAt: { gte: ranges.thisWeekStart, lte: ranges.todayEnd } },
    _sum: { amount: true },
  });

  const monthExpenses = await prisma.transaction.aggregate({
    where: { businessId, type: "EXPENSE", createdAt: { gte: ranges.thisMonthStart, lte: ranges.todayEnd } },
    _sum: { amount: true },
  });

  const expensesToday = todayExpenses._sum.amount || 0;
  const expensesThisWeek = weekExpenses._sum.amount || 0;
  const expensesThisMonth = monthExpenses._sum.amount || 0;

  // 3. Customer outstanding credit
  const outstandingCreditAgg = await prisma.customer.aggregate({
    where: { businessId, outstandingBalance: { gt: 0 } },
    _sum: { outstandingBalance: true },
    _count: { id: true },
  });
  
  const totalOutstandingCredit = outstandingCreditAgg._sum.outstandingBalance || 0;
  const debtorsCount = outstandingCreditAgg._count.id || 0;

  const topDebtor = await prisma.customer.findFirst({
    where: { businessId, outstandingBalance: { gt: 0 } },
    orderBy: { outstandingBalance: "desc" },
    select: { name: true, outstandingBalance: true },
  });

  const highestOutstandingCustomer = topDebtor
    ? { name: topDebtor.name, balance: topDebtor.outstandingBalance }
    : null;

  // Oldest outstanding loan calculations
  const oldestPendingCredit = await prisma.transaction.findFirst({
    where: {
      businessId,
      type: "CREDIT",
      customer: { outstandingBalance: { gt: 0 } },
    },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  let oldestOutstandingDays = 0;
  if (oldestPendingCredit) {
    const diffMs = new Date().getTime() - oldestPendingCredit.createdAt.getTime();
    oldestOutstandingDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // 4. Inventory counts and low stock warnings
  const totalProducts = await prisma.product.count({ where: { businessId } });
  const totalCustomers = await prisma.customer.count({ where: { businessId } });

  const products = await prisma.product.findMany({
    where: { businessId },
    select: { id: true, name: true, stockQuantity: true, lowStockThreshold: true },
  });

  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0);
  const outOfStockProducts = products.filter((p) => p.stockQuantity <= 0);

  const lowStockCount = lowStockProducts.length;
  const outOfStockCount = outOfStockProducts.length;

  // 5. Debtors aging list
  const debtorsListRaw = await prisma.customer.findMany({
    where: { businessId, outstandingBalance: { gt: 0 } },
    orderBy: { outstandingBalance: "desc" },
    select: { id: true, name: true, outstandingBalance: true, phone: true },
    take: 5,
  });

  const debtorsList = await Promise.all(
    debtorsListRaw.map(async (c) => {
      // Find their oldest credit transaction to calculate pending days
      const oldestTx = await prisma.transaction.findFirst({
        where: { businessId, type: "CREDIT", customerId: c.id },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      });
      let oldestPendingDays = 0;
      if (oldestTx) {
        const diffMs = new Date().getTime() - oldestTx.createdAt.getTime();
        oldestPendingDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }
      return {
        name: c.name,
        balance: c.outstandingBalance,
        phone: c.phone || "N/A",
        oldestPendingDays,
      };
    })
  );

  // 6. Recent Sales Trend (Last 7 days bar data)
  const recentSalesTrend: { date: string; amount: number }[] = [];
  const KOLKATA_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  
  for (let i = 6; i >= 0; i--) {
    const dayStartLocal = new Date(new Date().getTime() + KOLKATA_OFFSET_MS - i * 24 * 60 * 60 * 1000);
    dayStartLocal.setUTCHours(0, 0, 0, 0);
    const dayStartUTC = new Date(dayStartLocal.getTime() - KOLKATA_OFFSET_MS);

    const dayEndLocal = new Date(new Date().getTime() + KOLKATA_OFFSET_MS - i * 24 * 60 * 60 * 1000);
    dayEndLocal.setUTCHours(23, 59, 59, 999);
    const dayEndUTC = new Date(dayEndLocal.getTime() - KOLKATA_OFFSET_MS);

    const daySales = await prisma.transaction.aggregate({
      where: { businessId, type: "SALE", createdAt: { gte: dayStartUTC, lte: dayEndUTC } },
      _sum: { amount: true },
    });

    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: timezone }).format(dayStartLocal);
    recentSalesTrend.push({
      date: dayName,
      amount: daySales._sum.amount || 0,
    });
  }

  // 7. Proactive Insight Engine Rules
  const insights: Insight[] = [];

  // Out of Stock (Critical)
  outOfStockProducts.forEach((p) => {
    insights.push({
      type: "LOW_STOCK",
      title: "⚠️ Out of Stock Alert",
      fact: `"${p.name}" is completely out of stock.`,
      suggestion: `Restock "${p.name}" immediately to prevent losing customer sales.`,
      priority: 1,
      metadata: { productId: p.id, name: p.name },
    });
  });

  // Low Stock (Critical)
  lowStockProducts.forEach((p) => {
    insights.push({
      type: "LOW_STOCK",
      title: "📦 Low Stock Warning",
      fact: `"${p.name}" has only ${p.stockQuantity} units remaining.`,
      suggestion: `Consider ordering more units of "${p.name}" soon before it is sold out.`,
      priority: 1,
      metadata: { productId: p.id, name: p.name },
    });
  });

  // Old Outstanding Balances (Important)
  debtorsList.forEach((d) => {
    if (d.oldestPendingDays >= 7) {
      insights.push({
        type: "OUTSTANDING_PAYMENT",
        title: "⏰ Aged Udhaar Pending",
        fact: `"${d.name}" has an outstanding balance of ₹${d.balance} pending for ${d.oldestPendingDays} days.`,
        suggestion: `You may want to send a polite payment reminder to settle this balance.`,
        priority: 2,
        metadata: { customerName: d.name, balance: d.balance },
      });
    }
  });

  // High Outstanding Credit Warnings (Important)
  if (highestOutstandingCustomer && highestOutstandingCustomer.balance >= 1500) {
    insights.push({
      type: "OUTSTANDING_PAYMENT",
      title: "👥 High Credit Account",
      fact: `"${highestOutstandingCustomer.name}" has the highest outstanding balance of ₹${highestOutstandingCustomer.balance}.`,
      suggestion: `Keep an eye on further credit extensions until this balance is partially paid.`,
      priority: 2,
      metadata: { customerName: highestOutstandingCustomer.name, balance: highestOutstandingCustomer.balance },
    });
  }

  // Monthly Sales Drop (Important)
  if (salesPrevMonth > 0 && salesThisMonth < salesPrevMonth && monthSalesChangePercent < -5) {
    insights.push({
      type: "SALES_DECREASE",
      title: "📉 Monthly Sales Decline",
      fact: `This month's sales are ₹${salesThisMonth}, which is ${Math.abs(monthSalesChangePercent)}% lower than last month (₹${salesPrevMonth}).`,
      suggestion: `Run target discounts on fast-moving items to boost transactions.`,
      priority: 2,
    });
  }

  // Today's Expense Spikes (Important)
  if (expensesToday > 0 && salesToday > 0 && expensesToday >= salesToday * 0.5) {
    insights.push({
      type: "EXPENSE_SPIKE",
      title: "⚠️ High Relative Expenses",
      fact: `Today's expenses of ₹${expensesToday} represent ${Math.round((expensesToday / salesToday) * 100)}% of today's sales.`,
      suggestion: `Review today's transaction log to verify all payouts are correct.`,
      priority: 2,
    });
  }

  // Sales Surge (Info)
  if (salesYesterday > 0 && salesToday > salesYesterday && salesChangePercent >= 10) {
    insights.push({
      type: "SALES_INCREASE",
      title: "🚀 Sales Performance Boost",
      fact: `Today's sales are ₹${salesToday}, up ${salesChangePercent}% from yesterday's total of ₹${salesYesterday}.`,
      suggestion: `Great progress! Keep your fastest-selling inventory items well stocked.`,
      priority: 3,
    });
  }

  // No Sales Today (Info)
  const currentHour = new Date(new Date().getTime() + KOLKATA_OFFSET_MS).getUTCHours();
  if (salesToday === 0 && currentHour >= 12) {
    insights.push({
      type: "NO_SALES",
      title: "💤 No Sales Logged Today",
      fact: "No sales transactions have been logged in your dashboard since morning.",
      suggestion: "Record a new sale by saying 'Aaj ₹200 ki sale hui' to start tracking today's progress.",
      priority: 3,
    });
  }

  // Sort insights by priority (1 = Critical, 2 = Important, 3 = Info)
  insights.sort((a, b) => a.priority - b.priority);

  return {
    businessName: business?.name || "My Business",
    ownerName: owner?.name || "BoloBiz Merchant",
    totalTransactions,
    timezone,
    salesToday,
    salesTodayCount: todaySales._count.id || 0,
    salesYesterday,
    salesYesterdayCount: yesterdaySales._count.id || 0,
    salesChangePercent,
    
    salesThisWeek,
    salesThisMonth,
    salesPrevMonth,
    monthSalesChangePercent,
    
    expensesToday,
    expensesThisWeek,
    expensesThisMonth,
    
    salesAfterExpensesToday: salesToday - expensesToday,
    
    totalOutstandingCredit,
    debtorsCount,
    highestOutstandingCustomer,
    oldestOutstandingDays,
    
    totalCustomers,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    
    recentSalesTrend,
    debtorsList,
    lowStockList: lowStockProducts.concat(outOfStockProducts).map(p => ({
      name: p.name,
      stock: p.stockQuantity,
      threshold: p.lowStockThreshold,
    })).slice(0, 5),
    
    insights,
  };
}
