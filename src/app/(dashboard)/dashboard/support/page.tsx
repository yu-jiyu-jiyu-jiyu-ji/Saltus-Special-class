import { PageHeader } from "@/components/layout/PageHeader";
import { TicketListRow } from "@/components/support/TicketListRow";
import { buildTicketListWhere, canViewAllTickets } from "@/lib/tickets";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export default async function SupportListPage() {
  const user = await getSessionUser();
  const showAuthor = canViewAllTickets(user!.role);

  const tickets = await prisma.ticket.findMany({
    where: buildTicketListWhere(user!),
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

      {tickets.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm leading-7 text-slate-600">
            まだ問い合わせがありません。
          </p>
          <p className="mt-2 text-sm text-slate-500">
            画面右下の青い吹き出しボタンからお問い合わせできます。
          </p>
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
