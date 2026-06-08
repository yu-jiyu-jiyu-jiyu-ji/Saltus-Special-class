"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AuthCard,
  AuthError,
  AuthField,
  AuthLink,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/AuthCard";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "ログインに失敗しました。");
        return;
      }

      const next = searchParams.get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="ログイン"
      subtitle="個別MTG知見ストック＆サポート管理システム"
      footer={
        <p className="text-center text-sm text-slate-500">
          アカウントをお持ちでない方は{" "}
          <AuthLink href="/signup">新規登録</AuthLink>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <AuthError message={error} /> : null}

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
            autoComplete="current-password"
            required
            className={authInputClassName}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </AuthField>

        <div className="text-right">
          <AuthLink href="/password-reset">パスワードをお忘れの方</AuthLink>
        </div>

        <button type="submit" disabled={loading} className={authButtonClassName}>
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </AuthCard>
  );
}
