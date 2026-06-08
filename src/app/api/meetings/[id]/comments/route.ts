import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { canAccessMeeting } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { meetingCommentSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
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

  if (!canAccessMeeting(userOrError, meeting)) {
    return NextResponse.json(
      { error: "このMTGにコメントする権限がありません。" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const parsed = meetingCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" },
        { status: 400 },
      );
    }

    const comment = await prisma.meetingComment.create({
      data: {
        content: parsed.data.content,
        meetingId: id,
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
    console.error("[meetings/comments/POST]", error);
    return NextResponse.json(
      { error: "コメントの投稿中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
