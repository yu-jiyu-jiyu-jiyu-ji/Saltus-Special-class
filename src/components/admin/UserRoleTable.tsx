"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ROLE_LABELS } from "@/lib/navigation";
import type { Role } from "@/types/auth";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

type UserRoleTableProps = {
  users: AdminUser[];
  currentUserId: string;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export function UserRoleTable({ users, currentUserId }: UserRoleTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedRole, setAppliedRole] = useState("");

  const filteredUsers = useMemo(() => {
    const keyword = appliedQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (appliedRole && user.role !== appliedRole) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword)
      );
    });
  }, [users, appliedQuery, appliedRole]);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(query);
    setAppliedRole(roleFilter);
  }

  function handleClear() {
    setQuery("");
    setRoleFilter("");
    setAppliedQuery("");
    setAppliedRole("");
  }

  async function handleRoleChange(userId: string, role: Role) {
    setError("");
    setLoadingId(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "権限の更新に失敗しました。");
        return;
      }

      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setLoadingId(null);
    }
  }

  const hasFilters = Boolean(appliedQuery || appliedRole);

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSearch}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_160px_auto]"
      >
        <div>
          <label htmlFor="user-q" className="mb-1.5 block text-xs font-medium text-slate-500">
            ワード
          </label>
          <input
            id="user-q"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="氏名・メールで検索"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="user-role" className="mb-1.5 block text-xs font-medium text-slate-500">
            権限
          </label>
          <select
            id="user-role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={inputClassName}
          >
            <option value="">すべて</option>
            {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
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

      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">
            {hasFilters
              ? "条件に一致するユーザーは見つかりませんでした。"
              : "登録ユーザーはありません。"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-600">氏名</th>
                <th className="px-5 py-3 font-semibold text-slate-600">メール</th>
                <th className="px-5 py-3 font-semibold text-slate-600">登録日</th>
                <th className="px-5 py-3 font-semibold text-slate-600">権限</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUserId;

                return (
                  <tr key={user.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4 font-medium text-slate-900">{user.name}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {new Intl.DateTimeFormat("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "Asia/Tokyo",
                      }).format(new Date(user.createdAt))}
                    </td>
                    <td className="px-5 py-4">
                      {isSelf ? (
                        <span className="text-slate-500">
                          {ROLE_LABELS[user.role]}（自分）
                        </span>
                      ) : (
                        <select
                          value={user.role}
                          disabled={loadingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:opacity-60"
                        >
                          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
