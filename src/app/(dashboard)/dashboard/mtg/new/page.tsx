import type { Metadata } from "next";

import { MeetingForm } from "@/components/meetings/MeetingForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "MTG投稿 | Saltus 特進",
};

export default function MtgNewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="MTG投稿"
        description="MTG実施日・会話内容・宿題事項を記録します。"
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <MeetingForm />
      </section>
    </div>
  );
}
