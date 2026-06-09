import type { Metadata } from "next";

import { GuideMarkdown } from "@/components/guide/GuideMarkdown";
import { GuideToc } from "@/components/guide/GuideToc";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  extractGuideSections,
  filterGuideContentForRole,
  loadMemberGuideMarkdown,
} from "@/lib/help-docs";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "使い方ガイド | Saltus 特進クラス",
};

export default async function GuidePage() {
  const user = await getSessionUser();
  const rawContent = await loadMemberGuideMarkdown();
  const content = filterGuideContentForRole(rawContent, user!.role);
  const sections = extractGuideSections(content);

  return (
    <div className="space-y-6">
      <PageHeader
        title="使い方ガイド"
        description="Saltus 特進プラットフォームの操作手順です。画像付きで各機能の使い方を確認できます。"
      />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 lg:w-64">
          <GuideToc sections={sections} />
        </aside>

        <article className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <GuideMarkdown content={content} />
        </article>
      </div>
    </div>
  );
}
