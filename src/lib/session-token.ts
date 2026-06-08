import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import type { Role, SessionPayload } from "@/types/auth";

export const SESSION_COOKIE = "saltus_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET が未設定、または短すぎます。");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const userId = payload.userId;
    const role = payload.role;
    if (typeof userId !== "string" || typeof role !== "string") {
      return null;
    }
    if (!["ADMIN", "MANAGER", "MEMBER"].includes(role)) {
      return null;
    }
    return { userId, role: role as Role };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
