import Link from "next/link";

import { SettingsFeedback } from "@/components/settings-feedback";
import { SettingsSectionCard } from "@/components/settings-section-card";
import {
  archiveCompanyDocumentAction,
  saveCompanyDocumentAction,
  unarchiveCompanyDocumentAction
} from "@/lib/company-documents/actions";
import {
  getCompanyDocumentAccess,
  listCompanyDocuments
} from "@/lib/company-documents/data";
import {
  companyDocumentAudienceLabels,
  companyDocumentAudiences,
  companyDocumentCategories,
  companyDocumentCategoryLabels,
  companyDocumentStatusLabels,
  companyDocumentStatuses,
  type CompanyDocument
} from "@/lib/company-documents/types";

type PageProps = {
  searchParams?: Promise<{
    category?: string;
    documentId?: string;
    error?: string;
    message?: string;
    status?: string;
  }>;
};

const fieldClassName =
  "mt-2 w-full rounded-md border border-[var(--border-warm)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] shadow-sm focus:border-[var(--copper)] focus:outline-none focus:ring-2 focus:ring-[var(--copper)]/20";
const labelClassName =
  "text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]";
const panelClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-[0_18px_48px_-40px_rgba(34,26,20,0.28)]";
const buttonClassName =
  "inline-flex rounded-md border border-[var(--copper-light)] bg-[var(--copper)] px-4 py-2 text-sm font-medium text-white transition hover:border-[var(--copper)] hover:bg-[var(--copper-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2";
const secondaryButtonClassName =
  "inline-flex rounded-md border border-[var(--border-warm)] bg-white px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--copper)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)]";

function formatDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}

function formatDate(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function normalizeFilter<T extends readonly string[]>(
  value: string | undefined,
  options: T
): T[number] | "all" {
  return value && options.includes(value) ? value : "all";
}

function DocumentForm({ document }: { document: CompanyDocument | null }) {
  return (
    <form action={saveCompanyDocumentAction} className={panelClassName}>
      <input type="hidden" name="documentId" value={document?.id ?? ""} />
      <div className="flex flex-col gap-3 border-b border-[var(--border-warm)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={labelClassName}>Document workspace</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {document ? "Edit company document" : "Create company document"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
            Company Documents stores your company's document content. It does
            not provide legal advice.
          </p>
        </div>
        {document ? (
          <Link
            href="/settings/company-documents"
            className={secondaryButtonClassName}
          >
            New document
          </Link>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label>
          <span className={labelClassName}>Title</span>
          <input
            name="title"
            defaultValue={document?.title ?? ""}
            className={fieldClassName}
            required
            maxLength={180}
          />
        </label>
        <label>
          <span className={labelClassName}>Document kind</span>
          <input
            name="documentKind"
            defaultValue={document?.documentKind ?? "Company document"}
            className={fieldClassName}
            required
            maxLength={120}
          />
        </label>
        <label>
          <span className={labelClassName}>Category</span>
          <select
            name="category"
            defaultValue={document?.category ?? "operations_sop"}
            className={fieldClassName}
          >
            {companyDocumentCategories.map((category) => (
              <option key={category} value={category}>
                {companyDocumentCategoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClassName}>Audience</span>
          <select
            name="audience"
            defaultValue={document?.audience ?? "internal"}
            className={fieldClassName}
          >
            {companyDocumentAudiences.map((audience) => (
              <option key={audience} value={audience}>
                {companyDocumentAudienceLabels[audience]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClassName}>Status</span>
          <select
            name="status"
            defaultValue={document?.status ?? "draft"}
            className={fieldClassName}
          >
            {companyDocumentStatuses.map((status) => (
              <option key={status} value={status}>
                {companyDocumentStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClassName}>Effective date</span>
          <input
            type="date"
            name="effectiveDate"
            defaultValue={formatDate(document?.effectiveDate ?? null)}
            className={fieldClassName}
          />
        </label>
        <label>
          <span className={labelClassName}>Expires at</span>
          <input
            type="datetime-local"
            name="expiresAt"
            defaultValue={formatDateTimeLocal(document?.expiresAt ?? null)}
            className={fieldClassName}
          />
        </label>
        <label className="lg:col-span-2">
          <span className={labelClassName}>Description</span>
          <textarea
            name="description"
            defaultValue={document?.description ?? ""}
            rows={3}
            className={fieldClassName}
            maxLength={2000}
          />
        </label>
        <label className="lg:col-span-2">
          <span className={labelClassName}>Document content</span>
          <textarea
            name="body"
            defaultValue={document?.body ?? ""}
            rows={12}
            className={fieldClassName}
            maxLength={50000}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className={buttonClassName}>
          Save document
        </button>
      </div>
    </form>
  );
}

export default async function CompanyDocumentsSettingsPage({
  searchParams
}: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [documents, access] = await Promise.all([
    listCompanyDocuments("/settings/company-documents"),
    getCompanyDocumentAccess("/settings/company-documents")
  ]);
  const statusFilter = normalizeFilter(
    resolvedSearchParams.status,
    companyDocumentStatuses
  );
  const categoryFilter = normalizeFilter(
    resolvedSearchParams.category,
    companyDocumentCategories
  );
  const visibleDocuments = documents.filter(
    (document) =>
      (statusFilter === "all" || document.status === statusFilter) &&
      (categoryFilter === "all" || document.category === categoryFilter)
  );
  const selectedDocument =
    documents.find(
      (document) => document.id === resolvedSearchParams.documentId
    ) ?? null;
  const activeCount = documents.filter(
    (document) => document.status === "active"
  ).length;
  const archivedCount = documents.filter(
    (document) => document.status === "archived"
  ).length;

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SettingsSectionCard
        eyebrow="Company Documents"
        title="Document Library"
        description="Store business documents, SOPs, policies, and agreements for your company."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="space-y-5">
            <div className={panelClassName}>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                  <p className={labelClassName}>Documents</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                    {documents.length}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                  <p className={labelClassName}>Active</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                    {activeCount}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
                  <p className={labelClassName}>Archived</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                    {archivedCount}
                  </p>
                </div>
              </div>
            </div>

            <form className={panelClassName}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClassName}>Status</span>
                  <select
                    name="status"
                    defaultValue={statusFilter}
                    className={fieldClassName}
                  >
                    <option value="all">All statuses</option>
                    {companyDocumentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {companyDocumentStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className={labelClassName}>Category</span>
                  <select
                    name="category"
                    defaultValue={categoryFilter}
                    className={fieldClassName}
                  >
                    <option value="all">All categories</option>
                    {companyDocumentCategories.map((category) => (
                      <option key={category} value={category}>
                        {companyDocumentCategoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="submit"
                className={`${secondaryButtonClassName} mt-4`}
              >
                Apply filters
              </button>
            </form>

            <div className={panelClassName}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={labelClassName}>Library</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                    Company Documents
                  </h2>
                </div>
              </div>

              {visibleDocuments.length === 0 ? (
                <p className="mt-5 rounded-lg border border-dashed border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-6 text-sm text-[var(--text-secondary)]">
                  No company documents yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {visibleDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">
                            {document.title}
                          </h3>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            {companyDocumentCategoryLabels[document.category]} ·{" "}
                            {companyDocumentAudienceLabels[document.audience]} ·{" "}
                            {companyDocumentStatusLabels[document.status]}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                            Updated {formatUpdatedAt(document.updatedAt)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/settings/company-documents?documentId=${document.id}`}
                            className={secondaryButtonClassName}
                          >
                            Edit
                          </Link>
                          {access.canManage ? (
                            document.status === "archived" ? (
                              <form action={unarchiveCompanyDocumentAction}>
                                <input
                                  type="hidden"
                                  name="documentId"
                                  value={document.id}
                                />
                                <button
                                  type="submit"
                                  className={secondaryButtonClassName}
                                >
                                  Restore
                                </button>
                              </form>
                            ) : (
                              <form action={archiveCompanyDocumentAction}>
                                <input
                                  type="hidden"
                                  name="documentId"
                                  value={document.id}
                                />
                                <button
                                  type="submit"
                                  className={secondaryButtonClassName}
                                >
                                  Archive
                                </button>
                              </form>
                            )
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {access.canManage ? (
            <DocumentForm document={selectedDocument} />
          ) : (
            <div className={panelClassName}>
              <p className={labelClassName}>View only</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                Company Documents
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                You can review company documents for this company. Ask an owner,
                admin, or manager to create, edit, archive, or restore records.
              </p>
            </div>
          )}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
