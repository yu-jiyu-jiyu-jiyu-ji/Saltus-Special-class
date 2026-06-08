import type { Prisma } from "@/generated/prisma/client";
import type { Role, SessionUser } from "@/types/auth";
import { parseHomeworkItems } from "@/types/meeting";

export function canViewAllMeetings(role: Role): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

export function canAccessMeeting(
  user: SessionUser,
  meeting: { userId: string },
): boolean {
  return canViewAllMeetings(user.role) || meeting.userId === user.id;
}

export function canEditMeeting(
  user: SessionUser,
  meeting: { userId: string },
): boolean {
  return canViewAllMeetings(user.role) || meeting.userId === user.id;
}

export type MeetingListFilters = {
  q?: string;
  date?: string;
  memberId?: string;
};

export function buildMeetingListWhere(
  user: SessionUser,
  filters: MeetingListFilters = {},
): Prisma.MeetingWhereInput {
  const where: Prisma.MeetingWhereInput = {};

  if (!canViewAllMeetings(user.role)) {
    where.userId = user.id;
  } else if (filters.memberId) {
    where.userId = filters.memberId;
  }

  if (filters.date) {
    const parsed = new Date(`${filters.date}T00:00:00.000Z`);
    if (!Number.isNaN(parsed.getTime())) {
      const next = new Date(parsed);
      next.setUTCDate(next.getUTCDate() + 1);
      where.date = {
        gte: parsed,
        lt: next,
      };
    }
  }

  const keyword = filters.q?.trim();
  if (keyword) {
    where.OR = [
      { content: { contains: keyword, mode: "insensitive" } },
      { user: { name: { contains: keyword, mode: "insensitive" } } },
    ];
  }

  return where;
}

export function excerptContent(content: string, maxLength = 120): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength)}…`;
}

export function getMeetingCardTitle(content: string): string {
  const excerpt = excerptContent(content, 60);
  return excerpt || "MTG議事録";
}

export function formatMeetingDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

export function formatMeetingDateShort(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function serializeHomework(value: unknown) {
  return parseHomeworkItems(value);
}
