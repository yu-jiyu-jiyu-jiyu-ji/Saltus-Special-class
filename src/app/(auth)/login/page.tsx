import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "ログイン | Saltus 特進",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
