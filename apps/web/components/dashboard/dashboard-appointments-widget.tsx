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
    <section className="overflow-hidden rounded-[4px] border border-[#dde2ea] bg-[#fcfcfd]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e7ebf1] px-4 py-3">
        <h2 className="text-[15px] font-semibold text-[#17243b]">My Appointments</h2>
        <button
          type="button"
          aria-label="Refresh appointments"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#56657e] transition hover:bg-[#f2f5f9]"
        >
          <RefreshIcon />
        </button>
      </div>

      <div className="p-3">
        {appointments.length === 0 ? (
          <div className="rounded-[4px] border border-dashed border-[#dde3eb] bg-[#f7f9fb] px-4 py-6 text-center text-sm text-[#64748b]">
            No upcoming appointments
          </div>
        ) : (
          <div className="divide-y divide-[#edf0f4]">
            <div className="grid grid-cols-[auto_1fr_auto] gap-3 px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#75859f]">
              <span>Date</span>
              <span>Subject</span>
              <span>Time</span>
            </div>
            {appointments.map((appointment) => (
              <Link
                key={appointment.id}
                href="/schedule"
                className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[4px] px-1 py-2 transition hover:bg-[#f8fafc]"
              >
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded-[4px] bg-[#ea580c] text-white">
                  <span className="text-[14px] font-bold leading-none">{appointment.date}</span>
                  <span className="text-[9px] uppercase">{appointment.dateLabel}</span>
                </div>
                <span className="truncate text-[13px] font-medium text-[#17243b]">
                  {appointment.subject}
                </span>
                <div className="flex items-center gap-1 text-[12px] text-[#64748b]">
                  <ClockIcon />
                  <span>{appointment.time}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
