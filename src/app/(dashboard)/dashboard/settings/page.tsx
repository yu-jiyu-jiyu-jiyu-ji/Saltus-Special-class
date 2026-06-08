import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/PageHeader";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export const metadata: Metadata = {
  title: "設定 | Saltus 特進",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="設定"
        description="アカウント設定を変更できます。"
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">パスワード変更</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
