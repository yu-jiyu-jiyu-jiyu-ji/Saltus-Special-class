import type { Metadata } from "next";
import Link from "next/link";
import { forbidden, notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/PageHeader";
import { TicketThread } from "@/components/support/TicketThread";
import { canAccessTicket, getTicketTitle } from "@/lib/tickets";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

type SupportDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: SupportDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: {
      title: true,
      type: true,
      systemField1: true,
      usageField1: true,
      usageField2: true,
    },
  });

  return {
    title: ticket ? `${getTicketTitle(ticket)} | 問い合わせ` : "問い合わせ詳細",
  };
}

export default async function SupportDetailPage({ params }: SupportDetailPageProps) {
  const user = await getSessionUser();
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
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

  if (!ticket) {
    notFound();
  }

  if (!canAccessTicket(user!, ticket)) {
    forbidden();
  }

  const serialized = {
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
    comments: ticket.comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/dashboard/support"
          className="font-medium text-sky-700 hover:text-sky-800"
        >
          ← 一覧に戻る
        </Link>
      </div>

      <PageHeader
        title="問い合わせスレッド"
        description="管理者とのやり取りを確認し、返信できます。"
      />

      <TicketThread ticket={serialized} currentUser={user!} />
    </div>
  );
}
