"use client";

import { useState } from "react";

export function ServerInfoPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            サーバーについて（Render 無料枠）
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            初回アクセスが遅い場合などにご確認ください
          </p>
        </div>
        <span className="shrink-0 text-sm text-slate-400">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-slate-100 px-6 pb-6 pt-5 text-sm leading-7 text-slate-600">
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
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-2 font-semibold">項目</th>
                    <th className="px-4 py-2 font-semibold">目安</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">公式の目安</td>
                    <td className="px-4 py-2 text-slate-700">約 1 分</td>
                  </tr>
                  <tr className="border-t border-slate-100">
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
      ) : null}
    </section>
  );
}
