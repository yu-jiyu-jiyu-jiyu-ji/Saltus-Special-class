"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

function matchesDate(isoDate: string, filterDate: string): boolean {
  if (!filterDate) {
    return true;
  }
  return isoDate.slice(0, 10) === filterDate;
}

export function DeletedMeetingsTable({ meetings }: DeletedMeetingsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [mtgDate, setMtgDate] = useState("");
  const [deletedDate, setDeletedDate] = useState("");
  const [memberId, setMemberId] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedMtgDate, setAppliedMtgDate] = useState("");
  const [appliedDeletedDate, setAppliedDeletedDate] = useState("");
  const [appliedMemberId, setAppliedMemberId] = useState("");

  const members = useMemo(() => {
    const map = new Map<string, string>();
    for (const meeting of meetings) {
      map.set(meeting.user.id, meeting.user.name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ja"));
  }, [meetings]);

  const filteredMeetings = useMemo(() => {
    const keyword = appliedQuery.trim().toLowerCase();

    return meetings.filter((meeting) => {
      if (appliedMemberId && meeting.user.id !== appliedMemberId) {
        return false;
      }

      if (!matchesDate(meeting.date, appliedMtgDate)) {
        return false;
      }

      if (!matchesDate(meeting.deletedAt, appliedDeletedDate)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const title = getMeetingDisplayTitle(meeting.title).toLowerCase();
      return (
        title.includes(keyword) ||
        meeting.user.name.toLowerCase().includes(keyword)
      );
    });
  }, [meetings, appliedQuery, appliedMtgDate, appliedDeletedDate, appliedMemberId]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(query);
    setAppliedMtgDate(mtgDate);
    setAppliedDeletedDate(deletedDate);
    setAppliedMemberId(memberId);
  }

  function handleClear() {
    setQuery("");
    setMtgDate("");
    setDeletedDate("");
    setMemberId("");
    setAppliedQuery("");
    setAppliedMtgDate("");
    setAppliedDeletedDate("");
    setAppliedMemberId("");
  }

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

  const hasFilters = Boolean(
    appliedQuery || appliedMtgDate || appliedDeletedDate || appliedMemberId,
  );

  if (meetings.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-600">削除済みの MTG 議事録はありません。</p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSearch}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_150px_150px_160px_auto]"
      >
        <div>
          <label htmlFor="deleted-q" className="mb-1.5 block text-xs font-medium text-slate-500">
            ワード
          </label>
          <input
            id="deleted-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="タイトル・投稿者名で検索"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="deleted-mtg-date" className="mb-1.5 block text-xs font-medium text-slate-500">
            MTG実施日
          </label>
          <input
            id="deleted-mtg-date"
            type="date"
            value={mtgDate}
            onChange={(e) => setMtgDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="deleted-at-date"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            削除日
          </label>
          <input
            id="deleted-at-date"
            type="date"
            value={deletedDate}
            onChange={(e) => setDeletedDate(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="deleted-member" className="mb-1.5 block text-xs font-medium text-slate-500">
            投稿者
          </label>
          <select
            id="deleted-member"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className={inputClassName}
          >
            <option value="">すべて</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            検索
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            クリア
          </button>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {filteredMeetings.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            {hasFilters
              ? "条件に一致する削除済み議事録は見つかりませんでした。"
              : "削除済みの MTG 議事録はありません。"}
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                {filteredMeetings.map((meeting) => (
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
      )}
    </div>
  );
}
