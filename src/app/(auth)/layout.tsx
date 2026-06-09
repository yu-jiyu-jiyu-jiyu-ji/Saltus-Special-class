export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Saltus Platform
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-white">
              個別MTG知見ストック
              <br />
              ＆サポート管理
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              特進クラスの MTG 記録とサポート対応を一元管理するためのベースプラットフォームです。
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm font-medium text-white">クリーンで使いやすい UI</p>
            <p className="mt-2 text-xs leading-6 text-slate-300">
              左ナビゲーションとメインコンテンツで、日々の業務をスムーズに進められます。
            </p>
          </div>
        </aside>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
