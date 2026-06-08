import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { userRoleUpdateSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  if (userOrError.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません。" }, { status: 403 });
  }

  const { id } = await context.params;

  if (id === userOrError.id) {
    return NextResponse.json(
      { error: "自分自身の権限はこの画面から変更できません。" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const parsed = userRoleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "権限が不正です。" },
        { status: 400 },
      );
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "ユーザーが見つかりません。" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[admin/users/PATCH]", error);
    return NextResponse.json(
      { error: "権限の更新中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
