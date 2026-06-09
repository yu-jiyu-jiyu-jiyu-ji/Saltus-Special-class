"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, ROLE_LABELS } from "@/lib/navigation";
import type { SessionUser } from "@/types/auth";

type SidebarProps = {
  user: SessionUser;
  onNavigate?: () => void;
};

export function Sidebar({ user, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user.role),
  );

  const activeHref =
    visibleItems
      .filter(
        (item) =>
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`)) ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href)),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;

  return (
    <aside className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
            S
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">特進の記録</p>
            <p className="text-xs text-slate-500">Saltus Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          メニュー
        </p>
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const active = item.href === activeHref;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg text-base",
                    active ? "bg-white/10" : "bg-slate-100",
                  ].join(" ")}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
          <span className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
            {ROLE_LABELS[user.role]}
          </span>
        </div>
      </div>
    </aside>
  );
}
