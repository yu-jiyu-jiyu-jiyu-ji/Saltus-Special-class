"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export function UserRoleTable({ users, currentUserId }: UserRoleTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

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

  return (
    <div>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

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
            {users.map((user) => {
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
                      <span className="text-slate-500">{ROLE_LABELS[user.role]}（自分）</span>
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
    </div>
  );
}
