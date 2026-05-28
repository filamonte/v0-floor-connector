import Link from "next/link";

import { AssignedJobContextCard } from "@/components/field/assigned-job-context-card";
import { listExecutionAttachmentsBySubjects } from "@/lib/execution-attachments/data";
import { listAssignedFieldWorkForCurrentUser } from "@/lib/field/assigned-work-data";
import {
  buildFieldAssignedWorkQueue,
  type FieldAssignedWorkGroupKey
} from "@/lib/field/assigned-work-read-model";
import { listAssignedWorkItemsForCurrentUser } from "@/lib/work-items/data";
import {
  getWorkItemFieldState,
  getWorkItemMeasurementNotes,
  groupMobileAssignedWorkItems,
  type MobileAssignedWorkItemGroupKey
} from "@/lib/work-items/read-model";

const groupCopy: Record<
  MobileAssignedWorkItemGroupKey,
  { title: string; description: string }
> = {
  blocked: {
    title: "Blocked",
    description: "Open items waiting on a field decision or missing condition."
  },
  overdue: {
    title: "Overdue",
    description: "Open assigned work past its due time."
  },
  today: {
    title: "Today",
    description: "Assigned work due today."
  },
  upcoming: {
    title: "Upcoming",
    description: "Assigned work without a same-day due time."
  },
  completed: {
    title: "Recently completed",
    description: "Completed assigned work kept here for field reference."
  }
};

const assignedJobGroupCopy: Record<
  FieldAssignedWorkGroupKey,
  { title: string; description: string }
> = {
  today: {
    title: "Today",
    description: "Assigned canonical jobs scheduled for today or in progress."
  },
  upcoming: {
    title: "Upcoming",
    description: "Assigned scheduled jobs inside the next two weeks."
  },
  unscheduled: {
    title: "Assigned, unscheduled",
    description: "Assigned jobs without a scheduled date yet."
  },
  recentlyCompleted: {
    title: "Recently completed",
    description: "Completed assigned jobs kept here for field continuity."
  }
};

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function getContextLabel(input: {
  customerName: string | null;
  projectName: string | null;
  sourceType: string | null;
}) {
  return [
    input.customerName,
    input.projectName,
    input.sourceType ? labelize(input.sourceType) : null
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function FieldWorkItemsPage() {
  const [{ currentPerson, workItems }, assignedFieldWork] = await Promise.all([
    listAssignedWorkItemsForCurrentUser("/field/work-items"),
    listAssignedFieldWorkForCurrentUser("/field/work-items")
  ]);
  const attachments = await listExecutionAttachmentsBySubjects(
    workItems.map((workItem) => ({
      subjectType: "work_item" as const,
      subjectId: workItem.id
    })),
    "/field/work-items"
  );
  const attachmentCountByWorkItemId = attachments.reduce<
    Record<string, number>
  >(
    (counts, attachment) => ({
      ...counts,
      [attachment.subjectId]: (counts[attachment.subjectId] ?? 0) + 1
    }),
    {}
  );
  const groups = groupMobileAssignedWorkItems({
    workItems,
    nowIso: new Date().toISOString(),
    completedLimit: 8
  });
  const assignedJobGroups = buildFieldAssignedWorkQueue({
    jobs: assignedFieldWork.jobs,
    today: new Date()
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Field work
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
              My Work Items
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Assigned internal work with notes, measurements, and evidence for
              the field. Work Item evidence is not visible to the customer
              portal.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-[6px] border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-[#d8731f] hover:text-slate-950"
          >
            Dashboard
          </Link>
        </div>
      </section>

      {!currentPerson ? (
        <section className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5">
          <h2 className="text-base font-semibold text-slate-950">
            No linked field assignee
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your user is not linked to an active assignable people record yet,
            so assigned Work Items cannot be shown safely.
          </p>
        </section>
      ) : null}

      {currentPerson ? (
        <div className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Assigned Jobs
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Read-only schedule and execution context from canonical jobs,
                  crew assignments, Daily Logs, Field Notes, and time cards.
                </p>
              </div>
              <span className="rounded-[6px] border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
                {assignedFieldWork.jobs.length}
              </span>
            </div>

            <div className="mt-4 space-y-4">
              {(
                [
                  "today",
                  "upcoming",
                  "unscheduled",
                  "recentlyCompleted"
                ] as const
              ).map((groupKey) => {
                const jobs = assignedJobGroups[groupKey];
                const copy = assignedJobGroupCopy[groupKey];

                return (
                  <div key={groupKey}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">
                          {copy.title}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {copy.description}
                        </p>
                      </div>
                      <span className="rounded-[6px] border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        {jobs.length}
                      </span>
                    </div>

                    {jobs.length > 0 ? (
                      <ul className="mt-3 space-y-2">
                        {jobs.map((job) => (
                          <li key={job.id}>
                            <AssignedJobContextCard
                              job={job}
                              currentPersonId={currentPerson.id}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                        No assigned jobs in this group.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {(
            ["blocked", "overdue", "today", "upcoming", "completed"] as const
          ).map((groupKey) => {
            const items = groups[groupKey];
            const copy = groupCopy[groupKey];

            return (
              <section
                key={groupKey}
                className="rounded-lg border border-slate-200 bg-white px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      {copy.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {copy.description}
                    </p>
                  </div>
                  <span className="rounded-[6px] border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
                    {items.length}
                  </span>
                </div>

                {items.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {items.map((workItem) => {
                      const attachmentCount =
                        attachmentCountByWorkItemId[workItem.id] ??
                        (typeof workItem.metadata.attachmentCount === "number"
                          ? workItem.metadata.attachmentCount
                          : 0);
                      const measurementNotes =
                        getWorkItemMeasurementNotes(workItem);
                      const fieldState = getWorkItemFieldState(workItem);
                      const contextLabel = getContextLabel({
                        customerName:
                          workItem.customer?.companyName ??
                          workItem.customer?.name ??
                          null,
                        projectName: workItem.project?.name ?? null,
                        sourceType: workItem.sourceType
                      });

                      return (
                        <li key={workItem.id}>
                          <Link
                            href={`/field/work-items/${workItem.id}`}
                            className="block rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 transition hover:border-[#d8731f] hover:bg-white"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-950">
                                  {workItem.title}
                                </p>
                                {contextLabel ? (
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {contextLabel}
                                  </p>
                                ) : null}
                              </div>
                              <span className="shrink-0 rounded-[6px] border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                {labelize(workItem.priority)}
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                              <span>{labelize(fieldState)}</span>
                              <span>{formatDateTime(workItem.dueAt)}</span>
                              <span>
                                {attachmentCount} evidence file
                                {attachmentCount === 1 ? "" : "s"}
                              </span>
                              {measurementNotes ? (
                                <span>Measurements</span>
                              ) : null}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    No assigned Work Items in this group.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}
