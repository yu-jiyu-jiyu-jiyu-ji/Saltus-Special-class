import { randomBytes } from "crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { passwordResetRequestSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = passwordResetRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // ユーザー存在有無を漏らさない
    if (user) {
      const resetToken = randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 1000 * 60 * 60);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpires },
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/password-reset?token=${resetToken}`;

      if (process.env.NODE_ENV === "development") {
        console.info("[password-reset] reset URL:", resetUrl);
      }
    }

    return NextResponse.json({
      message:
        "入力されたメールアドレス宛に再設定手順を送信しました（開発環境ではサーバーログを確認してください）。",
    });
  } catch (error) {
    console.error("[auth/password-reset]", error);
    return NextResponse.json(
      { error: "パスワード再設定の処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
