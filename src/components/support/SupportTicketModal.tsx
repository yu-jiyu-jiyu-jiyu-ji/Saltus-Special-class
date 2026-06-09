"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type TicketTypeOption = "SYSTEM" | "USAGE";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

type SupportTicketModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SupportTicketModal({ open, onClose }: SupportTicketModalProps) {
  const router = useRouter();
  const [type, setType] = useState<TicketTypeOption>("SYSTEM");
  const [title, setTitle] = useState("");
  const [systemField1, setSystemField1] = useState("");
  const [systemField2, setSystemField2] = useState("");
  const [systemField3, setSystemField3] = useState("");
  const [usageField1, setUsageField1] = useState("");
  const [usageField2, setUsageField2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function resetForm() {
    setType("SYSTEM");
    setTitle("");
    setSystemField1("");
    setSystemField2("");
    setSystemField3("");
    setUsageField1("");
    setUsageField2("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload =
      type === "SYSTEM"
        ? {
            type,
            title,
            systemField1,
            systemField2,
            systemField3: systemField3 || undefined,
          }
        : {
            type,
            title,
            usageField1,
            usageField2,
          };

    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "送信に失敗しました。");
        return;
      }

      resetForm();
      onClose();
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="閉じる"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">お問い合わせ</h2>
              <p className="mt-1 text-sm text-slate-500">
                種別を選んで内容を入力してください
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="モーダルを閉じる"
            >
              ✕
            </button>
          </div>
        </div>

        <form className="space-y-5 px-6 py-5" onSubmit={handleSubmit}>
          <div className="inline-flex w-full rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setType("SYSTEM")}
              className={[
                "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm",
                type === "SYSTEM"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              システムへの問い合わせ
            </button>
            <button
              type="button"
              onClick={() => setType("USAGE")}
              className={[
                "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:text-sm",
                type === "USAGE"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              使い方の問い合わせ
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <Field label="タイトル" id="ticketTitle" required>
            <input
              id="ticketTitle"
              type="text"
              required
              maxLength={200}
              className={inputClassName}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="問い合わせの概要"
            />
          </Field>

          {type === "SYSTEM" ? (
            <>
              <Field label="現状の動き" id="systemField1" required>
                <textarea
                  id="systemField1"
                  required
                  rows={3}
                  className={inputClassName}
                  value={systemField1}
                  onChange={(e) => setSystemField1(e.target.value)}
                  placeholder="現在どのような動作になっているか"
                />
              </Field>
              <Field label="理想の動き" id="systemField2" required>
                <textarea
                  id="systemField2"
                  required
                  rows={3}
                  className={inputClassName}
                  value={systemField2}
                  onChange={(e) => setSystemField2(e.target.value)}
                  placeholder="どのように動いてほしいか"
                />
              </Field>
              <Field label="備考（任意）" id="systemField3">
                <textarea
                  id="systemField3"
                  rows={2}
                  className={inputClassName}
                  value={systemField3}
                  onChange={(e) => setSystemField3(e.target.value)}
                  placeholder="補足があれば入力"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="画面名" id="usageField1" required>
                <input
                  id="usageField1"
                  type="text"
                  required
                  className={inputClassName}
                  value={usageField1}
                  onChange={(e) => setUsageField1(e.target.value)}
                  placeholder="例: MTG議事録一覧"
                />
              </Field>
              <Field label="内容" id="usageField2" required>
                <textarea
                  id="usageField2"
                  required
                  rows={5}
                  className={inputClassName}
                  value={usageField2}
                  onChange={(e) => setUsageField2(e.target.value)}
                  placeholder="わからないこと・困っていることを具体的に"
                />
              </Field>
            </>
          )}

          <div className="flex gap-3 pb-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
            >
              {loading ? "送信中..." : "送信する"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}
