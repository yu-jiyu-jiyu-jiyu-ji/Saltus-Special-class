import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { MeetingDetailView } from "@/components/meetings/MeetingDetailView";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  canAccessMeeting,
  canDeleteMeeting,
  canEditMeeting,
  canViewAllMeetings,
  formatMeetingDate,
  getMeetingDisplayTitle,
} from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

type MtgDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: MtgDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const meeting = await prisma.meeting.findFirst({
    where: { id, deletedAt: null },
    select: { title: true },
  });

  return {
    title: meeting
      ? `${getMeetingDisplayTitle(meeting.title)} | MTG議事録`
      : "MTG議事録",
  };
}

export default async function MtgDetailPage({ params }: MtgDetailPageProps) {
  const user = await getSessionUser();
  const { id } = await params;

  const meeting = await prisma.meeting.findFirst({
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

  if (!meeting) {
    notFound();
  }

  if (!canAccessMeeting(user!, meeting)) {
    forbidden();
  }

  const showAuthor = canViewAllMeetings(user!.role);
  const canEdit = canEditMeeting(user!, meeting);
  const canDelete = canDeleteMeeting(user!, meeting);

  const serialized = {
    id: meeting.id,
    date: meeting.date.toISOString(),
    title: meeting.title,
    content: meeting.content,
    homework: meeting.homework,
    userId: meeting.userId,
    user: meeting.user,
    comments: meeting.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/dashboard/mtg"
          className="font-medium text-sky-700 hover:text-sky-800"
        >
          ← 一覧に戻る
        </Link>
      </div>

      <PageHeader
        title={getMeetingDisplayTitle(meeting.title)}
        description={formatMeetingDate(meeting.date)}
      />

      <MeetingDetailView
        key={`${meeting.id}-${meeting.comments.length}-${meeting.content.length}`}
        meeting={serialized}
        currentUser={user!}
        showAuthor={showAuthor}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
