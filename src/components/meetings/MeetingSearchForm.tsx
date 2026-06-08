type MemberOption = {
  id: string;
  name: string;
};

type MeetingSearchFormProps = {
  defaultQuery?: string;
  defaultDate?: string;
  defaultMemberId?: string;
  members?: MemberOption[];
};

export function MeetingSearchForm({
  defaultQuery = "",
  defaultDate = "",
  defaultMemberId = "",
  members = [],
}: MeetingSearchFormProps) {
  const showMemberFilter = members.length > 0;

  return (
    <form
      method="get"
      action="/dashboard/mtg"
      className={[
        "grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
        showMemberFilter
          ? "md:grid-cols-[1fr_160px_160px_auto]"
          : "md:grid-cols-[1fr_180px_auto]",
      ].join(" ")}
    >
      <div>
        <label htmlFor="q" className="mb-1.5 block text-xs font-medium text-slate-500">
          キーワード
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="内容・投稿者名で検索"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      {showMemberFilter ? (
        <div>
          <label htmlFor="memberId" className="mb-1.5 block text-xs font-medium text-slate-500">
            投稿メンバー
          </label>
          <select
            id="memberId"
            name="memberId"
            defaultValue={defaultMemberId}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="">すべて</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="date" className="mb-1.5 block text-xs font-medium text-slate-500">
          MTG実施日
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultDate}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          検索
        </button>
        <a
          href="/dashboard/mtg"
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          クリア
        </a>
      </div>
    </form>
  );
}
