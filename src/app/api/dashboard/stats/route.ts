import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = session;

    // Get today's range
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // 1. Calculate today's sales amount and sales count
    const todaySales = await prisma.transaction.aggregate({
      where: {
        businessId,
        type: "SALE",
        createdAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // 2. Calculate outstanding credit (total balance lent to customers)
    const outstandingCredit = await prisma.customer.aggregate({
      where: {
        businessId,
        outstandingBalance: {
          gt: 0,
        },
      },
      _sum: {
        outstandingBalance: true,
      },
      _count: {
        id: true,
      },
    });

    // 3. Count products with low stock
    const lowStockCount = await prisma.product.count({
      where: {
        businessId,
        stockQuantity: {
          lte: prisma.product.fields.lowStockThreshold, // prisma doesn't support direct self-referential conditions easily in SQLite, so let's fetch products and filter in JS or do it standard
        },
      },
    });

    // Let's check low stock products more reliably by fetching and filtering in code, or writing a custom where if prisma allows.
    // SQLite can do this, but Prisma has issues with self-referential comparisons on some versions.
    // Let's do it safely by pulling products where stock <= lowStockThreshold.
    const allProducts = await prisma.product.findMany({
      where: { businessId },
      select: { stockQuantity: true, lowStockThreshold: true },
    });
    const computedLowStockCount = allProducts.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;

    // 4. Fetch last 5 recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      todaySalesAmount: todaySales._sum.amount || 0,
      todaySalesCount: todaySales._count.id || 0,
      outstandingCreditAmount: outstandingCredit._sum.outstandingBalance || 0,
      outstandingCreditCustomersCount: outstandingCredit._count.id || 0,
      lowStockProductsCount: computedLowStockCount,
      recentTransactions,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dashboard statistics" },
      { status: 500 }
    );
  }
}
