import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { ROLE_LABELS } from "@/lib/navigation";
import { getSessionUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await getSessionUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`ようこそ、${user?.name ?? "ゲスト"} さん`}
        description="個別MTGの知見を蓄積し、サポート対応を管理するためのホーム画面です。"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            現在の権限
          </p>
          <p className="mt-3 text-xl font-bold text-slate-900">
            {user ? ROLE_LABELS[user.role] : "-"}
          </p>
          <p className="mt-2 text-sm text-slate-500">{user?.email}</p>
        </div>

        <Link
          href="/dashboard/mtg"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            MTG議事録
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            MTG 内容の投稿・一覧・詳細閲覧
          </p>
          <p className="mt-4 text-sm font-medium text-sky-700 group-hover:text-sky-800">
            画面を見る →
          </p>
        </Link>

        <Link
          href="/dashboard/support"
          className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            問い合わせ一覧
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            サポートデスクへの起票・スレッド返信
          </p>
          <p className="mt-4 text-sm font-medium text-sky-700 group-hover:text-sky-800">
            画面を見る →
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">はじめに</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
          <li>・左のサイドバーから各機能へ移動できます。</li>
          <li>・新規登録時の権限は「メンバー」です。</li>
          <li>・マネージャー・管理者権限はシステム管理者が付与します。</li>
        </ul>
      </section>
    </div>
  );
}
