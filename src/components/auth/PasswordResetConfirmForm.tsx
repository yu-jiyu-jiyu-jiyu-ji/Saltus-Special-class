"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  AuthCard,
  AuthError,
  AuthField,
  AuthLink,
  AuthSuccess,
  authButtonClassName,
  authInputClassName,
} from "@/components/auth/AuthCard";

type PasswordResetConfirmFormProps = {
  token: string;
};

export function PasswordResetConfirmForm({ token }: PasswordResetConfirmFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, passwordConfirm }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "更新に失敗しました。");
        return;
      }

      setMessage(data.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="新しいパスワード設定"
      subtitle="新しいパスワードを入力してください"
      footer={
        <p className="text-center text-sm text-slate-500">
          <AuthLink href="/login">ログイン画面に戻る</AuthLink>
        </p>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error ? <AuthError message={error} /> : null}
        {message ? <AuthSuccess message={message} /> : null}

        <AuthField label="新しいパスワード" id="password">
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

        <AuthField label="新しいパスワード（確認）" id="passwordConfirm">
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
          {loading ? "更新中..." : "パスワードを更新"}
        </button>
      </form>
    </AuthCard>
  );
}
