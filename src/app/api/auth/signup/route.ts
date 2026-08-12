import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setAuthSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password, businessName } = await request.json();

    if (!name || !email || !password || !businessName) {
      return NextResponse.json(
        { error: "All fields are required (name, email, password, businessName)" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create Business and User inside a database transaction to ensure integrity
    const result = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName,
          currency: "INR",
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: hashedPassword,
          role: "OWNER",
          businessId: business.id,
        },
      });

      return { user, business };
    });

    // Create and save session in cookie
    await setAuthSession({
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      businessId: result.business.id,
    });

    return NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        },
        business: {
          id: result.business.id,
          name: result.business.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}
