import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Protect all dashboard & onboarding routes
  if (!userId && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/onboarding"))) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[^?]*$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
