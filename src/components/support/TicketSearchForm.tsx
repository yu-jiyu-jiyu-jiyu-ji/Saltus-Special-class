import { TICKET_STATUS_LABELS, TICKET_TYPE_LABELS } from "@/lib/tickets";

type TicketSearchFormProps = {
  defaultQuery?: string;
  defaultStatus?: string;
  defaultDate?: string;
  defaultType?: string;
};

export function TicketSearchForm({
  defaultQuery = "",
  defaultStatus = "",
  defaultDate = "",
  defaultType = "",
}: TicketSearchFormProps) {
  return (
    <form
      method="get"
      action="/dashboard/support"
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_130px_150px_180px_auto]"
    >
      <div>
        <label htmlFor="q" className="mb-1.5 block text-xs font-medium text-slate-500">
          ワード
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="タイトル・内容で検索"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div>
        <label htmlFor="status" className="mb-1.5 block text-xs font-medium text-slate-500">
          ステータス
        </label>
        <select
          id="status"
          name="status"
          defaultValue={defaultStatus}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        >
          <option value="">すべて</option>
          {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="date" className="mb-1.5 block text-xs font-medium text-slate-500">
          日付
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultDate}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div>
        <label htmlFor="type" className="mb-1.5 block text-xs font-medium text-slate-500">
          種別
        </label>
        <select
          id="type"
          name="type"
          defaultValue={defaultType}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        >
          <option value="">すべて</option>
          {Object.entries(TICKET_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
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
        <a
          href="/dashboard/support"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          クリア
        </a>
      </div>
    </form>
  );
}
