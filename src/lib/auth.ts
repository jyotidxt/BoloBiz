import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-bolobiz-local-dev-12345";

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

export function signToken(session: AuthSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch (error) {
    return null;
  }
}

// In Next.js 15, cookies() is asynchronous. We should await it.
export async function getAuthSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await import("next/headers").then((mod) => mod.cookies());
    const token = cookieStore.get("bolobiz_token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (e) {
    return null;
  }
}

export async function clearAuthSession() {
  const cookieStore = await import("next/headers").then((mod) => mod.cookies());
  cookieStore.set("bolobiz_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
}

export async function setAuthSession(session: AuthSession) {
  const token = signToken(session);
  const cookieStore = await import("next/headers").then((mod) => mod.cookies());
  cookieStore.set("bolobiz_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}
