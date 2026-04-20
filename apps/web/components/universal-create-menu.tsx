"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

type UniversalCreateMenuProps = {
  className?: string;
  align?: "left" | "right";
  buttonLabel?: string;
  buttonClassName?: string;
  panelClassName?: string;
};

type UniversalCreateGroup = {
  title: string;
  items: Array<{
    label: string;
    description: string;
    href: string;
  }>;
};

const universalCreateGroups: UniversalCreateGroup[] = [
  {
    title: "Revenue workflow",
    items: [
      {
        label: "Lead",
        description: "Start the canonical opportunity record.",
        href: "/leads?compose=1#lead-create"
      },
      {
        label: "Customer",
        description: "Create the shared customer account first.",
        href: "/customers?compose=1#customer-create"
      },
      {
        label: "Project",
        description: "Open the main project spine for the workflow.",
        href: "/projects?compose=1#project-create"
      },
      {
        label: "Estimate",
        description: "Create a draft estimate tied to the project chain.",
        href: "/estimates?compose=1#estimate-create"
      },
      {
        label: "Contract",
        description: "Generate a canonical contract from approved work.",
        href: "/contracts?compose=1#contract-create"
      }
    ]
  },
  {
    title: "Delivery and billing",
    items: [
      {
        label: "Change order",
        description: "Capture scoped project changes on the same record chain.",
        href: "/change-orders?compose=1#change-order-create"
      },
      {
        label: "Invoice",
        description: "Create the billing record before opening the full workspace.",
        href: "/invoices?compose=1#invoice-create"
      }
    ]
  }
];

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 4v12" />
      <path d="M4 10h12" />
    </svg>
  );
}

export function UniversalCreateMenu({
  className,
  align = "right",
  buttonLabel = "Create",
  buttonClassName,
  panelClassName
}: UniversalCreateMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className={["relative", className ?? ""].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((currentValue) => !currentValue)}
        className={[
          "inline-flex items-center gap-2 rounded border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800",
          buttonClassName ?? ""
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <PlusIcon />
        <span>{buttonLabel}</span>
      </button>

      {open ? (
        <div
          id={menuId}
          className={[
            "absolute top-full z-40 mt-2 w-[min(92vw,29rem)] rounded border border-neutral-200 bg-white shadow-xl",
            align === "left" ? "left-0" : "right-0",
            panelClassName ?? ""
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Universal create
            </p>
            <p className="mt-1 text-sm leading-6 text-neutral-600">
              Start a canonical record, then finish the work inside its full manager
              workspace.
            </p>
          </div>

          <div className="grid gap-0 md:grid-cols-2">
            {universalCreateGroups.map((group) => (
              <section key={group.title} className="border-b border-neutral-100 p-4 md:border-b-0 md:border-r last:md:border-r-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-600">
                  {group.title}
                </p>
                <div className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block rounded border border-neutral-200 bg-neutral-50 px-3 py-3 transition hover:border-neutral-300 hover:bg-white"
                    >
                      <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                      <p className="mt-1 text-sm leading-5 text-neutral-600">
                        {item.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
