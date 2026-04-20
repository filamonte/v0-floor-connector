"use client";

import Link from "next/link";

type TodoItem = {
  id: string;
  task: string;
  assignedCount: number;
  assignedInitials: string;
  dueDate: string;
  isPastDue: boolean;
  isFlagged: boolean;
};

type DashboardTodosWidgetProps = {
  todos?: TodoItem[];
};

function RefreshIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-[#4d5d78]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 11a8 8 0 0 0-14.7-4M4 13a8 8 0 0 0 14.7 4" />
      <path d="M4 4v4h4M20 20v-4h-4" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <path d="M7 2v4M13 2v4M3 9h14" />
    </svg>
  );
}

function ClockAlertIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-[#ea580c]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4M10 14h.01" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-3.5 w-3.5 text-[#dc2626]"
      fill="currentColor"
    >
      <path d="M4 2v16M4 2l10 5-10 5" />
    </svg>
  );
}

const DEFAULT_TODOS: TodoItem[] = [
  {
    id: "1",
    task: "Estimate",
    assignedCount: 1,
    assignedInitials: "JF",
    dueDate: "04/01/2026",
    isPastDue: false,
    isFlagged: true
  },
  {
    id: "2",
    task: "Bids",
    assignedCount: 0,
    assignedInitials: "JF",
    dueDate: "03/27/2026",
    isPastDue: true,
    isFlagged: false
  },
  {
    id: "3",
    task: "order stain, con...",
    assignedCount: 1,
    assignedInitials: "",
    dueDate: "12/08/2025",
    isPastDue: true,
    isFlagged: true
  },
  {
    id: "4",
    task: "call thomas to s...",
    assignedCount: 1,
    assignedInitials: "",
    dueDate: "11/24/2025",
    isPastDue: true,
    isFlagged: true
  },
  {
    id: "5",
    task: "review follow up",
    assignedCount: 0,
    assignedInitials: "",
    dueDate: "09/10/2025",
    isPastDue: true,
    isFlagged: true
  },
  {
    id: "6",
    task: "Training - Cost ...",
    assignedCount: 0,
    assignedInitials: "",
    dueDate: "03/31/2025",
    isPastDue: true,
    isFlagged: true
  },
  {
    id: "7",
    task: "Review AP doc (...",
    assignedCount: 1,
    assignedInitials: "",
    dueDate: "03/07/2025",
    isPastDue: true,
    isFlagged: true
  }
];

export function DashboardTodosWidget({ todos = DEFAULT_TODOS }: DashboardTodosWidgetProps) {
  return (
    <section className="overflow-hidden rounded-[4px] border border-[#dde2ea] bg-[#fcfcfd]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e7ebf1] px-4 py-3">
        <h2 className="text-[15px] font-semibold text-[#17243b]">To-Do&apos;s</h2>
        <button
          type="button"
          aria-label="Refresh todos"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#56657e] transition hover:bg-[#f2f5f9]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="p-2">
        {todos.length === 0 ? (
          <div className="rounded-[4px] border border-dashed border-[#dde3eb] bg-[#f7f9fb] px-4 py-6 text-center text-sm text-[#64748b]">
            No pending to-dos
          </div>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#75859f]">
              <span>Task</span>
              <span>Assigned</span>
              <span className="w-20 text-center">Due Date</span>
              <span className="w-5" />
              <span className="w-5" />
            </div>
            {todos.map((todo) => (
              <Link
                key={todo.id}
                href="/projects"
                className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-2 rounded-[4px] px-2 py-2 transition hover:bg-[#f8fafc]"
              >
                <span className="truncate text-[13px] text-[#17243b]">{todo.task}</span>
                <div className="flex items-center gap-1">
                  {todo.assignedInitials ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b82f6] text-[10px] font-semibold text-white">
                      {todo.assignedInitials}
                    </span>
                  ) : null}
                  {todo.assignedCount > 0 ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] text-[10px] font-semibold text-white">
                      +{todo.assignedCount}
                    </span>
                  ) : null}
                </div>
                <div className="flex w-20 items-center gap-1 text-[11px] text-[#64748b]">
                  <CalendarIcon />
                  <span>{todo.dueDate}</span>
                </div>
                <div className="flex w-5 items-center justify-center">
                  {todo.isPastDue ? <ClockAlertIcon /> : null}
                </div>
                <div className="flex w-5 items-center justify-center">
                  {todo.isFlagged ? <FlagIcon /> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
