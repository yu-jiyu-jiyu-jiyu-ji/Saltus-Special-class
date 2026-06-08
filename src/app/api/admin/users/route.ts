import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  if (userOrError.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}
