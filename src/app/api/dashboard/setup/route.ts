import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
      where: { id: session.businessId },
      include: {
        users: {
          where: { id: session.userId },
          select: { name: true, email: true, role: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const user = business.users[0];

    return NextResponse.json({
      shopName: business.name,
      ownerName: user?.name || session.name,
      email: user?.email || session.email,
      currency: business.currency || "INR",
      timezone: business.timezone || "Asia/Kolkata",
    });
  } catch (error: any) {
    console.error("Fetch profile API error:", error);
    return NextResponse.json(
      { error: "Failed to load business profile." },
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

    const { shopName, ownerName, currency, timezone } = await request.json();
    if (!shopName || !shopName.trim()) {
      return NextResponse.json({ error: "Shop name is required." }, { status: 400 });
    }
    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json({ error: "Owner name is required." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Business details
      await tx.business.update({
        where: { id: session.businessId },
        data: {
          name: shopName.trim(),
          ...(currency ? { currency } : {}),
          ...(timezone ? { timezone } : {}),
        },
      });

      // 2. Update Owner User name
      await tx.user.update({
        where: { id: session.userId },
        data: { name: ownerName.trim() },
      });
    });

    return NextResponse.json({ success: true, message: "Profile updated successfully." });
  } catch (error: any) {
    console.error("Business setup API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
