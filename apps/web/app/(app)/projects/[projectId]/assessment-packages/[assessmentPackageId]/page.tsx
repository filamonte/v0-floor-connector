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
