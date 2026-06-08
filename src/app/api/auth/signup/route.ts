import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています。" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "MEMBER",
      },
    });

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
    });
    await setSessionCookie(token);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[auth/signup]", error);
    return NextResponse.json(
      { error: "アカウント作成中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
