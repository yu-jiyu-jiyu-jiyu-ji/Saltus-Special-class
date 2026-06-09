import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import {
  canAccessMeeting,
  canDeleteMeeting,
  canEditMeeting,
  normalizeMeetingTitle,
} from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { meetingHomeworkSchema, meetingUpdateSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getActiveMeeting(id: string) {
  return prisma.meeting.findFirst({
    where: { id, deletedAt: null },
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
}

export async function GET(_request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;
  const meeting = await getActiveMeeting(id);

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

  const meeting = await prisma.meeting.findFirst({
    where: { id, deletedAt: null },
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
      body.content === undefined &&
      body.title === undefined;

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
      title?: string | null;
      content?: string;
      homework?: typeof data.homework;
    } = {};

    if ("date" in data && data.date) {
      updateData.date = new Date(`${data.date}T00:00:00.000Z`);
    }
    if ("title" in data && data.title !== undefined) {
      updateData.title = normalizeMeetingTitle(data.title);
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

export async function DELETE(_request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  const { id } = await context.params;

  const meeting = await prisma.meeting.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, userId: true },
  });

  if (!meeting) {
    return NextResponse.json({ error: "MTGが見つかりません。" }, { status: 404 });
  }

  if (!canDeleteMeeting(userOrError, meeting)) {
    return NextResponse.json(
      { error: "このMTGを削除する権限がありません。" },
      { status: 403 },
    );
  }

  try {
    const deleted = await prisma.meeting.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ meeting: deleted });
  } catch (error) {
    console.error("[meetings/DELETE]", error);
    return NextResponse.json(
      { error: "議事録の削除中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
