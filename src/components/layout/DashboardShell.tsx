"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Sidebar } from "@/components/layout/Sidebar";
import { SupportFab } from "@/components/support/SupportFab";
import type { SessionUser } from "@/types/auth";

type DashboardShellProps = {
  user: SessionUser;
  children: React.ReactNode;
};

export function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden w-[280px] shrink-0 border-r border-slate-200 lg:block">
          <div className="fixed inset-y-0 w-[280px]">
            <Sidebar user={user} />
          </div>
        </div>

        {/* Mobile overlay */}
        {mobileOpen ? (
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        {/* Mobile sidebar */}
        <div
          className={[
            "fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <Sidebar user={user} onNavigate={() => setMobileOpen(false)} />
        </div>

        {/* Main area */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
                  aria-label="メニューを開く"
                  onClick={() => setMobileOpen(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    個別MTG知見ストック＆サポート管理
                  </p>
                  <p className="truncate text-xs text-slate-500">Saltus 特進コミュニティ</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {loggingOut ? "ログアウト中..." : "ログアウト"}
              </button>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-24">{children}</main>
        </div>
      </div>

      <SupportFab />
    </div>
  );
}
