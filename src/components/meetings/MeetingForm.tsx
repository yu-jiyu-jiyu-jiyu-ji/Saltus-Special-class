"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { HomeworkItem } from "@/types/meeting";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

const buttonClassName =
  "inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

function newHomeworkItem(text = ""): HomeworkItem {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false,
  };
}

export function MeetingForm() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [homework, setHomework] = useState<HomeworkItem[]>([newHomeworkItem()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateHomeworkText(id: string, text: string) {
    setHomework((items) =>
      items.map((item) => (item.id === id ? { ...item, text } : item)),
    );
  }

  function addHomeworkRow() {
    setHomework((items) => [...items, newHomeworkItem()]);
  }

  function removeHomeworkRow(id: string) {
    setHomework((items) => items.filter((item) => item.id !== id));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const homeworkPayload = homework
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          content,
          homework: homeworkPayload,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "保存に失敗しました。");
        return;
      }

      router.push(`/dashboard/mtg/${data.meeting.id}`);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-medium text-slate-700">
          MTG実施日
        </label>
        <input
          id="date"
          type="date"
          required
          className={`${inputClassName} max-w-xs`}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-slate-700">
          会話内容・議事録（Markdown対応）
        </label>
        <textarea
          id="content"
          required
          rows={14}
          placeholder={"## 本日のテーマ\n\n- 進捗共有\n- 次回までの課題"}
          className={`${inputClassName} min-h-[280px] resize-y leading-6`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-slate-700">宿題事項</label>
          <button
            type="button"
            onClick={addHomeworkRow}
            className="text-sm font-medium text-sky-700 hover:text-sky-800"
          >
            ＋ 項目を追加
          </button>
        </div>
        <div className="space-y-2">
          {homework.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center text-xs text-slate-400">{index + 1}</span>
              <input
                type="text"
                value={item.text}
                onChange={(event) => updateHomeworkText(item.id, event.target.value)}
                placeholder="宿題の内容を入力"
                className={inputClassName}
              />
              {homework.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeHomeworkRow(item.id)}
                  className="shrink-0 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="項目を削除"
                >
                  ✕
                </button>
              ) : null}
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          詳細画面でチェックを入れると完了（取り消し線）になります。
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={loading} className={buttonClassName}>
          {loading ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/mtg")}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
