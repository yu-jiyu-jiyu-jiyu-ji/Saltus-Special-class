"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { formatMeetingDateShort, getMeetingDisplayTitle } from "@/lib/meetings";

export type DeletedMeetingItem = {
  id: string;
  date: string;
  title?: string | null;
  deletedAt: string;
  user: {
    id: string;
    name: string;
  };
};

type DeletedMeetingsTableProps = {
  meetings: DeletedMeetingItem[];
};

export function DeletedMeetingsTable({ meetings }: DeletedMeetingsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleRestore(id: string) {
    if (!window.confirm("このMTG議事録を復旧しますか？")) {
      return;
    }

    setError("");
    setLoadingId(id);

    try {
      const response = await fetch(`/api/meetings/${id}/restore`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "復旧に失敗しました。");
        return;
      }

      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoadingId(null);
    }
  }

  if (meetings.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600">削除済みの MTG 議事録はありません。</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {error ? (
        <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">タイトル</th>
              <th className="px-4 py-3 font-semibold">MTG実施日</th>
              <th className="px-4 py-3 font-semibold">投稿者</th>
              <th className="px-4 py-3 font-semibold">削除日時</th>
              <th className="px-4 py-3 font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {getMeetingDisplayTitle(meeting.title)}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatMeetingDateShort(new Date(meeting.date))}
                </td>
                <td className="px-4 py-3 text-slate-700">{meeting.user.name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {new Intl.DateTimeFormat("ja-JP", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Tokyo",
                  }).format(new Date(meeting.deletedAt))}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={loadingId === meeting.id}
                    onClick={() => handleRestore(meeting.id)}
                    className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {loadingId === meeting.id ? "復旧中..." : "復旧"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
