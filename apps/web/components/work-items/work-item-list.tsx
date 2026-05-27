import Link from "next/link";
import type {
  WorkItemKind,
  WorkItemPriority,
  WorkItemStatus
} from "@floorconnector/types";

import type { WorkItemListItem } from "@/lib/work-items/data";
import { buildContextRichWorkItemPreview } from "@/lib/work-items/read-model";

type WorkItemListProps = {
  workItems: WorkItemListItem[];
  returnTo: string;
  completeAction: (formData: FormData) => void | Promise<void>;
  dismissAction: (formData: FormData) => void | Promise<void>;
  emptyTitle: string;
  emptyDescription: string;
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

function formatKind(value: WorkItemKind) {
  switch (value) {
    case "lead_follow_up":
      return "Lead follow-up";
    case "appointment_confirmation_prep":
      return "Appointment confirmation prep";
    case "appointment_follow_up":
      return "Appointment follow-up";
    case "estimate_follow_up":
      return "Estimate follow-up";
    case "invoice_follow_up":
      return "Invoice follow-up";
    case "human_handoff":
      return "Human handoff";
    case "manual":
    default:
      return "Manual";
  }
}

function priorityClasses(priority: WorkItemPriority) {
  switch (priority) {
    case "urgent":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "high":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "low":
      return "border-slate-200 bg-white text-slate-600";
    case "normal":
    default:
      return "border-[#d6d6d6] bg-[#f8f8f8] text-[#2a2a2a]";
  }
}

function statusClasses(status: WorkItemStatus) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "dismissed":
      return "border-slate-200 bg-slate-50 text-slate-600";
    case "open":
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

function dueClasses(dueState: "none" | "upcoming" | "overdue") {
  switch (dueState) {
    case "overdue":
      return "text-rose-700";
    case "upcoming":
      return "text-slate-600";
    case "none":
    default:
      return "text-slate-500";
  }
}

function WorkItemActionButton({
  workItemId,
  returnTo,
  action,
  label
}: {
  workItemId: string;
  returnTo: string;
  action: (formData: FormData) => void | Promise<void>;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="workItemId" value={workItemId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className="inline-flex h-8 items-center justify-center border border-[#d6d6d6] bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f4f4f] transition hover:border-[#d8731f] hover:text-[#171717]"
      >
        {label}
      </button>
    </form>
  );
}

export function WorkItemList({
  workItems,
  returnTo,
  completeAction,
  dismissAction,
  emptyTitle,
  emptyDescription
}: WorkItemListProps) {
  const nowIso = new Date().toISOString();

  return (
    <div className="space-y-3">
      {workItems.length > 0 ? (
        workItems.map((workItem) => {
          const preview = buildContextRichWorkItemPreview(workItem, nowIso);

          return (
            <article
              key={workItem.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {workItem.linkPath ? (
                      <Link
                        href={workItem.linkPath}
                        className="text-sm font-semibold text-slate-950 transition hover:text-brand-700"
                      >
                        {workItem.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-slate-950">
                        {workItem.title}
                      </p>
                    )}
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses(
                        workItem.status
                      )}`}
                    >
                      {labelize(workItem.status)}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${priorityClasses(
                        workItem.priority
                      )}`}
                    >
                      {labelize(workItem.priority)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {formatKind(workItem.kind)} ·{" "}
                    <span className={dueClasses(preview.dueState)}>
                      {preview.dueState === "overdue" ? "Overdue " : ""}
                      {formatDateTime(workItem.dueAt)}
                    </span>
                    {workItem.assignedPerson
                      ? ` · ${workItem.assignedPerson.displayName}`
                      : " · Unassigned"}
                    {workItem.project ? ` · ${workItem.project.name}` : ""}
                    {workItem.customer
                      ? ` · ${workItem.customer.companyName ?? workItem.customer.name}`
                      : ""}
                  </p>

                  {preview.instructionsSummary ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {preview.instructionsSummary}
                    </p>
                  ) : null}

                  {preview.measurementNotes ? (
                    <div className="mt-3 rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Measurement notes
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {preview.measurementNotes}
                      </p>
                    </div>
                  ) : null}

                  {preview.attachmentCount !== null ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {preview.attachmentCount} attachment
                      {preview.attachmentCount === 1 ? "" : "s"}
                    </p>
                  ) : null}
                </div>

                {workItem.status === "open" ? (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <WorkItemActionButton
                      workItemId={workItem.id}
                      returnTo={returnTo}
                      action={completeAction}
                      label="Complete"
                    />
                    <WorkItemActionButton
                      workItemId={workItem.id}
                      returnTo={returnTo}
                      action={dismissAction}
                      label="Dismiss"
                    />
                  </div>
                ) : null}
              </div>
            </article>
          );
        })
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5">
          <p className="text-sm font-semibold text-slate-950">{emptyTitle}</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {emptyDescription}
          </p>
        </div>
      )}
    </div>
  );
}
