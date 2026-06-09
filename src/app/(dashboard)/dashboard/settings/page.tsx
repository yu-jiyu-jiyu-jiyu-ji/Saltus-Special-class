import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { AdminSettingsPanel } from "@/components/settings/AdminSettingsPanel";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "設定 | Saltus 特進",
};

export default async function SettingsPage() {
  const user = await getSessionUser();
  const isAdmin = user?.role === "ADMIN";

  const [users, deletedMeetings] = isAdmin
    ? await Promise.all([
        prisma.user.findMany({
          orderBy: [{ role: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        }),
        prisma.meeting.findMany({
          where: { deletedAt: { not: null } },
          orderBy: { deletedAt: "desc" },
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        }),
      ])
    : [null, null];

  const serializedUsers =
    users?.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
    })) ?? [];

  const serializedDeletedMeetings =
    deletedMeetings?.map((meeting) => ({
      id: meeting.id,
      date: meeting.date.toISOString(),
      title: meeting.title,
      deletedAt: meeting.deletedAt!.toISOString(),
      user: meeting.user,
    })) ?? [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="設定"
        description={
          isAdmin
            ? "アカウント設定の変更と、システム管理を行えます。"
            : "アカウント設定を変更できます。"
        }
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">パスワード変更</h2>
        <ChangePasswordForm />
      </section>

      {isAdmin && user ? (
        <AdminSettingsPanel
          users={serializedUsers}
          deletedMeetings={serializedDeletedMeetings}
          currentUserId={user.id}
        />
      ) : null}
    </div>
  );
}
