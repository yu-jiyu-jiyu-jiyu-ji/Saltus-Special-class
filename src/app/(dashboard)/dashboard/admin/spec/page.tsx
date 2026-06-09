import type { Metadata } from "next";

import { GuideMarkdown } from "@/components/guide/GuideMarkdown";
import { GuideToc } from "@/components/guide/GuideToc";
import { PageHeader } from "@/components/layout/PageHeader";
import { extractAdminDocSections, loadAdminDoc } from "@/lib/admin-docs";

export const metadata: Metadata = {
  title: "現行仕様・設計 | 仕様書 | Saltus 特進クラス",
};

export default async function AdminCurrentSpecPage() {
  const content = await loadAdminDoc("current-spec");
  const sections = extractAdminDocSections(content);

  return (
    <>
      <PageHeader
        title="システム仕様書"
        description="現行の設計・DB構成・画面構成・API・権限をまとめた管理者向けドキュメントです。"
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-64">
          <GuideToc sections={sections} />
        </aside>

        <article className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <GuideMarkdown content={content} />
        </article>
      </div>
    </>
  );
}
