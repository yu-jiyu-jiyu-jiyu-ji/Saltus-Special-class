import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { buildMeetingListWhere, normalizeMeetingTitle } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { meetingCreateSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const { searchParams } = new URL(request.url);
  const where = buildMeetingListWhere(userOrError, {
    q: searchParams.get("q") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    memberId: searchParams.get("memberId") ?? undefined,
  });

  const meetings = await prisma.meeting.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return NextResponse.json({ meetings });
}

export async function POST(request: Request) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  try {
    const body = await request.json();
    const parsed = meetingCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const { date, title, content, homework } = parsed.data;
    const meeting = await prisma.meeting.create({
      data: {
        date: new Date(`${date}T00:00:00.000Z`),
        title: normalizeMeetingTitle(title),
        content,
        homework: homework ?? [],
        userId: userOrError.id,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    console.error("[meetings/POST]", error);
    return NextResponse.json(
      { error: "MTGの保存中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
