import Link from "next/link";
import { notFound } from "next/navigation";
import type { AssessmentSpace } from "@floorconnector/types";

import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import {
  createAssessmentSpaceAction,
  updateAssessmentSpaceAction
} from "@/lib/projects/assessment-space-actions";
import {
  assessmentSpaceTypes,
  deriveAssessmentSpacePackageSummary,
  formatAssessmentSpaceTypeLabel
} from "@/lib/projects/assessment-space";
import { listAssessmentSpacesByPackage } from "@/lib/projects/assessment-space-data";
import {
  updateAssessmentPackageAction,
  updateAssessmentPackageStatusAction
} from "@/lib/projects/assessment-package-actions";
import {
  assessmentPackageStatuses,
  formatAssessmentPackageStatusLabel
} from "@/lib/projects/assessment-package";
import { getAssessmentPackageById } from "@/lib/projects/assessment-package-data";
import { getProjectById } from "@/lib/projects/data";

type AssessmentPackageDetailPageProps = {
  params: Promise<{
    projectId: string;
    assessmentPackageId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Not captured";
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function TextField({
  name,
  label,
  defaultValue,
  required = false
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-[var(--text-primary)]">
      {label}
      <input
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-2 w-full rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextAreaField({
  name,
  label,
  defaultValue
}: {
  name: string;
  label: string;
  defaultValue: string | null;
}) {
  return (
    <label className="block text-sm font-medium text-[var(--text-primary)]">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={4}
        className="mt-2 w-full rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm leading-6"
      />
    </label>
  );
}

function SpaceTypeSelect({ defaultValue }: { defaultValue: string }) {
  return (
    <select
      name="spaceType"
      defaultValue={defaultValue}
      className="mt-2 w-full rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm capitalize"
    >
      {assessmentSpaceTypes.map((spaceType) => (
        <option key={spaceType} value={spaceType}>
          {formatAssessmentSpaceTypeLabel(spaceType)}
        </option>
      ))}
    </select>
  );
}

function AssessmentSpaceFields({
  assessmentSpace
}: {
  assessmentSpace?: AssessmentSpace;
}) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        <TextField
          name="name"
          label="Name"
          defaultValue={assessmentSpace?.name ?? ""}
          required
        />
        <label className="block text-sm font-medium text-[var(--text-primary)]">
          Type
          <SpaceTypeSelect
            defaultValue={assessmentSpace?.spaceType ?? "area"}
          />
        </label>
        <TextField
          name="floorLevel"
          label="Floor level"
          defaultValue={assessmentSpace?.floorLevel ?? ""}
        />
        <TextField
          name="lengthFeet"
          label="Length"
          defaultValue={assessmentSpace?.lengthFeet ?? ""}
        />
        <TextField
          name="widthFeet"
          label="Width"
          defaultValue={assessmentSpace?.widthFeet ?? ""}
        />
        <TextField
          name="squareFeet"
          label="Square feet"
          defaultValue={assessmentSpace?.squareFeet ?? ""}
        />
        <TextField
          name="perimeterFeet"
          label="Perimeter feet"
          defaultValue={assessmentSpace?.perimeterFeet ?? ""}
        />
        <TextField
          name="substrate"
          label="Substrate"
          defaultValue={assessmentSpace?.substrate ?? ""}
        />
        <TextField
          name="currentFlooring"
          label="Current flooring"
          defaultValue={assessmentSpace?.currentFlooring ?? ""}
        />
        <TextField
          name="sortOrder"
          label="Sort order"
          defaultValue={String(assessmentSpace?.sortOrder ?? 0)}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextAreaField
          name="conditionSummary"
          label="Condition summary"
          defaultValue={assessmentSpace?.conditionSummary ?? ""}
        />
        <TextAreaField
          name="prepNotes"
          label="Prep notes"
          defaultValue={assessmentSpace?.prepNotes ?? ""}
        />
        <TextAreaField
          name="moistureNotes"
          label="Moisture notes"
          defaultValue={assessmentSpace?.moistureNotes ?? ""}
        />
        <TextAreaField
          name="accessNotes"
          label="Access notes"
          defaultValue={assessmentSpace?.accessNotes ?? ""}
        />
      </div>
    </>
  );
}

export default async function AssessmentPackageDetailPage({
  params,
  searchParams
}: AssessmentPackageDetailPageProps) {
  const { projectId, assessmentPackageId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [project, assessmentPackage, assessmentSpaces] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    getAssessmentPackageById({ projectId, assessmentPackageId }),
    listAssessmentSpacesByPackage({ projectId, assessmentPackageId })
  ]);

  if (!project || !assessmentPackage) {
    notFound();
  }

  const assessmentSpaceSummary =
    deriveAssessmentSpacePackageSummary(assessmentSpaces);
  const capturedContextRows = [
    {
      label: "Assessment date",
      captured: hasText(assessmentPackage.assessmentDate),
      detail: assessmentPackage.assessmentDate ?? "Not captured"
    },
    {
      label: "Site contact",
      captured:
        hasText(assessmentPackage.siteContactName) ||
        hasText(assessmentPackage.siteContactPhone),
      detail:
        [assessmentPackage.siteContactName, assessmentPackage.siteContactPhone]
          .filter(hasText)
          .join(" / ") || "Not captured"
    },
    {
      label: "Access and parking",
      captured:
        hasText(assessmentPackage.accessNotes) ||
        hasText(assessmentPackage.parkingNotes),
      detail:
        hasText(assessmentPackage.accessNotes) ||
        hasText(assessmentPackage.parkingNotes)
          ? "Captured"
          : "Not captured"
    },
    {
      label: "Customer goals",
      captured: hasText(assessmentPackage.customerGoals),
      detail: assessmentPackage.customerGoals ?? "Not captured"
    },
    {
      label: "Current conditions",
      captured: hasText(assessmentPackage.currentConditionsSummary),
      detail: assessmentPackage.currentConditionsSummary ?? "Not captured"
    },
    {
      label: "Recommended system",
      captured: hasText(assessmentPackage.recommendedSystemSummary),
      detail: assessmentPackage.recommendedSystemSummary ?? "Not captured"
    },
    {
      label: "Estimate handoff",
      captured: hasText(assessmentPackage.estimateHandoffSummary),
      detail: assessmentPackage.estimateHandoffSummary ?? "Not captured"
    }
  ];
  const capturedContextCount = capturedContextRows.filter(
    (row) => row.captured
  ).length;
  const assessmentMissingRows = [
    ...capturedContextRows
      .filter((row) => !row.captured)
      .map((row) => row.label),
    ...(assessmentSpaceSummary.total === 0 ? ["Areas / spaces"] : []),
    ...(assessmentSpaceSummary.measuredCount === 0 ? ["Measured spaces"] : [])
  ];
  const nextAssessmentAction =
    assessmentPackage.status === "ready_for_estimate"
      ? "Open estimate workspace or keep project handoff context current."
      : assessmentSpaceSummary.total === 0
        ? "Add the first area or space before estimator handoff."
        : assessmentMissingRows.length > 0
          ? "Complete missing assessment context before estimator handoff."
          : "Move package toward ready for estimate when estimator review is complete.";

  return (
    <div className="space-y-8">
      <DetailPageHeader
        eyebrow="Assessment Package"
        title={assessmentPackage.title}
        description="Project-owned assessment context for estimator handoff. Customer, project, estimate, job, field, material, and workflow truth remains on the canonical records that already own it."
        backHref={`/projects/${project.id}`}
        backLabel="Back to project"
        actions={
          <Link
            href={`/projects/${project.id}`}
            className={secondaryActionClassName}
          >
            Open Project Workspace
          </Link>
        }
      />

      {resolvedSearchParams.error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-800">
          {resolvedSearchParams.error}
        </div>
      ) : null}

      {resolvedSearchParams.message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800">
          {resolvedSearchParams.message}
        </div>
      ) : null}

      <section
        id="assessment-workspace-command"
        className="border border-[#d1d6de] bg-white"
      >
        <div className="border-b border-[#d1d6de] bg-[#f7f8fa] px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#005EB8]">
                Assessment Workspace
              </p>
              <h2 className="mt-2 text-[22px] font-semibold leading-7 text-slate-950">
                Captured context, measurement coverage, and estimator handoff.
              </h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
                This command view summarizes the package without changing the
                underlying assessment, area/space, measurement, or estimate
                handoff records.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/projects/${project.id}`}
                className={secondaryActionClassName}
              >
                Open Project Workspace
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#d1d6de] px-5 py-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Package status",
              value: formatAssessmentPackageStatusLabel(
                assessmentPackage.status
              ),
              detail: "Stored assessment package status"
            },
            {
              label: "Captured fields",
              value: `${capturedContextCount}/${capturedContextRows.length}`,
              detail: "Notes, contacts, context, and handoff fields"
            },
            {
              label: "Areas / spaces",
              value: String(assessmentSpaceSummary.total),
              detail: `${assessmentSpaceSummary.measuredCount} measured`
            },
            {
              label: "Measured quantity",
              value: `${assessmentSpaceSummary.totalSquareFeet.toFixed(2)} sq ft`,
              detail: `${assessmentSpaceSummary.totalPerimeterFeet.toFixed(
                2
              )} perimeter ft`
            }
          ].map((item) => (
            <div
              key={item.label}
              className="border border-[#d1d6de] bg-white px-4 py-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 break-words text-[20px] font-semibold leading-6 text-slate-950">
                {item.value}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-slate-600">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
          <div className="border border-[#d1d6de] bg-[#f7f8fa] px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Captured information
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {capturedContextRows.map((row) => (
                <div
                  key={row.label}
                  className="border border-[#d1d6de] bg-white px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-950">
                      {row.label}
                    </p>
                    <span
                      className={[
                        "shrink-0 border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        row.captured
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-900"
                      ].join(" ")}
                    >
                      {row.captured ? "Captured" : "Missing"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                    {row.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[#d1d6de] bg-white px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#005EB8]">
              Next handoff action
            </p>
            <h3 className="mt-2 text-lg font-semibold leading-6 text-slate-950">
              {nextAssessmentAction}
            </h3>
            <div className="mt-4 border border-[#d1d6de] bg-[#f7f8fa] px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Missing before estimator confidence
              </p>
              {assessmentMissingRows.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-700">
                  {assessmentMissingRows.slice(0, 6).map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  No missing context is visible from this package summary.
                  Estimator review still happens in the owning estimate
                  workspace.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DetailPanel
          title="Assessment Notes"
          description="Capture summary-level site and handoff notes only. Detailed guided capture, area modeling, photos, AI risk detection, and material takeoff are intentionally out of this foundation slice."
        >
          <form action={updateAssessmentPackageAction} className="space-y-5">
            <input type="hidden" name="projectId" value={project.id} />
            <input
              type="hidden"
              name="assessmentPackageId"
              value={assessmentPackage.id}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                name="title"
                label="Title"
                defaultValue={assessmentPackage.title}
                required
              />
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Assessment date
                <input
                  type="date"
                  name="assessmentDate"
                  defaultValue={assessmentPackage.assessmentDate ?? ""}
                  className="mt-2 w-full rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm"
                />
              </label>
              <TextField
                name="siteContactName"
                label="Site contact name"
                defaultValue={assessmentPackage.siteContactName}
              />
              <TextField
                name="siteContactPhone"
                label="Site contact phone"
                defaultValue={assessmentPackage.siteContactPhone}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TextAreaField
                name="accessNotes"
                label="Access notes"
                defaultValue={assessmentPackage.accessNotes}
              />
              <TextAreaField
                name="parkingNotes"
                label="Parking notes"
                defaultValue={assessmentPackage.parkingNotes}
              />
              <TextAreaField
                name="siteNotes"
                label="Site notes"
                defaultValue={assessmentPackage.siteNotes}
              />
              <TextAreaField
                name="customerGoals"
                label="Customer goals"
                defaultValue={assessmentPackage.customerGoals}
              />
              <TextAreaField
                name="currentConditionsSummary"
                label="Current conditions summary"
                defaultValue={assessmentPackage.currentConditionsSummary}
              />
              <TextAreaField
                name="recommendedSystemSummary"
                label="Recommended system summary"
                defaultValue={assessmentPackage.recommendedSystemSummary}
              />
              <TextAreaField
                name="riskSummary"
                label="Risk summary"
                defaultValue={assessmentPackage.riskSummary}
              />
              <TextAreaField
                name="estimateHandoffSummary"
                label="Estimate handoff summary"
                defaultValue={assessmentPackage.estimateHandoffSummary}
              />
            </div>

            <button type="submit" className={primaryActionClassName}>
              Save assessment package
            </button>
          </form>
        </DetailPanel>

        <DetailPanel
          title="Areas And Spaces"
          description="Project-scoped areas and spaces under this assessment package. These records support future guided capture, photos, conditions, risks, and estimate handoff without becoming detached room, material, estimate, or project truth."
        >
          <div className="grid gap-3 text-xs leading-5 text-[var(--text-secondary)] sm:grid-cols-4">
            <div className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
              <p className="font-semibold uppercase tracking-[0.14em]">
                Spaces
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {assessmentSpaceSummary.total}
              </p>
            </div>
            <div className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
              <p className="font-semibold uppercase tracking-[0.14em]">
                Measured
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {assessmentSpaceSummary.measuredCount}
              </p>
            </div>
            <div className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
              <p className="font-semibold uppercase tracking-[0.14em]">Sq ft</p>
              <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {assessmentSpaceSummary.totalSquareFeet.toFixed(2)}
              </p>
            </div>
            <div className="rounded-md border border-[var(--border-warm)] bg-[var(--highlight)] px-3 py-2">
              <p className="font-semibold uppercase tracking-[0.14em]">
                Substrates
              </p>
              <p className="mt-1 text-base font-semibold text-[var(--text-primary)]">
                {assessmentSpaceSummary.substrateLabels.length}
              </p>
            </div>
          </div>

          <form
            action={createAssessmentSpaceAction}
            className="mt-6 rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4"
          >
            <input type="hidden" name="projectId" value={project.id} />
            <input
              type="hidden"
              name="assessmentPackageId"
              value={assessmentPackage.id}
            />
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Add area or space
            </p>
            <div className="mt-4">
              <AssessmentSpaceFields />
            </div>
            <button type="submit" className={`${primaryActionClassName} mt-4`}>
              Add area/space
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {assessmentSpaces.length > 0 ? (
              assessmentSpaces.map((assessmentSpace) => (
                <details
                  key={assessmentSpace.id}
                  className="rounded-lg border border-[var(--border-warm)] bg-white px-4 py-4"
                >
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">
                          {assessmentSpace.name}
                        </p>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {formatAssessmentSpaceTypeLabel(
                            assessmentSpace.spaceType
                          )}
                          {assessmentSpace.squareFeet
                            ? ` / ${assessmentSpace.squareFeet} sq ft`
                            : ""}
                          {assessmentSpace.substrate
                            ? ` / ${assessmentSpace.substrate}`
                            : ""}
                        </p>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                        Edit
                      </span>
                    </div>
                  </summary>
                  <form action={updateAssessmentSpaceAction} className="mt-4">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input
                      type="hidden"
                      name="assessmentPackageId"
                      value={assessmentPackage.id}
                    />
                    <input
                      type="hidden"
                      name="assessmentSpaceId"
                      value={assessmentSpace.id}
                    />
                    <AssessmentSpaceFields assessmentSpace={assessmentSpace} />
                    <button
                      type="submit"
                      className={`${secondaryActionClassName} mt-4`}
                    >
                      Save area/space
                    </button>
                  </form>
                </details>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                No areas or spaces are attached to this assessment package yet.
              </div>
            )}
          </div>
        </DetailPanel>

        <aside className="space-y-6">
          <DetailPanel
            title="Package Status"
            description="Status changes stay on the package and are validated before handoff."
          >
            <form action={updateAssessmentPackageStatusAction}>
              <input type="hidden" name="projectId" value={project.id} />
              <input
                type="hidden"
                name="assessmentPackageId"
                value={assessmentPackage.id}
              />
              <label className="block text-sm font-medium text-[var(--text-primary)]">
                Status
                <select
                  name="status"
                  defaultValue={assessmentPackage.status}
                  className="mt-2 w-full rounded-md border border-[var(--border-warm)] px-3 py-2 text-sm capitalize"
                >
                  {assessmentPackageStatuses.map((status) => (
                    <option key={status} value={status}>
                      {formatAssessmentPackageStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className={`${secondaryActionClassName} mt-4`}
              >
                Update status
              </button>
            </form>
          </DetailPanel>

          <DetailPanel
            title="Canonical Links"
            description="This package reads from Project and hands summary context to Estimate without owning either record."
          >
            <div className="space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
              <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                <p className="font-semibold text-[var(--text-primary)]">
                  Project
                </p>
                <Link
                  href={`/projects/${project.id}`}
                  className="font-medium text-brand-700"
                >
                  {project.name}
                </Link>
              </div>
              <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                <p className="font-semibold text-[var(--text-primary)]">
                  Customer
                </p>
                <p>{project.customer?.name ?? "Unknown customer"}</p>
              </div>
              <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                <p className="font-semibold text-[var(--text-primary)]">
                  Updated
                </p>
                <p>{formatDateTime(assessmentPackage.updatedAt)}</p>
              </div>
            </div>
          </DetailPanel>
        </aside>
      </div>
    </div>
  );
}
