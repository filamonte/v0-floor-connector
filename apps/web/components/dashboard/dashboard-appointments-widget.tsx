"use client";

import Link from "next/link";

type Appointment = {
  id: string;
  date: string;
  dateLabel: string;
  subject: string;
  time: string;
};

type DashboardAppointmentsWidgetProps = {
  appointments?: Appointment[];
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

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4 text-[#64748b]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 1.5" />
    </svg>
  );
}

const DEFAULT_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    date: "29",
    dateLabel: "Wed",
    subject: "Eric/Steve",
    time: "01:00 PM"
  }
];

export function DashboardAppointmentsWidget({
  appointments = DEFAULT_APPOINTMENTS
}: DashboardAppointmentsWidgetProps) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-[#17243b]">Appointments</h2>
        <button
          type="button"
          aria-label="Refresh appointments"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-[#94a3b8] transition hover:text-[#64748b]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="px-3 pb-3">
        {appointments.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#94a3b8]">
            No upcoming appointments
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((appointment) => (
              <Link
                key={appointment.id}
                href="/schedule"
                className="flex items-center gap-3 rounded-md p-2 transition hover:bg-[#fafafa]"
              >
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-md bg-[#ea580c] text-white">
                  <span className="text-sm font-bold leading-none">{appointment.date}</span>
                  <span className="text-[8px] uppercase tracking-wider">{appointment.dateLabel}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-medium text-[#17243b]">
                    {appointment.subject}
                  </span>
                  <span className="text-[11px] text-[#94a3b8]">{appointment.time}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
