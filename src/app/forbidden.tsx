import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-red-600">403 Forbidden</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">閲覧権限がありません</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          この MTG 記録を閲覧する権限がありません。
        </p>
        <Link
          href="/dashboard/mtg"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          MTG一覧に戻る
        </Link>
      </div>
    </div>
  );
}
