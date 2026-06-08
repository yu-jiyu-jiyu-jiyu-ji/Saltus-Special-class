import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { canAccessMeeting, canEditMeeting } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { meetingHomeworkSchema, meetingUpdateSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
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

  if (!meeting) {
    return NextResponse.json({ error: "MTGが見つかりません。" }, { status: 404 });
  }

  if (!canAccessMeeting(userOrError, meeting)) {
    return NextResponse.json(
      { error: "このMTGを閲覧する権限がありません。" },
      { status: 403 },
    );
  }

  return NextResponse.json({ meeting });
}

export async function PATCH(request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;

  const meeting = await prisma.meeting.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "MTGが見つかりません。" }, { status: 404 });
  }

  if (!canEditMeeting(userOrError, meeting)) {
    return NextResponse.json(
      { error: "このMTGを編集する権限がありません。" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();

    const homeworkOnly =
      body.homework !== undefined &&
      body.date === undefined &&
      body.content === undefined;

    const parsed = homeworkOnly
      ? meetingHomeworkSchema.safeParse(body)
      : meetingUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const updateData: {
      date?: Date;
      content?: string;
      homework?: typeof data.homework;
    } = {};

    if ("date" in data && data.date) {
      updateData.date = new Date(`${data.date}T00:00:00.000Z`);
    }
    if ("content" in data && data.content) {
      updateData.content = data.content;
    }
    if (data.homework !== undefined) {
      updateData.homework = data.homework;
    }

    const updated = await prisma.meeting.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ meeting: updated });
  } catch (error) {
    console.error("[meetings/PATCH]", error);
    return NextResponse.json(
      { error: "議事録の更新中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
