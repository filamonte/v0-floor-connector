export type ScheduleViewKey =
  | "all"
  | "unscheduled"
  | "scheduled"
  | "today"
  | "upcoming"
  | "in_progress"
  | "completed";
export type CrewViewKey = "all" | "assigned" | "unassigned";
export type ScheduleLayoutKey = "week" | "day" | "board";
export type ScheduleActionKey = "schedule" | "assign";
export type ScheduleItemViewKey = "all" | "jobs" | "appointments";

export type ScheduleHrefInput = {
  q?: string;
  projectId?: string;
  view?: ScheduleViewKey;
  crew?: CrewViewKey;
  layout?: ScheduleLayoutKey;
  item?: ScheduleItemViewKey;
  date?: string;
  action?: ScheduleActionKey;
  jobId?: string;
};

export function buildScheduleSearchParams(input: ScheduleHrefInput) {
  const searchParams = new URLSearchParams();

  if (input.q && input.q.trim().length > 0) {
    searchParams.set("q", input.q.trim());
  }

  if (input.projectId) {
    searchParams.set("projectId", input.projectId);
  }

  if (input.view && input.view !== "all") {
    searchParams.set("view", input.view);
  }

  if (input.crew && input.crew !== "all") {
    searchParams.set("crew", input.crew);
  }

  if (input.layout && input.layout !== "week") {
    searchParams.set("layout", input.layout);
  }

  if (input.item && input.item !== "all") {
    searchParams.set("item", input.item);
  }

  if (input.date) {
    searchParams.set("date", input.date);
  }

  if (input.action) {
    searchParams.set("action", input.action);
  }

  if (input.jobId) {
    searchParams.set("jobId", input.jobId);
  }

  return searchParams;
}

export function buildScheduleHref(input: ScheduleHrefInput) {
  const query = buildScheduleSearchParams(input).toString();
  return query.length > 0 ? `/schedule?${query}` : "/schedule";
}
