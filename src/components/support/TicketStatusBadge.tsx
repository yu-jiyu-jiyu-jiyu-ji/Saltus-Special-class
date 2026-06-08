import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_STYLES,
} from "@/lib/tickets";
import type { TicketStatus } from "@/generated/prisma/client";

type TicketStatusBadgeProps = {
  status: TicketStatus;
};

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TICKET_STATUS_STYLES[status]}`}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}
