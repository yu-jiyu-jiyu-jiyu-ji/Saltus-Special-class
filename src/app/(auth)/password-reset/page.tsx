import type { Metadata } from "next";

import { PasswordResetRequestForm } from "@/components/auth/PasswordResetRequestForm";
import { PasswordResetConfirmForm } from "@/components/auth/PasswordResetConfirmForm";

export const metadata: Metadata = {
  title: "パスワード再設定 | Saltus 特進",
};

type PasswordResetPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function PasswordResetPage({
  searchParams,
}: PasswordResetPageProps) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (token) {
    return <PasswordResetConfirmForm token={token} />;
  }

  return <PasswordResetRequestForm />;
}
