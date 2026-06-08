import { NextResponse } from "next/server";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません。" },
        { status: 401 },
      );
    }

    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "メールアドレスまたはパスワードが正しくありません。" },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json(
      { error: "ログイン処理中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
