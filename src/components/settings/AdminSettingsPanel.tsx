import Link from "next/link";

import { DeletedMeetingsTable } from "@/components/admin/DeletedMeetingsTable";
import { UserRoleTable } from "@/components/admin/UserRoleTable";
import type { DeletedMeetingItem } from "@/components/admin/DeletedMeetingsTable";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "MEMBER";
  createdAt: string;
};

type AdminSettingsPanelProps = {
  users: AdminUser[];
  deletedMeetings: DeletedMeetingItem[];
  currentUserId: string;
};

export function AdminSettingsPanel({
  users,
  deletedMeetings,
  currentUserId,
}: AdminSettingsPanelProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <h2 className="text-lg font-semibold text-slate-900">管理設定</h2>
        <p className="mt-2 text-sm text-slate-600">
          登録ユーザーの一覧と権限を管理します。
        </p>

        <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm text-slate-700">
          システムの設計・DB・拡張ロードマップは
          <Link
            href="/dashboard/admin/spec"
            className="mx-1 font-semibold text-sky-800 underline underline-offset-2 hover:text-sky-900"
          >
            仕様書
          </Link>
          をご覧ください（管理者専用）。
        </div>

        <div className="mt-6">
          <UserRoleTable users={users} currentUserId={currentUserId} />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">削除済み MTG 議事録</h2>
          <p className="mt-1 text-sm text-slate-600">
            論理削除された議事録を復旧できます。
          </p>
        </div>
        <DeletedMeetingsTable meetings={deletedMeetings} />
      </section>
    </div>
  );
}
