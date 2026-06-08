import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/session";
import type { SessionUser } from "@/types/auth";

export async function requireApiUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }
  return user;
}

export function isApiError(
  result: SessionUser | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
