"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_DOC_NAV } from "@/lib/admin-doc-nav";

export function AdminSpecNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {ADMIN_DOC_NAV.map((item) => {
        const active =
          item.href === "/dashboard/admin/spec"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={[
              "rounded-xl px-4 py-2 text-sm font-semibold transition",
              active
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
            ].join(" ")}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
