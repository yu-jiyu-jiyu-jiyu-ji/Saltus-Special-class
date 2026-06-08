"use client";

import { useState } from "react";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

const buttonClassName =
  "inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
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
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, password, passwordConfirm }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "パスワードの変更に失敗しました。");
        return;
      }

      setMessage(data.message ?? "パスワードを変更しました。");
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="max-w-md space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
          現在のパスワード
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClassName}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          新しいパスワード
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="new-password"
          className={inputClassName}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-700">
          新しいパスワード（確認）
        </label>
        <input
          id="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          className={inputClassName}
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading} className={buttonClassName}>
        {loading ? "変更中..." : "パスワードを変更"}
      </button>
    </form>
  );
}
