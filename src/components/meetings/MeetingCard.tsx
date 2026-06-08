import Link from "next/link";

import {
  excerptContent,
  formatMeetingDateShort,
  getMeetingCardTitle,
} from "@/lib/meetings";

export type MeetingCardData = {
  id: string;
  date: Date;
  content: string;
  user: {
    id: string;
    name: string;
  };
};

type MeetingCardProps = {
  meeting: MeetingCardData;
  showAuthor?: boolean;
};

export function MeetingCard({ meeting, showAuthor = false }: MeetingCardProps) {
  return (
    <Link
      href={`/dashboard/mtg/${meeting.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <time className="text-sm text-slate-500">{formatMeetingDateShort(meeting.date)}</time>
        {showAuthor ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {meeting.user.name}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 line-clamp-2 text-base font-medium leading-7 text-slate-900 group-hover:text-sky-800">
        {getMeetingCardTitle(meeting.content)}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
        {excerptContent(meeting.content, 100)}
      </p>

      <p className="mt-4 text-sm font-medium text-sky-700 group-hover:text-sky-800">
        詳細を見る →
      </p>
    </Link>
  );
}
