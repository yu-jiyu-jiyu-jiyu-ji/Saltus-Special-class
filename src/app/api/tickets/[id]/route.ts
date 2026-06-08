import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { canAccessTicket } from "@/lib/tickets";
import { prisma } from "@/lib/prisma";
import { ticketStatusSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, name: true, role: true },
          },
        },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "問い合わせが見つかりません。" }, { status: 404 });
  }

  if (!canAccessTicket(userOrError, ticket)) {
    return NextResponse.json(
      { error: "この問い合わせを閲覧する権限がありません。" },
      { status: 403 },
    );
  }

  return NextResponse.json({ ticket });
}

export async function PATCH(request: Request, context: RouteContext) {
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
      { error: "この問い合わせを操作する権限がありません。" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = ticketStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ステータスが不正です。" },
        { status: 400 },
      );
    }

    const { status } = parsed.data;
    const isAdmin = userOrError.role === "ADMIN";
    const isOwner = ticket.userId === userOrError.id;

    if (isAdmin) {
      // ADMIN は任意のステータスに変更可能
    } else if (isOwner && status === "CANCELLED") {
      // 起票者は取り下げのみ可能
    } else {
      return NextResponse.json(
        { error: "ステータスを変更する権限がありません。" },
        { status: 403 },
      );
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error("[tickets/PATCH]", error);
    return NextResponse.json(
      { error: "ステータスの更新中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
