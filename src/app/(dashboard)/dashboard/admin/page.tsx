import Link from "next/link";
import { redirect } from "next/navigation";

import { DeletedMeetingsTable } from "@/components/admin/DeletedMeetingsTable";
import { UserRoleTable } from "@/components/admin/UserRoleTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function AdminPage() {
  const user = await getSessionUser();

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [users, deletedMeetings] = await Promise.all([
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
  ]);

  const serialized = users.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  }));

  const serializedDeletedMeetings = deletedMeetings.map((meeting) => ({
    id: meeting.id,
    date: meeting.date.toISOString(),
    title: meeting.title,
    deletedAt: meeting.deletedAt!.toISOString(),
    user: meeting.user,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="管理設定"
        description="登録ユーザーの一覧と権限を管理します。"
      />

      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm text-slate-700">
        システムの設計・DB・拡張ロードマップは
        <Link
          href="/dashboard/admin/spec"
          className="mx-1 font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-900"
        >
          仕様書
        </Link>
        をご覧ください（管理者専用）。
      </div>

      <UserRoleTable users={serialized} currentUserId={user.id} />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">削除済み MTG 議事録</h2>
          <p className="mt-1 text-sm text-slate-600">
            論理削除された議事録を復旧できます。
          </p>
        </div>
        <DeletedMeetingsTable meetings={serializedDeletedMeetings} />
      </div>
    </div>
  );
}
