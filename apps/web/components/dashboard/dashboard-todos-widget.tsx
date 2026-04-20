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
    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-[#17243b]">To-Do&apos;s</h2>
        <button
          type="button"
          aria-label="Refresh todos"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[#94a3b8] transition hover:text-[#64748b]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="px-3 pb-3">
        {todos.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#94a3b8]">
            No pending to-dos
          </div>
        ) : (
          <div className="space-y-0.5">
            {todos.slice(0, 5).map((todo) => (
              <Link
                key={todo.id}
                href="/projects"
                className="flex items-center gap-2 rounded px-2 py-1.5 transition hover:bg-[#fafafa]"
              >
                <span className="min-w-0 flex-1 truncate text-[12px] text-[#17243b]">{todo.task}</span>
                <div className="flex items-center gap-1">
                  {todo.assignedInitials ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3b82f6] text-[9px] font-semibold text-white">
                      {todo.assignedInitials}
                    </span>
                  ) : null}
                  {todo.isPastDue ? <ClockAlertIcon /> : null}
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
