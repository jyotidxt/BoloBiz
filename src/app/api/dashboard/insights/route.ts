import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { getBusinessAnalyticsAndInsights } from "@/lib/services/analytics";

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = session;
    
    // Compute analytics and proactive insights deterministically
    const data = await getBusinessAnalyticsAndInsights(businessId);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Dashboard insights retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dashboard insights" },
      { status: 500 }
    );
  }
}
