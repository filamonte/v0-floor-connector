"use client";

import { useState } from "react";

type DashboardCalendarWidgetProps = {
  highlightedDates?: number[];
};

function ChevronLeftIcon() {
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
      <path d="m12 15-5-5 5-5" />
    </svg>
  );
}

function ChevronRightIcon() {
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
      <path d="m8 5 5 5-5 5" />
    </svg>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export function DashboardCalendarWidget({
  highlightedDates = [5, 6, 15, 19]
}: DashboardCalendarWidgetProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const todayDate = today.getDate();
  const isCurrentMonth =
    today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  function goToPreviousMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <section className="overflow-hidden rounded-[4px] border border-[#dde2ea] bg-[#fcfcfd]">
      <div className="flex items-center justify-between gap-2 border-b border-[#e7ebf1] px-3 py-2">
        <button
          type="button"
          onClick={goToPreviousMonth}
          aria-label="Previous month"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#56657e] transition hover:bg-[#f2f5f9]"
        >
          <ChevronLeftIcon />
        </button>
        <h2 className="text-[14px] font-semibold text-[#17243b]">{monthName}</h2>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Next month"
          className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#56657e] transition hover:bg-[#f2f5f9]"
        >
          <ChevronRightIcon />
        </button>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#75859f]">
          {WEEKDAYS.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-7" />;
            }

            const isToday = isCurrentMonth && day === todayDate;
            const isHighlighted = highlightedDates.includes(day);

            return (
              <button
                key={day}
                type="button"
                className={[
                  "flex h-7 w-full items-center justify-center rounded-[4px] text-[12px] font-medium transition",
                  isToday
                    ? "bg-[#111111] text-white"
                    : isHighlighted
                      ? "bg-[#ea580c] text-white"
                      : "text-[#334155] hover:bg-[#f2f5f9]"
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
