"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TicketStatusBadge } from "@/components/support/TicketStatusBadge";
import {
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
  formatTicketDate,
  getTicketTitle,
} from "@/lib/tickets";
import type { Role, SessionUser } from "@/types/auth";
import type { TicketStatus, TicketType } from "@/generated/prisma/client";

type ThreadComment = {
  id: string;
  createdAt: string;
  content: string;
  user: {
    id: string;
    name: string;
    role: Role;
  };
};

type ThreadTicket = {
  id: string;
  createdAt: string;
  title?: string | null;
  type: TicketType;
  status: TicketStatus;
  systemField1?: string | null;
  systemField2?: string | null;
  systemField3?: string | null;
  usageField1?: string | null;
  usageField2?: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  comments: ThreadComment[];
};

type TicketThreadProps = {
  ticket: ThreadTicket;
  currentUser: SessionUser;
};

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100";

export function TicketThread({ ticket, currentUser }: TicketThreadProps) {
  const router = useRouter();
  const [status, setStatus] = useState(ticket.status);
  const [content, setContent] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUser.role === "ADMIN";
  const isOwner = ticket.userId === currentUser.id;
  const isClosed = status === "RESOLVED" || status === "CANCELLED";
  const canReply = !isClosed;

  async function handleStatusChange(nextStatus: TicketStatus) {
    setError("");
    setStatusLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "ステータスの更新に失敗しました。");
        return;
      }

      setStatus(data.ticket.status);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) {
      return;
    }

    setError("");
    setCommentLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "返信の投稿に失敗しました。");
        return;
      }

      setContent("");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
    } finally {
      setCommentLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                {TICKET_TYPE_LABELS[ticket.type]}
              </span>
              <TicketStatusBadge status={status} />
            </div>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              {getTicketTitle(ticket)}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              起票: {formatTicketDate(new Date(ticket.createdAt))}
              {isAdmin ? ` · 起票者: ${ticket.user.name}` : null}
            </p>
          </div>

          <StatusControl
            status={status}
            isAdmin={isAdmin}
            isOwner={isOwner}
            loading={statusLoading}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 lg:px-6">
        <MessageBubble
          authorName={ticket.user.name}
          authorRole={ticket.user.role}
          createdAt={ticket.createdAt}
          align="left"
          isInitial
        >
          {ticket.type === "SYSTEM" ? (
            <div className="space-y-3 text-sm leading-6">
              <div>
                <p className="font-semibold text-slate-800">現状の動き</p>
                <p className="mt-1 whitespace-pre-wrap">{ticket.systemField1}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">理想の動き</p>
                <p className="mt-1 whitespace-pre-wrap">{ticket.systemField2}</p>
              </div>
              {ticket.systemField3 ? (
                <div>
                  <p className="font-semibold text-slate-800">備考</p>
                  <p className="mt-1 whitespace-pre-wrap">{ticket.systemField3}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-3 text-sm leading-6">
              <div>
                <p className="font-semibold text-slate-800">画面名</p>
                <p className="mt-1">{ticket.usageField1}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800">内容</p>
                <p className="mt-1 whitespace-pre-wrap">{ticket.usageField2}</p>
              </div>
            </div>
          )}
        </MessageBubble>

        {ticket.comments.map((comment) => (
          <MessageBubble
            key={comment.id}
            authorName={comment.user.name}
            authorRole={comment.user.role}
            createdAt={comment.createdAt}
            align={comment.user.id === currentUser.id ? "right" : "left"}
          >
            <p className="whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
          </MessageBubble>
        ))}
      </div>

      <div className="border-t border-slate-100 px-4 py-4 lg:px-6">
        {error ? (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {canReply ? (
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleCommentSubmit}>
            <textarea
              rows={2}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="返信を入力..."
              className={`${inputClassName} min-h-[48px] flex-1 resize-none`}
            />
            <button
              type="submit"
              disabled={commentLoading}
              className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:self-end"
            >
              {commentLoading ? "送信中..." : "返信する"}
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-slate-500">
            この問い合わせは{TICKET_STATUS_LABELS[status]}のため、新しい返信はできません。
          </p>
        )}
      </div>
    </div>
  );
}

function StatusControl({
  status,
  isAdmin,
  isOwner,
  loading,
  onChange,
}: {
  status: TicketStatus;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  onChange: (status: TicketStatus) => void;
}) {
  if (isAdmin) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-xs font-medium text-slate-500">
          ステータス
        </label>
        <select
          id="status"
          value={status}
          disabled={loading}
          onChange={(e) => onChange(e.target.value as TicketStatus)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        >
          {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map((key) => (
            <option key={key} value={key}>
              {TICKET_STATUS_LABELS[key]}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (isOwner && status !== "CANCELLED" && status !== "RESOLVED") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={() => onChange("CANCELLED")}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? "処理中..." : "取り下げる"}
      </button>
    );
  }

  return null;
}

function MessageBubble({
  authorName,
  authorRole,
  createdAt,
  align,
  isInitial = false,
  children,
}: {
  authorName: string;
  authorRole: Role;
  createdAt: string;
  align: "left" | "right";
  isInitial?: boolean;
  children: React.ReactNode;
}) {
  const isRight = align === "right";

  return (
    <div className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] sm:max-w-[70%] ${isRight ? "items-end" : "items-start"}`}>
        <div
          className={`mb-1 flex items-center gap-2 text-xs text-slate-500 ${isRight ? "justify-end" : ""}`}
        >
          <span className="font-medium text-slate-700">{authorName}</span>
          {authorRole === "ADMIN" ? (
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
              管理者
            </span>
          ) : null}
          {isInitial ? (
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
              起票
            </span>
          ) : null}
          <span>{formatTicketDate(new Date(createdAt))}</span>
        </div>
        <div
          className={[
            "rounded-2xl px-4 py-3 shadow-sm",
            isRight
              ? "rounded-br-md bg-sky-600 text-white"
              : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800",
          ].join(" ")}
        >
          <div className={isRight ? "[&_p]:text-white [&_strong]:text-white" : ""}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
