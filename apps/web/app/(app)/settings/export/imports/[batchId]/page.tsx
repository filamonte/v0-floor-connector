import Link from "next/link";

import { SettingsSectionCard } from "@/components/settings-section-card";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";
import { getDataImportBatchReview } from "@/lib/data-export/import-batches";

type ImportBatchReviewPageProps = {
  params: Promise<{
    batchId: string;
  }>;
};

export default async function ImportBatchReviewPage({
  params
}: ImportBatchReviewPageProps) {
  const { batchId } = await params;
  const scope = await requireOrganizationAdminScope("/settings/export");
  const review = await getDataImportBatchReview(batchId, scope);

  if (review.unavailableReason) {
    return (
      <SettingsSectionCard
        eyebrow="Import review"
        title="Import batch unavailable"
        description="Import review batches are tenant-scoped and require the import batch migration."
        tone="neutral"
      >
        <p className="border border-[#d9cdc2] bg-white px-5 py-4 text-sm leading-6 text-[#6f6256]">
          {review.unavailableReason}
        </p>
      </SettingsSectionCard>
    );
  }

  if (!review.batch) {
    return (
      <SettingsSectionCard
        eyebrow="Import review"
        title="Import batch unavailable"
        description="Import review batches are tenant-scoped and require an existing review batch."
        tone="neutral"
      >
        <p className="border border-[#d9cdc2] bg-white px-5 py-4 text-sm leading-6 text-[#6f6256]">
          Import review batch was not found for this organization.
        </p>
      </SettingsSectionCard>
    );
  }

  const { batch, rows } = review;

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        eyebrow="Import review"
        title="Customer/contact import batch"
        description="Review only. This page does not create or change records."
      >
        <div className="border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-950">
            Final import approval is not enabled yet.
          </p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Future write phases will require duplicate review, export backup,
            explicit confirmation, and rollback safeguards before any records are
            created.
          </p>
        </div>

        <div className="mt-5 grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-4">
          <BatchStat label="Rows" value={String(batch.totalRows)} />
          <BatchStat label="Valid" value={String(batch.validRows)} />
          <BatchStat label="Warnings" value={String(batch.warningRows)} />
          <BatchStat label="Errors" value={String(batch.errorRows)} />
        </div>

        <dl className="mt-5 grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-2">
          <BatchDetail label="Status" value={batch.status.replaceAll("_", " ")} />
          <BatchDetail label="Requested by" value={batch.requestedByLabel} />
          <BatchDetail
            label="Created"
            value={formatImportBatchTime(batch.createdAt)}
          />
          <BatchDetail
            label="Source filename"
            value={batch.sourceFilename ?? "Not recorded"}
          />
          <BatchDetail label="Mapping version" value={batch.mappingVersion} />
          <BatchDetail label="Schema version" value={batch.schemaVersion} />
        </dl>
      </SettingsSectionCard>

      <SettingsSectionCard
        eyebrow="Approval placeholder"
        title="Future approval checklist"
        description="These safeguards must be implemented before any future import execution action is enabled."
        tone="neutral"
      >
        <div className="grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-2">
          {[
            "Review duplicate rows",
            "Confirm export backup",
            "Choose row decisions",
            "Type explicit approval phrase",
            "Record import audit trail",
            "Prepare created-only rollback"
          ].map((item) => (
            <div key={item} className="bg-white px-4 py-3 text-sm text-[#594839]">
              {item}
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled
          className="mt-5 inline-flex items-center justify-center border border-[#d9cdc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#7b6a5b] opacity-80"
        >
          Final import disabled - review only
        </button>
      </SettingsSectionCard>

      <SettingsSectionCard
        eyebrow="Rows"
        title="Row review"
        description="Rows show normalized preview values, validation status, proposed decisions, and duplicate signals. Created-record references remain empty in this phase."
        tone="neutral"
      >
        <div className="divide-y divide-[#d9cdc2] border border-[#d9cdc2] bg-white">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid gap-4 px-5 py-4 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <span className="text-sm font-semibold text-[#221a14]">
                Row {row.rowNumber}
              </span>
              <div>
                <p className="text-sm font-medium text-[#221a14]">
                  {row.normalizedPreview.customer_name ||
                    row.normalizedPreview.customer_company_name ||
                    "Missing customer"}
                </p>
                <p className="mt-1 text-sm text-[#6f6256]">
                  {row.normalizedPreview.primary_contact_name ||
                    row.normalizedPreview.email ||
                    row.normalizedPreview.phone ||
                    "No contact preview"}
                </p>
                {row.duplicateCandidates ? (
                  <p className="mt-2 text-xs font-medium text-amber-800">
                    {row.duplicateCandidates.messages.join(" ")}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-[#221a14]">
                  {row.validationStatus.replaceAll("_", " ")} ·{" "}
                  {row.proposedDecision.replaceAll("_", " ")}
                </p>
                {row.errors.map((error) => (
                  <p key={error} className="font-medium text-red-700">
                    {error}
                  </p>
                ))}
                {row.warnings.map((warning) => (
                  <p key={warning} className="font-medium text-amber-800">
                    {warning}
                  </p>
                ))}
                <p className="text-xs text-[#7b6a5b]">
                  Created records: none in this phase
                </p>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/settings/export"
          className="mt-5 inline-flex items-center justify-center border border-[#d9cdc2] bg-white px-3 py-2 text-sm font-medium text-[#594839] transition hover:border-[#ef7d32]"
        >
          Back to Data Export
        </Link>
      </SettingsSectionCard>
    </div>
  );
}

function BatchStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f6256]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[#221a14]">{value}</p>
    </div>
  );
}

function BatchDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f6256]">
        {label}
      </dt>
      <dd className="mt-2 break-all text-sm font-medium text-[#221a14]">
        {value}
      </dd>
    </div>
  );
}

function formatImportBatchTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}
