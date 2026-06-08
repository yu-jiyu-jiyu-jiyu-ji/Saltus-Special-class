"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { MarkdownContent } from "@/components/meetings/MarkdownContent";
import { formatMeetingDate } from "@/lib/meetings";
import type { Role, SessionUser } from "@/types/auth";
import type { HomeworkItem } from "@/types/meeting";
import { parseHomeworkItems } from "@/types/meeting";

type MeetingComment = {
  id: string;
  createdAt: string;
  content: string;
  user: {
    id: string;
    name: string;
    role: Role;
  };
};

type MeetingDetailViewProps = {
  meeting: {
    id: string;
    date: string;
    content: string;
    homework: unknown;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    comments: MeetingComment[];
  };
  currentUser: SessionUser;
  showAuthor: boolean;
  canEdit: boolean;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function newHomeworkItem(text = ""): HomeworkItem {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false,
  };
}

export function MeetingDetailView({
  meeting,
  currentUser,
  showAuthor,
  canEdit,
}: MeetingDetailViewProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState(toDateInputValue(meeting.date));
  const [content, setContent] = useState(meeting.content);
  const [homework, setHomework] = useState<HomeworkItem[]>(
    parseHomeworkItems(meeting.homework),
  );
  const [homeworkLoading, setHomeworkLoading] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");

  function startEditing() {
    setDate(toDateInputValue(meeting.date));
    setContent(meeting.content);
    setHomework(parseHomeworkItems(meeting.homework));
    setError("");
    setIsEditing(true);
  }

  async function saveHomeworkOnly(nextHomework: HomeworkItem[]) {
    setError("");
    setHomework(nextHomework);

    const response = await fetch(`/api/meetings/${meeting.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homework: nextHomework }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "宿題事項の更新に失敗しました。");
      setHomework(parseHomeworkItems(meeting.homework));
      return false;
    }

    router.refresh();
    return true;
  }

  async function toggleHomework(itemId: string) {
    if (isEditing) {
      return;
    }

    setHomeworkLoading(itemId);
    const next = homework.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item,
    );
    try {
      await saveHomeworkOnly(next);
    } finally {
      setHomeworkLoading(null);
    }
  }

  async function handleCompleteEdit() {
    setError("");
    setSaveLoading(true);

    const homeworkPayload = homework
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length > 0);

    try {
      const response = await fetch(`/api/meetings/${meeting.id}`, {
        method: "PATCH",
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

      setIsEditing(false);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim() || isEditing) {
      return;
    }

    setError("");
    setCommentLoading(true);

    try {
      const response = await fetch(`/api/meetings/${meeting.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "コメントの投稿に失敗しました。");
        return;
      }

      setComment("");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setCommentLoading(false);
    }
  }

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

  function toggleHomeworkInEdit(itemId: string) {
    setHomework((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item,
      ),
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <label htmlFor="edit-date" className="block text-xs font-medium text-slate-500">
                  MTG実施日
                </label>
                <input
                  id="edit-date"
                  type="date"
                  required
                  className={`${inputClassName} max-w-xs`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            ) : (
              <>
                <p className="text-sm text-slate-500">
                  {formatMeetingDate(new Date(meeting.date))}
                </p>
                {showAuthor ? (
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    投稿者: {meeting.user.name}
                  </p>
                ) : null}
              </>
            )}
          </div>

          {canEdit ? (
            <button
              type="button"
              disabled={saveLoading}
              onClick={isEditing ? handleCompleteEdit : startEditing}
              className={[
                "shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60",
                isEditing
                  ? "bg-sky-600 text-white hover:bg-sky-700"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {saveLoading ? "保存中..." : isEditing ? "完了" : "編集"}
            </button>
          ) : null}
        </div>

        <div className="pt-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">会話内容・議事録</h2>
          {isEditing ? (
            <textarea
              required
              rows={14}
              className={`${inputClassName} min-h-[280px] resize-y leading-6`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          ) : (
            <MarkdownContent content={meeting.content} />
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">宿題事項</h2>
          {isEditing ? (
            <button
              type="button"
              onClick={addHomeworkRow}
              className="text-sm font-medium text-sky-700 hover:text-sky-800"
            >
              ＋ 項目を追加
            </button>
          ) : null}
        </div>

        {isEditing ? (
          homework.length === 0 ? (
            <p className="text-sm text-slate-500">宿題事項がありません。「項目を追加」から入力できます。</p>
          ) : (
            <ul className="space-y-3">
              {homework.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleHomeworkInEdit(item.id)}
                    className="mt-3 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateHomeworkText(item.id, e.target.value)}
                    placeholder="宿題の内容"
                    className={inputClassName}
                  />
                  <button
                    type="button"
                    onClick={() => removeHomeworkRow(item.id)}
                    className="mt-2 shrink-0 rounded-lg px-2 py-2 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="項目を削除"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : parseHomeworkItems(meeting.homework).length === 0 ? (
          <p className="text-sm text-slate-500">宿題事項はありません。</p>
        ) : (
          <ul className="space-y-3">
            {parseHomeworkItems(meeting.homework).map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  disabled={homeworkLoading === item.id}
                  onChange={() => toggleHomework(item.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span
                  className={[
                    "text-sm leading-7 text-slate-700",
                    item.completed ? "text-slate-400 line-through" : "",
                  ].join(" ")}
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900">コメント</h2>
          <p className="mt-1 text-xs text-slate-500">コメントは編集できません。新規投稿のみ可能です。</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {meeting.comments.length === 0 ? (
            <p className="text-sm text-slate-500">まだコメントはありません。</p>
          ) : (
            meeting.comments.map((entry) => (
              <div
                key={entry.id}
                className={[
                  "max-w-[85%] rounded-2xl px-4 py-3",
                  entry.user.id === currentUser.id
                    ? "ml-auto bg-sky-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-800",
                ].join(" ")}
              >
                <div
                  className={[
                    "mb-1 flex flex-wrap items-center gap-2 text-xs",
                    entry.user.id === currentUser.id ? "text-sky-100" : "text-slate-500",
                  ].join(" ")}
                >
                  <span className="font-medium">{entry.user.name}</span>
                  {entry.user.role === "ADMIN" || entry.user.role === "MANAGER" ? (
                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                      {entry.user.role === "ADMIN" ? "管理者" : "マネージャー"}
                    </span>
                  ) : null}
                  <span>
                    {new Intl.DateTimeFormat("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Asia/Tokyo",
                    }).format(new Date(entry.createdAt))}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6">{entry.content}</p>
              </div>
            ))
          )}
        </div>

        {!isEditing ? (
          <form
            className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row"
            onSubmit={handleCommentSubmit}
          >
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを入力..."
              className={`${inputClassName} min-h-[48px] flex-1 resize-none`}
            />
            <button
              type="submit"
              disabled={commentLoading}
              className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:self-end"
            >
              {commentLoading ? "送信中..." : "投稿"}
            </button>
          </form>
        ) : (
          <div className="border-t border-slate-100 px-6 py-4">
            <p className="text-center text-sm text-slate-500">
              編集中はコメントを投稿できません。「完了」で編集を終了してください。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
