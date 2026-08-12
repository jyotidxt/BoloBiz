import { NextResponse } from "next/server";
import { clearAuthSession } from "@/lib/auth";

export async function POST() {
  try {
    await clearAuthSession();
    return NextResponse.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during logout" },
      { status: 500 }
    );
  }
}
