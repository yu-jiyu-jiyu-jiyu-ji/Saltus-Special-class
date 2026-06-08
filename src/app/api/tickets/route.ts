import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { buildTicketListWhere } from "@/lib/tickets";
import { prisma } from "@/lib/prisma";
import { ticketCreateSchema } from "@/lib/validators";

export async function GET() {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const tickets = await prisma.ticket.findMany({
    where: buildTicketListWhere(userOrError),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  try {
    const body = await request.json();
    const parsed = ticketCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const ticket = await prisma.ticket.create({
      data:
        data.type === "SYSTEM"
          ? {
              type: "SYSTEM",
              status: "OPEN",
              systemField1: data.systemField1,
              systemField2: data.systemField2,
              systemField3: data.systemField3?.trim() || null,
              userId: userOrError.id,
            }
          : {
              type: "USAGE",
              status: "OPEN",
              usageField1: data.usageField1,
              usageField2: data.usageField2,
              userId: userOrError.id,
            },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("[tickets/POST]", error);
    return NextResponse.json(
      { error: "問い合わせの起票中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
