import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { passwordResetConfirmSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = passwordResetConfirmSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const { token, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "リセットリンクが無効、または有効期限が切れています。" },
        { status: 400 },
      );
    }

    const passwordHash = await hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return NextResponse.json({
      message: "パスワードを更新しました。新しいパスワードでログインしてください。",
    });
  } catch (error) {
    console.error("[auth/password-reset/confirm]", error);
    return NextResponse.json(
      { error: "パスワード更新中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
