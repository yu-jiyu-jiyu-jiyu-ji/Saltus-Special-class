import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userOrError.id },
    });

    if (!user) {
      return NextResponse.json({ error: "ユーザーが見つかりません。" }, { status: 404 });
    }

    const valid = await compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "現在のパスワードが正しくありません。" },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hash(parsed.data.password, 12),
      },
    });

    return NextResponse.json({ message: "パスワードを変更しました。" });
  } catch (error) {
    console.error("[auth/change-password]", error);
    return NextResponse.json(
      { error: "パスワード変更中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
