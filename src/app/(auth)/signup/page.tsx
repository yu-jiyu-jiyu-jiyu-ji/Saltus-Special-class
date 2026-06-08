import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "新規ユーザー登録 | Saltus 特進",
};

export default function SignupPage() {
  return <SignupForm />;
}
