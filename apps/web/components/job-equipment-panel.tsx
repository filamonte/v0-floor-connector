"use client";

import Link from "next/link";

import { AuthSubmitButton } from "@/components/auth-submit-button";
import { QuickCreateFormShell } from "@/components/quick-create-form-shell";
import type {
  EquipmentAssignmentListItem,
  JobEquipmentReadinessSummary,
  SelectableEquipmentAsset
} from "@/lib/equipment/data";
import {
  equipmentAssignmentStatusesList,
  equipmentTypesList
} from "@/lib/equipment/schemas";
import type { JobEquipmentRequirement } from "@floorconnector/types";

type JobEquipmentPanelProps = {
  jobId: string;
  projectId: string;
  redirectTo?: string | null;
  requirements: JobEquipmentRequirement[];
  assignments: EquipmentAssignmentListItem[];
  selectableAssets: SelectableEquipmentAsset[];
  readinessSummary: JobEquipmentReadinessSummary;
  addRequirementAction: (formData: FormData) => void | Promise<void>;
  removeRequirementAction: (formData: FormData) => void | Promise<void>;
  assignEquipmentAction: (formData: FormData) => void | Promise<void>;
  cancelAssignmentAction: (formData: FormData) => void | Promise<void>;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString() : null;
}

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : null;
}

function HiddenContext({
  jobId,
  projectId,
  redirectTo
}: {
  jobId: string;
  projectId: string;
  redirectTo?: string | null;
}) {
  return (
    <>
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="projectId" value={projectId} />
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}
    </>
  );
}

export function JobEquipmentPanel({
  jobId,
  projectId,
  redirectTo,
  requirements,
  assignments,
  selectableAssets,
  readinessSummary,
  addRequirementAction,
  removeRequirementAction,
  assignEquipmentAction,
  cancelAssignmentAction
}: JobEquipmentPanelProps) {
  const activeAssignments = assignments.filter(
    (assignment) => assignment.assignmentStatus !== "canceled"
  );
  const hasSelectableAssets = selectableAssets.length > 0;

  return (
    <div className="space-y-6">
      {readinessSummary.warnings.length > 0 ? (
        <div className="grid gap-3">
          {readinessSummary.warnings.slice(0, 4).map((warning) => (
            <div
              key={warning.id}
              className={[
                "rounded-[6px] border px-4 py-3 text-sm leading-6",
                warning.severity === "critical"
                  ? "border-amber-200 bg-amber-50 text-amber-950"
                  : "border-[var(--border-warm)] bg-[var(--highlight)] text-[var(--text-secondary)]"
              ].join(" ")}
            >
              <p className="font-semibold">{warning.title}</p>
              <p className="mt-1">{warning.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[6px] border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          No equipment warnings are currently derived for this job. This is
          advisory context only; scheduling behavior remains unchanged.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <form action={addRequirementAction} className="space-y-4">
          <HiddenContext
            jobId={jobId}
            projectId={projectId}
            redirectTo={redirectTo}
          />
          <QuickCreateFormShell
            eyebrow="Job equipment"
            title="Add requirement"
            description="Define equipment types needed for this job without changing schedule gates."
            footer="Requirements are warning inputs only in this slice."
          >
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Equipment type
                </span>
                <select
                  name="equipmentType"
                  defaultValue="grinder"
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                >
                  {equipmentTypesList.map((type) => (
                    <option key={type} value={type}>
                      {formatLabel(type)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Quantity
                  </span>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    defaultValue="1"
                    className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                  />
                </label>

                <label className="flex items-end gap-3 rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    name="required"
                    defaultChecked
                    className="h-4 w-4 rounded border-[var(--border-warm)]"
                  />
                  Required equipment
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Notes
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                />
              </label>
            </div>
          </QuickCreateFormShell>

          <AuthSubmitButton pendingLabel="Adding requirement...">
            <span>Add requirement</span>
          </AuthSubmitButton>
        </form>

        <form action={assignEquipmentAction} className="space-y-4">
          <HiddenContext
            jobId={jobId}
            projectId={projectId}
            redirectTo={redirectTo}
          />
          <QuickCreateFormShell
            eyebrow="Equipment assignment"
            title="Assign asset"
            description="Attach a registry asset to this job for advisory readiness and conflict warnings."
            footer="Maintenance, utilization, costing, and portal exposure remain deferred."
          >
            <div className="grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Equipment asset
                </span>
                <select
                  name="equipmentAssetId"
                  defaultValue=""
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                  disabled={!hasSelectableAssets}
                >
                  <option value="">
                    {hasSelectableAssets
                      ? "Select equipment"
                      : "No assignable equipment available"}
                  </option>
                  {selectableAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} / {formatLabel(asset.equipmentType)}
                      {asset.assetTag ? ` / ${asset.assetTag}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Assigned date
                  </span>
                  <input
                    type="date"
                    name="assignedDate"
                    className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Status
                  </span>
                  <select
                    name="assignmentStatus"
                    defaultValue="planned"
                    className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                  >
                    {equipmentAssignmentStatusesList
                      .filter((status) => status !== "canceled")
                      .map((status) => (
                        <option key={status} value={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Scheduled start
                  </span>
                  <input
                    type="datetime-local"
                    name="scheduledStartAt"
                    className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                    Scheduled end
                  </span>
                  <input
                    type="datetime-local"
                    name="scheduledEndAt"
                    className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[var(--text-primary)]">
                  Notes
                </span>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--copper)]"
                />
              </label>
            </div>
          </QuickCreateFormShell>

          <AuthSubmitButton
            pendingLabel="Assigning equipment..."
            disabled={!hasSelectableAssets}
          >
            <span>Assign equipment</span>
          </AuthSubmitButton>
        </form>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[6px] border border-[var(--border-warm)] bg-white">
          <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Requirements
            </p>
          </div>
          <div className="divide-y divide-[var(--border-warm)]">
            {requirements.length > 0 ? (
              requirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {requirement.quantity}{" "}
                      {formatLabel(requirement.equipmentType)}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                      {requirement.required ? "Required" : "Optional"}
                    </p>
                    {requirement.notes ? (
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                        {requirement.notes}
                      </p>
                    ) : null}
                  </div>
                  <form action={removeRequirementAction}>
                    <HiddenContext
                      jobId={jobId}
                      projectId={projectId}
                      redirectTo={redirectTo}
                    />
                    <input
                      type="hidden"
                      name="requirementId"
                      value={requirement.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                No equipment requirements are tracked for this job yet.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[6px] border border-[var(--border-warm)] bg-white">
          <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">
              Assigned equipment
            </p>
          </div>
          <div className="divide-y divide-[var(--border-warm)]">
            {activeAssignments.length > 0 ? (
              activeAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {assignment.asset ? (
                        <Link
                          href={`/equipment/${assignment.asset.id}`}
                          className="hover:text-[var(--copper)]"
                        >
                          {assignment.asset.name}
                        </Link>
                      ) : (
                        "Unknown equipment"
                      )}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
                      {formatLabel(assignment.assignmentStatus)}
                      {assignment.asset
                        ? ` / ${formatLabel(assignment.asset.equipmentType)}`
                        : ""}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      {formatDate(assignment.assignedDate) ??
                        formatDateTime(assignment.scheduledStartAt) ??
                        "No assignment window set"}
                      {assignment.scheduledEndAt
                        ? ` to ${formatDateTime(assignment.scheduledEndAt)}`
                        : ""}
                    </p>
                  </div>
                  <form action={cancelAssignmentAction}>
                    <HiddenContext
                      jobId={jobId}
                      projectId={projectId}
                      redirectTo={redirectTo}
                    />
                    <input
                      type="hidden"
                      name="assignmentId"
                      value={assignment.id}
                    />
                    <input
                      type="hidden"
                      name="equipmentAssetId"
                      value={assignment.equipmentAssetId}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)] transition hover:bg-[var(--highlight)]"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                No active equipment assignments are attached yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
