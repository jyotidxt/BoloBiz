import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { businessId: session.businessId },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve transaction logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, amount, customerId, description } = await request.json();
    if (!type || amount === undefined) {
      return NextResponse.json({ error: "Transaction type and amount are required" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      return NextResponse.json({ error: "Transaction amount must be greater than zero" }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create transaction record
      const trans = await tx.transaction.create({
        data: {
          type,
          amount: numericAmount,
          description: description || null,
          customerId: customerId || null,
          businessId: session.businessId,
        },
      });

      // 2. Adjust customer balance if this is a loan or loan repayment
      if (customerId && (type === "CREDIT" || type === "PAYMENT_RECEIVED")) {
        const delta = type === "CREDIT" ? numericAmount : -numericAmount;
        await tx.customer.update({
          where: { id: customerId, businessId: session.businessId },
          data: {
            outstandingBalance: {
              increment: delta,
            },
          },
        });
      }

      return trans;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Failed to record transaction" },
      { status: 500 }
    );
  }
}
