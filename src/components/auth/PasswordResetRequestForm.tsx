"use client";

import { useState } from "react";

import {
  AuthCard,
  AuthError,
  AuthField,
  AuthLink,
  AuthSuccess,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/AuthCard";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "送信に失敗しました。");
        return;
      }

      setMessage(data.message);
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="パスワード再設定"
      subtitle="登録メールアドレスを入力してください"
      footer={
        <p className="text-center text-sm text-slate-500">
          <AuthLink href="/login">ログイン画面に戻る</AuthLink>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <AuthError message={error} /> : null}
        {message ? <AuthSuccess message={message} /> : null}

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

        <button type="submit" disabled={loading} className={authButtonClassName}>
          {loading ? "送信中..." : "再設定メールを送信"}
        </button>
      </form>
    </AuthCard>
  );
}
