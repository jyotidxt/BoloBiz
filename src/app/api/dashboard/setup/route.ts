import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopName, ownerName } = await request.json();
    if (!shopName || !shopName.trim()) {
      return NextResponse.json({ error: "Shop name is required." }, { status: 400 });
    }
    if (!ownerName || !ownerName.trim()) {
      return NextResponse.json({ error: "Owner name is required." }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update Business name
      await tx.business.update({
        where: { id: session.businessId },
        data: { name: shopName.trim() },
      });

      // 2. Update Owner User name
      await tx.user.update({
        where: { id: session.userId },
        data: { name: ownerName.trim() },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Business setup API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
