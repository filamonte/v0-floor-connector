import Link from "next/link";
import { notFound } from "next/navigation";

import {
  completeAssignedWorkItemAction,
  updateAssignedWorkItemFieldStateAction
} from "@/lib/work-items/actions";
import {
  listExecutionAttachmentsBySubject,
  resolveExecutionAttachmentPreviews
} from "@/lib/execution-attachments/data";
import { getAssignedWorkItemForCurrentUser } from "@/lib/work-items/data";
import {
  getWorkItemBlockerReason,
  getWorkItemCompletionNote,
  getWorkItemFieldState,
  getWorkItemMeasurementNotes
} from "@/lib/work-items/read-model";

type FieldWorkItemDetailPageProps = {
  params: Promise<{
    workItemId: string;
  }>;
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

function contextRows(input: {
  customerName: string | null;
  projectName: string | null;
  assigneeName: string | null;
  sourceType: string | null;
  dueAt: string | null;
  priority: string;
  status: string;
}) {
  return [
    { label: "Customer", value: input.customerName },
    { label: "Project", value: input.projectName },
    { label: "Assignee", value: input.assigneeName },
    {
      label: "Source",
      value: input.sourceType ? labelize(input.sourceType) : null
    },
    { label: "Due", value: formatDateTime(input.dueAt) },
    { label: "Priority", value: labelize(input.priority) },
    { label: "Status", value: labelize(input.status) }
  ].filter((row) => row.value);
}

function FieldStateButton({
  workItemId,
  returnTo,
  fieldState,
  label
}: {
  workItemId: string;
  returnTo: string;
  fieldState: "not_started" | "in_progress";
  label: string;
}) {
  return (
    <form action={updateAssignedWorkItemFieldStateAction}>
      <input type="hidden" name="workItemId" value={workItemId} />
      <input type="hidden" name="fieldState" value={fieldState} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <button
        type="submit"
        className="inline-flex h-10 w-full items-center justify-center rounded-[6px] border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-[#d8731f] hover:text-slate-950 sm:w-auto"
      >
        {label}
      </button>
    </form>
  );
}

export default async function FieldWorkItemDetailPage({
  params
}: FieldWorkItemDetailPageProps) {
  const { workItemId } = await params;
  const returnTo = `/field/work-items/${workItemId}`;
  const { currentPerson, workItem, canAct } =
    await getAssignedWorkItemForCurrentUser(workItemId, returnTo);

  if (!workItem || !canAct) {
    notFound();
  }

  const attachments = await listExecutionAttachmentsBySubject(
    "work_item",
    workItem.id,
    returnTo
  );
  const evidence = await resolveExecutionAttachmentPreviews(
    attachments,
    returnTo
  );
  const measurementNotes = getWorkItemMeasurementNotes(workItem);
  const fieldState = getWorkItemFieldState(workItem);
  const blockerReason = getWorkItemBlockerReason(workItem);
  const completionNote = getWorkItemCompletionNote(workItem);
  const rows = contextRows({
    customerName:
      workItem.customer?.companyName ?? workItem.customer?.name ?? null,
    projectName: workItem.project?.name ?? null,
    assigneeName: workItem.assignedPerson?.displayName ?? null,
    sourceType: workItem.sourceType,
    dueAt: workItem.dueAt,
    priority: workItem.priority,
    status: fieldState
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              href="/field/work-items"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9b4f16] transition hover:text-slate-950"
            >
              My Work Items
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              {workItem.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Internal assignment for field execution. Notes and evidence here
              are not visible to the customer portal.
            </p>
          </div>
          {workItem.linkPath ? (
            <Link
              href={workItem.linkPath}
              className="inline-flex h-10 items-center justify-center rounded-[6px] border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-[#d8731f] hover:text-slate-950"
            >
              Open source
            </Link>
          ) : null}
        </div>

        {currentPerson ? (
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Signed in as {currentPerson.displayName}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
        <h2 className="text-base font-semibold text-slate-950">Context</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {row.label}
              </dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
        <h2 className="text-base font-semibold text-slate-950">Instructions</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {workItem.description ?? "No instructions were added."}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
        <h2 className="text-base font-semibold text-slate-950">
          Measurement Notes
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {measurementNotes ?? "No measurement notes were added."}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Internal Evidence
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Current-condition photos and files use attachment-id signed
              previews. Raw storage paths are not shown.
            </p>
          </div>
          <span className="rounded-[6px] border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
            {evidence.length} file{evidence.length === 1 ? "" : "s"}
          </span>
        </div>

        {evidence.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {evidence.map((attachment) => (
              <li
                key={attachment.id}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {attachment.caption ?? attachment.fileName}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {attachment.preview.statusLabel}
                    </p>
                  </div>
                  {attachment.preview.signedUrl ? (
                    <a
                      href={attachment.preview.signedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#2a211c] bg-[#2a211c] px-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#3a2d25]"
                    >
                      {attachment.preview.actionLabel}
                    </a>
                  ) : (
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {attachment.preview.unavailableLabel}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
            No Work Item evidence is attached yet.
          </p>
        )}
      </section>

      {blockerReason || completionNote ? (
        <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Field Handoff
          </h2>
          {blockerReason ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              Blocked: {blockerReason}
            </p>
          ) : null}
          {completionNote ? (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              Completed: {completionNote}
            </p>
          ) : null}
        </section>
      ) : null}

      {workItem.status === "open" ? (
        <section className="rounded-lg border border-slate-200 bg-white px-4 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Update Status
          </h2>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <FieldStateButton
              workItemId={workItem.id}
              returnTo={returnTo}
              fieldState="in_progress"
              label="Start work"
            />
            <FieldStateButton
              workItemId={workItem.id}
              returnTo={returnTo}
              fieldState="not_started"
              label="Reset open"
            />
          </div>

          <form
            action={updateAssignedWorkItemFieldStateAction}
            className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <input type="hidden" name="workItemId" value={workItem.id} />
            <input type="hidden" name="fieldState" value="blocked" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Blocker note
              <textarea
                name="blockerReason"
                rows={3}
                maxLength={1000}
                defaultValue={blockerReason ?? ""}
                className="mt-2 block w-full rounded-[6px] border border-slate-300 bg-white px-3 py-2 text-sm normal-case leading-6 tracking-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
                placeholder="What is preventing completion?"
              />
            </label>
            <button
              type="submit"
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[6px] border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-[#d8731f] hover:text-slate-950 sm:w-auto"
            >
              Mark blocked
            </button>
          </form>

          <form
            action={completeAssignedWorkItemAction}
            className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <input type="hidden" name="workItemId" value={workItem.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Completion note
              <textarea
                name="completionNote"
                rows={3}
                maxLength={2000}
                className="mt-2 block w-full rounded-[6px] border border-slate-300 bg-white px-3 py-2 text-sm normal-case leading-6 tracking-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#d8731f]"
                placeholder="What was completed or measured?"
              />
            </label>
            <button
              type="submit"
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[6px] border border-[#2a211c] bg-[#2a211c] px-3 text-sm font-semibold text-white transition hover:bg-[#3a2d25] sm:w-auto"
            >
              Mark done
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
