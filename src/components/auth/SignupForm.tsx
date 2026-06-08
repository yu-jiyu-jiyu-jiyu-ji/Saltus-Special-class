"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AuthCard,
  AuthError,
  AuthField,
  AuthLink,
  AuthNotice,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/AuthCard";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, passwordConfirm }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "アカウント作成に失敗しました。");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="新規ユーザー追加"
      subtitle="自コミュニティ内メンバー向けのアカウント作成"
      footer={
        <p className="text-center text-sm text-slate-500">
          既にアカウントをお持ちの方は{" "}
          <AuthLink href="/login">ログイン</AuthLink>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <AuthNotice>
          初期権限はメンバーとなります。マネージャー・管理者権限への変更はシステム管理者へご依頼ください。
        </AuthNotice>

        {error ? <AuthError message={error} /> : null}

        <AuthField label="氏名" id="name">
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className={authInputClassName}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </AuthField>

        <AuthField label="メールアドレス" id="email">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className={authInputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </AuthField>

        <AuthField label="パスワード" id="password">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className={authInputClassName}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </AuthField>

        <AuthField label="パスワード（確認）" id="passwordConfirm">
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            required
            className={authInputClassName}
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
        </AuthField>

        <button type="submit" disabled={loading} className={authButtonClassName}>
          {loading ? "作成中..." : "アカウントを作成"}
        </button>
      </form>
    </AuthCard>
  );
}
