import Link from "next/link";
import { notFound } from "next/navigation";

import {
  primaryActionClassName,
  secondaryActionClassName
} from "@/components/action-hierarchy";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
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

export default async function AssessmentPackageDetailPage({
  params,
  searchParams
}: AssessmentPackageDetailPageProps) {
  const { projectId, assessmentPackageId } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const [project, assessmentPackage] = await Promise.all([
    getProjectById(projectId, `/projects/${projectId}`),
    getAssessmentPackageById({ projectId, assessmentPackageId })
  ]);

  if (!project || !assessmentPackage) {
    notFound();
  }

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
