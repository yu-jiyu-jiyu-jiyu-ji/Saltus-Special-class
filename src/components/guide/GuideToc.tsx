"use client";

import { useState } from "react";

import type { GuideSection } from "@/lib/help-docs";

type GuideTocProps = {
  sections: GuideSection[];
};

export function GuideToc({ sections }: GuideTocProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        目次
        <span>{open ? "▲" : "▼"}</span>
      </button>

      <nav
        className={[
          "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-28",
          open ? "block" : "hidden lg:block",
        ].join(" ")}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          目次
        </p>
        <ol className="space-y-1">
          {sections.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-sky-800"
              >
                {index + 1}. {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
