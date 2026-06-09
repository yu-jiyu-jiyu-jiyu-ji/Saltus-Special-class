import { PageHeader } from "@/components/layout/PageHeader";
import { TicketListRow } from "@/components/support/TicketListRow";
import { TicketSearchForm } from "@/components/support/TicketSearchForm";
import { buildTicketListWhere, canViewAllTickets } from "@/lib/tickets";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

type SupportListPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    date?: string;
    type?: string;
  }>;
};

export default async function SupportListPage({ searchParams }: SupportListPageProps) {
  const user = await getSessionUser();
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const date = params.date?.trim() ?? "";
  const type = params.type?.trim() ?? "";
  const hasFilters = Boolean(q || status || date || type);

  const showAuthor = canViewAllTickets(user!.role);
  const where = buildTicketListWhere(user!, { q, status, date, type });

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="問い合わせ一覧"
        description={
          showAuthor
            ? "全ユーザーからの問い合わせを確認・返信できます。"
            : "あなたが起票した問い合わせの一覧です。右下の吹き出しボタンから新規起票もできます。"
        }
      />

      <TicketSearchForm
        defaultQuery={q}
        defaultStatus={status}
        defaultDate={date}
        defaultType={type}
      />

      {tickets.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm leading-7 text-slate-600">
            {hasFilters
              ? "条件に一致する問い合わせは見つかりませんでした。"
              : "まだ問い合わせがありません。"}
          </p>
          {!hasFilters ? (
            <p className="mt-2 text-sm text-slate-500">
              画面右下の青い吹き出しボタンからお問い合わせできます。
            </p>
          ) : null}
        </section>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketListRow key={ticket.id} ticket={ticket} showAuthor={showAuthor} />
          ))}
        </div>
      )}
    </div>
  );
}
