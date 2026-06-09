import { NextResponse } from "next/server";

import { isApiError, requireApiUser } from "@/lib/api-auth";
import { canRestoreMeeting } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const userOrError = await requireApiUser();
  if (isApiError(userOrError)) {
    return userOrError;
  }

  if (!canRestoreMeeting(userOrError)) {
    return NextResponse.json(
      { error: "MTGを復旧する権限がありません。" },
      { status: 403 },
    );
  }

  const { id } = await context.params;

  const meeting = await prisma.meeting.findFirst({
    where: { id, deletedAt: { not: null } },
    select: { id: true },
  });

  if (!meeting) {
    return NextResponse.json(
      { error: "復旧対象のMTGが見つかりません。" },
      { status: 404 },
    );
  }

  try {
    const restored = await prisma.meeting.update({
      where: { id },
      data: { deletedAt: null },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ meeting: restored });
  } catch (error) {
    console.error("[meetings/restore/POST]", error);
    return NextResponse.json(
      { error: "議事録の復旧中にエラーが発生しました。" },
      { status: 500 },
    );
  }
}
