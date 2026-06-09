import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <aside className="relative hidden min-h-screen overflow-hidden lg:block">
          <Image
            src="/auth/tiger.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/75 via-slate-900/55 to-slate-800/65" />

          <div className="relative z-10 flex min-h-screen flex-col justify-end p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                Saltus Platform
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-white drop-shadow-sm">
                個別MTG知見ストック
                <br />
                ＆サポート管理
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-200 drop-shadow-sm">
                特進クラスの MTG 記録とサポート対応を一元管理するためのベースプラットフォームです。
              </p>
            </div>
          </div>
        </aside>

        <div className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
