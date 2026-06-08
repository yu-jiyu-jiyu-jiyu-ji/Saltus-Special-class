import Link from "next/link";

import { MeetingCard } from "@/components/meetings/MeetingCard";
import { MeetingSearchForm } from "@/components/meetings/MeetingSearchForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { buildMeetingListWhere, canViewAllMeetings } from "@/lib/meetings";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

type MtgListPageProps = {
  searchParams: Promise<{ q?: string; date?: string; memberId?: string }>;
};

export default async function MtgListPage({ searchParams }: MtgListPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const date = params.date?.trim() ?? "";
  const memberId = params.memberId?.trim() ?? "";

  const showAuthor = canViewAllMeetings(user!.role);
  const where = buildMeetingListWhere(user!, { q, date, memberId });

  const [meetings, members] = await Promise.all([
    prisma.meeting.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    }),
    showAuthor
      ? prisma.user.findMany({
          where: { role: "MEMBER" },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="MTG議事録"
          description={
            showAuthor
              ? "全メンバーの MTG 記録を一覧・検索できます。投稿メンバーで絞り込みも可能です。"
              : "あなたが投稿した MTG 記録のみ表示されます。"
          }
        />
        <Link
          href="/dashboard/mtg/new"
          className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          ＋ 新規投稿
        </Link>
      </div>

      <MeetingSearchForm
        defaultQuery={q}
        defaultDate={date}
        defaultMemberId={memberId}
        members={members}
      />

      {meetings.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm leading-7 text-slate-600">
            {q || date || memberId
              ? "条件に一致する MTG 記録は見つかりませんでした。"
              : "まだ MTG 記録がありません。最初の記録を投稿してみましょう。"}
          </p>
          <Link
            href="/dashboard/mtg/new"
            className="mt-4 inline-flex text-sm font-medium text-sky-700 hover:text-sky-800"
          >
            MTGを投稿する →
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} showAuthor={showAuthor} />
          ))}
        </div>
      )}
    </div>
  );
}
