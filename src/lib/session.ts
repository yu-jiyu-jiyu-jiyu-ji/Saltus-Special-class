import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  verifySessionToken,
} from "@/lib/session-token";
import type { SessionUser } from "@/types/auth";

export {
  clearSessionCookie,
  createSessionToken,
  SESSION_COOKIE,
  setSessionCookie,
  verifySessionToken,
} from "@/lib/session-token";

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) {
    return null;
  }

  return user;
}
