"use client";

import { useState } from "react";

import { SupportTicketModal } from "@/components/support/SupportTicketModal";

export function SupportFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="お問い合わせ"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-white shadow-lg shadow-sky-600/30 transition hover:bg-sky-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-sky-200"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 8.5H17M7 12H13M7 18.5L5 20V5.8C5 4.81 5.81 4 6.8 4H17.2C18.19 4 19 4.81 19 5.8V15.2C19 16.19 18.19 17 17.2 17H8.5L7 18.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <SupportTicketModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
