import type { Prisma, TicketStatus, TicketType } from "@/generated/prisma/client";
import type { Role, SessionUser } from "@/types/auth";

export const TICKET_TYPE_LABELS: Record<TicketType, string> = {
  SYSTEM: "システムへの問い合わせ",
  USAGE: "使い方の問い合わせ",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "起票",
  PENDING: "対応中",
  RESOLVED: "完了",
  CANCELLED: "取り下げ",
};

export const TICKET_STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-sky-100 text-sky-800 ring-sky-200",
  PENDING: "bg-amber-100 text-amber-800 ring-amber-200",
  RESOLVED: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function canViewAllTickets(role: Role): boolean {
  return role === "ADMIN";
}

export function canAccessTicket(
  user: SessionUser,
  ticket: { userId: string },
): boolean {
  return canViewAllTickets(user.role) || ticket.userId === user.id;
}

export function canManageTicketStatus(user: SessionUser, ticket: { userId: string }): boolean {
  return user.role === "ADMIN";
}

export function canCancelTicket(user: SessionUser, ticket: { userId: string }): boolean {
  return ticket.userId === user.id;
}

export type TicketListFilters = {
  q?: string;
  status?: string;
  date?: string;
  type?: string;
};

const TICKET_STATUSES: TicketStatus[] = ["OPEN", "PENDING", "RESOLVED", "CANCELLED"];
const TICKET_TYPES: TicketType[] = ["SYSTEM", "USAGE"];

export function buildTicketListWhere(
  user: SessionUser,
  filters: TicketListFilters = {},
): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = {};

  if (!canViewAllTickets(user.role)) {
    where.userId = user.id;
  }

  const status = filters.status?.trim();
  if (status && TICKET_STATUSES.includes(status as TicketStatus)) {
    where.status = status as TicketStatus;
  }

  const type = filters.type?.trim();
  if (type && TICKET_TYPES.includes(type as TicketType)) {
    where.type = type as TicketType;
  }

  if (filters.date) {
    const parsed = new Date(`${filters.date}T00:00:00+09:00`);
    if (!Number.isNaN(parsed.getTime())) {
      const next = new Date(parsed);
      next.setDate(next.getDate() + 1);
      where.createdAt = {
        gte: parsed,
        lt: next,
      };
    }
  }

  const keyword = filters.q?.trim();
  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { systemField1: { contains: keyword, mode: "insensitive" } },
      { systemField2: { contains: keyword, mode: "insensitive" } },
      { systemField3: { contains: keyword, mode: "insensitive" } },
      { usageField1: { contains: keyword, mode: "insensitive" } },
      { usageField2: { contains: keyword, mode: "insensitive" } },
      { user: { name: { contains: keyword, mode: "insensitive" } } },
    ];
  }

  return where;
}

export function getTicketTitle(ticket: {
  title?: string | null;
  type: TicketType;
  systemField1?: string | null;
  usageField1?: string | null;
  usageField2?: string | null;
}): string {
  const explicitTitle = ticket.title?.trim();
  if (explicitTitle) {
    return explicitTitle;
  }

  if (ticket.type === "SYSTEM") {
    return ticket.systemField1?.trim() || "システムへの問い合わせ";
  }
  const screen = ticket.usageField1?.trim();
  const content = ticket.usageField2?.trim();
  if (screen && content) {
    return `${screen} — ${excerptText(content, 40)}`;
  }
  return screen || content || "使い方の問い合わせ";
}

export function excerptText(text: string, maxLength = 80): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength)}…`;
}

export function formatTicketDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(date);
}
