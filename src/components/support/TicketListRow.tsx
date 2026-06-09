import Link from "next/link";

import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import {
  TICKET_TYPE_LABELS,
  excerptText,
  formatTicketDate,
  getTicketTitle,
} from "@/lib/tickets";
import type { TicketStatus, TicketType } from "@/generated/prisma/client";

export type TicketListItem = {
  id: string;
  createdAt: Date;
  title?: string | null;
  type: TicketType;
  status: TicketStatus;
  systemField1?: string | null;
  systemField2?: string | null;
  usageField1?: string | null;
  usageField2?: string | null;
  user: { id: string; name: string };
  _count?: { comments: number };
};

type TicketListRowProps = {
  ticket: TicketListItem;
  showAuthor?: boolean;
};

export function TicketListRow({ ticket, showAuthor = false }: TicketListRowProps) {
  const title = getTicketTitle(ticket);
  const preview =
    ticket.type === "SYSTEM"
      ? excerptText(ticket.systemField2 ?? "")
      : excerptText(ticket.usageField2 ?? "");

  return (
    <Link
      href={`/dashboard/support/${ticket.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            {TICKET_TYPE_LABELS[ticket.type]}
          </span>
          <TicketStatusBadge status={ticket.status} />
        </div>
        <p className="text-xs text-slate-400">{formatTicketDate(ticket.createdAt)}</p>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900 group-hover:text-sky-800">
        {title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{preview}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        {showAuthor ? <span>起票者: {ticket.user.name}</span> : <span />}
        <span>
          {ticket._count?.comments ?? 0} 件の返信 · 詳細を見る →
        </span>
      </div>
    </Link>
  );
}
