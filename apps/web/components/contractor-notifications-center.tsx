"use client";

import { useState } from "react";
import Link from "next/link";

import type { ContractorNotificationsSummary } from "@/lib/notifications/types";

type ContractorNotificationsCenterProps = {
  notifications: ContractorNotificationsSummary;
  compact?: boolean;
};

const notificationIconStyle = {
  width: "16px",
  height: "16px",
  flexShrink: 0
} as const;

function BellIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width="16"
      height="16"
      className="h-4 w-4"
      style={notificationIconStyle}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 3.5a4 4 0 0 0-4 4V10c0 .8-.2 1.6-.7 2.3L4.5 13.5h11l-.8-1.2A4.1 4.1 0 0 1 14 10V7.5a4 4 0 0 0-4-4Z" />
      <path d="M8.3 15.5a2 2 0 0 0 3.4 0" />
    </svg>
  );
}

function getToneClassName(tone: "critical" | "warning" | "neutral") {
  switch (tone) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-[#e6dacd] bg-[#fbf5ee] text-[#6b5442]";
  }
}

export function ContractorNotificationsCenter({
  notifications,
  compact = false
}: ContractorNotificationsCenterProps) {
  const [open, setOpen] = useState(false);
  const hasNotifications = notifications.totalCount > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={[
          "inline-flex items-center gap-2 rounded-[4px] border transition",
          compact
            ? "h-9 border-[#e2d4c5] bg-[#fbf5ee] px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b5442] hover:border-[#ef7d32] hover:bg-white hover:text-[#221a14]"
            : "h-10 border-[#e2d4c5] bg-[#fbf5ee] px-3.5 text-[12px] font-semibold text-[#2b241f] hover:border-[#ef7d32] hover:bg-white"
        ].join(" ")}
      >
        <BellIcon />
        <span>{compact ? "Alerts" : "Attention"}</span>
        <span
          className={[
            "inline-flex min-w-[1.55rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
            hasNotifications
              ? "bg-[#17120f] text-[#ffd7bb]"
              : "bg-[#ece3d8] text-[#7c6a5d]"
          ].join(" ")}
        >
          {notifications.totalCount}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-2 w-[min(92vw,380px)] border border-[#d9cdc2] bg-white shadow-[0_30px_80px_-38px_rgba(34,26,20,0.34)]">
          <div className="flex items-start justify-between gap-4 border-b border-[#eee2d7] px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a4581a]">
                Action awareness
              </p>
              <p className="mt-1 text-sm font-semibold text-[#221a14]">
                {hasNotifications
                  ? `${notifications.totalCount} attention item${
                      notifications.totalCount === 1 ? "" : "s"
                    }`
                  : "No high-signal items right now"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f5b32] transition hover:text-[#221a14]"
            >
              Close
            </button>
          </div>

          {hasNotifications ? (
            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.sections.map((section) => (
                <section key={section.key} className="border-b border-[#f1e7dd] last:border-b-0">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8f5b32]">
                      {section.label}
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a08c7d]">
                      {section.count}
                    </span>
                  </div>
                  <div className="space-y-2 px-4 pb-4">
                    {section.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[4px] border border-[#eee2d7] bg-[#fffcf7] px-3 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              className="text-sm font-semibold text-[#221a14] transition hover:text-[#a4581a]"
                            >
                              {item.title}
                            </Link>
                            <p className="mt-1 text-xs leading-5 text-[#665446]">
                              {item.description}
                            </p>
                          </div>
                          <span
                            className={[
                              "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                              getToneClassName(item.tone)
                            ].join(" ")}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="inline-flex items-center rounded-[4px] border border-[#e0d4c9] bg-white px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e4424] transition hover:border-[#ef7d32] hover:text-[#b45417]"
                          >
                            Open
                          </Link>
                          {item.contextHref && item.contextLabel ? (
                            <Link
                              href={item.contextHref}
                              onClick={() => setOpen(false)}
                              className="inline-flex items-center rounded-[4px] px-2 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7d7168] transition hover:text-[#1f1813]"
                            >
                              {item.contextLabel}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5 text-sm leading-6 text-[#665446]">
              The contractor workspace is clear for the current high-signal checks. New
              schedule, collections, contract, appointment, punchlist, or progress-billing
              pressure will show up here.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
