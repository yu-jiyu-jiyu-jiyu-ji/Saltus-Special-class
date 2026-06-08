import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { canAccessTicket } from "@/lib/tickets";
import { prisma } from "@/lib/prisma";
import { ticketCommentSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { id: true, userId: true, status: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: "問い合わせが見つかりません。" }, { status: 404 });
  }

  if (!canAccessTicket(userOrError, ticket)) {
    return NextResponse.json(
      { error: "この問い合わせに返信する権限がありません。" },
      { status: 403 },
    );
  }

  if (ticket.status === "CANCELLED" || ticket.status === "RESOLVED") {
    return NextResponse.json(
      { error: "完了または取り下げ済みの問い合わせには返信できません。" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();
    const parsed = ticketCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        ticketId: id,
        userId: userOrError.id,
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("[tickets/comments/POST]", error);
    return NextResponse.json(
      { error: "コメントの投稿中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
