import bcrypt from "bcryptjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./db";

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  businessId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Map Clerk session context to BoloBiz database models
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return null;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Search for matching database record
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { business: true },
    });

    // 2. Auto-provision user & business on first sign-in
    if (!user) {
      const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "BoloBiz Merchant";
      const businessName = `${clerkUser.firstName || "My"}'s Kirana Store`;

      user = await prisma.$transaction(async (tx) => {
        const business = await tx.business.create({
          data: {
            name: businessName,
            currency: "INR",
          },
        });

        return await tx.user.create({
          data: {
            id: clerkUserId, // Use Clerk's ID to keep records uniquely identified
            email: normalizedEmail,
            name,
            passwordHash: "clerk-authenticated", // Passwords handled by Clerk
            role: "OWNER",
            businessId: business.id,
            emailVerified: true,
          },
          include: { business: true },
        });
      });
      console.log(`🎉 Auto-provisioned user "${name}" and business "${businessName}" successfully.`);
    }

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId: user.businessId,
    };
  } catch (error) {
    console.error("Error in getAuthSession with Clerk:", error);
    return null;
  }
}

// Deprecated custom session handlers - converted to safely importable no-ops to prevent compilation breaks
export async function clearAuthSession() {
  // Clerk manages cookie clearing on client via SignOut triggers
  return;
}

export async function setAuthSession(session: AuthSession) {
  // Clerk manages session generation internally
  return;
}
