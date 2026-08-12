import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { businessId: session.businessId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Fetch products error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve inventory products" },
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

    const { name, sku, price, costPrice, stockQuantity, lowStockThreshold } = await request.json();
    if (!name || price === undefined) {
      return NextResponse.json({ error: "Product name and price are required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku: sku || null,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : 0.0,
        stockQuantity: stockQuantity ? parseFloat(stockQuantity) : 0.0,
        lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : 5.0,
        businessId: session.businessId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
