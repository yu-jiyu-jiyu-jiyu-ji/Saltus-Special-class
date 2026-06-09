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

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">はじめに</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
          <li>・左のサイドバーから各機能へ移動できます。</li>
          <li>
            ・使い方がわからない場合は
            <Link
              href="/dashboard/guide"
              className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800"
            >
              使い方
            </Link>
            をご覧ください。
          </li>
          <li>・新規登録時の権限は「メンバー」です。</li>
          <li>・マネージャー・管理者権限はシステム管理者が付与します。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">サーバーについて（Render 無料枠）</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
          <p>
            本システムはサーバーサービスの Render の無料枠（Free Web Service）を使って公開しています。
            そのため、使用時間が空くとスリープ状態となり、次回使用時にサーバー起動に少し時間を要します。
            詳細は
            <a
              href="https://render.com/docs/free"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-sky-700 underline underline-offset-2 hover:text-sky-800"
            >
              Render 公式ドキュメント
            </a>
            をご確認ください。
          </p>

          <div>
            <h3 className="font-semibold text-slate-900">■ スリープに入るタイミング</h3>
            <p className="mt-2">
              最後のアクセスから 15 分間、リクエストがないと停止（spin down）します。
            </p>
            <p className="mt-2">「アクセス」とは次のどちらかです。</p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>HTTP リクエスト（ページ表示、API 呼び出しなど）</li>
              <li>WebSocket の新規接続・メッセージ</li>
            </ul>
            <p className="mt-2">15 分間、誰もサイトを開かなければ自動で止まります。</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">■ 起動にかかる時間</h3>
            <p className="mt-2">
              次に誰かがアクセスしたとき、自動で起動（spin up）します。
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-amber-200/80 bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-amber-100/50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-2 font-semibold">項目</th>
                    <th className="px-4 py-2 font-semibold">目安</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-amber-100">
                    <td className="px-4 py-2 text-slate-700">公式の目安</td>
                    <td className="px-4 py-2 text-slate-700">約 1 分</td>
                  </tr>
                  <tr className="border-t border-amber-100">
                    <td className="px-4 py-2 text-slate-700">実際の体感</td>
                    <td className="px-4 py-2 text-slate-700">
                      30 秒〜90 秒程度（アプリの規模・ビルド次第）
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              起動中は Render のローディング画面が表示され、その後にアプリが開きます。
              Next.js のような構成では、初回アクセスが少し遅く感じることがあります。
            </p>
          </div>
        </div>
      </section>

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
    </div>
  );
}
