import Link from "next/link";
import { notFound } from "next/navigation";

import { AppEmptyState } from "@/components/app-empty-state";
import { ContextFactsList } from "@/components/context-facts-list";
import { DetailPageHeader } from "@/components/detail-page-header";
import { DetailPanel } from "@/components/detail-panel";
import { NextActionCard } from "@/components/next-action-card";
import { WorkspaceSummaryBand } from "@/components/workspace-summary-band";
import {
  getPortalProjectDetailSummary,
  listPortalProjectContracts,
  listPortalProjectEstimates,
  listPortalProjectInvoices
} from "@/lib/portal/data";

type PortalProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function formatStatusLabel(status: string | null) {
  if (!status) {
    return "Not shared yet";
  }

  return status.replaceAll("_", " ");
}

function formatMoney(value: string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : "Not shared yet";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function formatLocation(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(", ") || "Not provided";
}

function getProjectNextAction(input: {
  projectName: string;
  visibleInvoiceCount: number;
  latestInvoiceStatus: string | null;
  visibleContractCount: number;
  latestContractStatus: string | null;
  visibleEstimateCount: number;
  latestEstimateStatus: string | null;
}) {
  if (
    input.visibleInvoiceCount > 0 &&
    input.latestInvoiceStatus &&
    !["paid", "void"].includes(input.latestInvoiceStatus)
  ) {
    return {
      title: `Review the invoice shared for ${input.projectName}`,
      description:
        "Billing is the clearest current customer-facing record on this project, so start there inside the commercial records below."
    };
  }

  if (
    input.visibleContractCount > 0 &&
    input.latestContractStatus &&
    !["signed", "void"].includes(input.latestContractStatus)
  ) {
    return {
      title: `Review the contract shared for ${input.projectName}`,
      description:
        "The contract is still in motion, so it is the most useful shared record to review on this project right now."
    };
  }

  if (input.visibleContractCount > 0 && input.latestContractStatus === "signed") {
    return {
      title: `Contract signing is complete for ${input.projectName}`,
      description:
        input.visibleInvoiceCount > 0
          ? "The shared contract is fully signed. Review the invoice records below for the next customer-facing commercial step."
          : "The shared contract is fully signed. Billing or downstream project continuity will appear here as the next shared step."
    };
  }

  if (input.visibleEstimateCount > 0) {
    return {
      title: `Review the proposal for ${input.projectName}`,
      description:
        "Estimate information is already shared on this project, making the proposal details the best place to start."
    };
  }

  return {
    title: "Project access is active",
    description:
      "This project has been shared with you, but no estimate, contract, or invoice has been published to the portal yet."
  };
}

function getPortalContractSummary(contract: {
  status: string;
  customerViewedAt: string | null;
  customerSignedAt: string | null;
  contractorCountersignedAt: string | null;
  signedAt: string | null;
  sentAt: string | null;
}) {
  if (contract.status === "signed") {
    return `Fully signed ${formatDate(contract.signedAt)}`;
  }

  if (contract.customerSignedAt && !contract.contractorCountersignedAt) {
    return `Customer signed ${formatDate(contract.customerSignedAt)} | Contractor countersign pending`;
  }

  if (contract.customerViewedAt) {
    return `Customer reviewed ${formatDate(contract.customerViewedAt)} | Signature still in progress`;
  }

  if (contract.sentAt) {
    return `Sent ${formatDate(contract.sentAt)} | Waiting on signature`;
  }

  return "Contract shared on this project";
}

function RecordSummaryCard({
  eyebrow,
  title,
  description,
  meta,
  badge,
  href
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  badge: string;
  href?: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.94),rgba(255,255,255,0.98))] px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{meta}</p>
      {href ? (
        <div className="mt-4">
          <Link
            href={href}
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            Review record
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default async function PortalProjectDetailPage({
  params
}: PortalProjectDetailPageProps) {
  const { projectId } = await params;
  const [project, estimates, contracts, invoices] = await Promise.all([
    getPortalProjectDetailSummary(projectId, `/portal/projects/${projectId}`),
    listPortalProjectEstimates(projectId, `/portal/projects/${projectId}`),
    listPortalProjectContracts(projectId, `/portal/projects/${projectId}`),
    listPortalProjectInvoices(projectId, `/portal/projects/${projectId}`)
  ]);

  if (!project) {
    notFound();
  }

  const nextAction = getProjectNextAction({
    projectName: project.name,
    visibleInvoiceCount: project.visibleInvoiceCount,
    latestInvoiceStatus: project.latestInvoiceStatus,
    visibleContractCount: project.visibleContractCount,
    latestContractStatus: project.latestContractStatus,
    visibleEstimateCount: project.visibleEstimateCount,
    latestEstimateStatus: project.latestEstimateStatus
  });

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
          <DetailPageHeader
            eyebrow="Shared Project Workspace"
            title={project.name}
            description="Use this page as the customer-facing anchor for the commercial records tied to this project. It stays focused on review, visibility, and the next shared record to look at."
            backHref="/portal"
            backLabel="Back to portal home"
            actions={
              <span className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium capitalize text-slate-700">
                {formatStatusLabel(project.status)}
              </span>
            }
          />

          <div className="mt-8">
            <WorkspaceSummaryBand
              items={[
                {
                  key: "purpose",
                  label: "What this page is for",
                  content: (
                    <p className="text-sm leading-6 text-slate-600">
                      Keep this project as your anchor for reviewing proposals, contracts, and
                      invoices shared by your contractor.
                    </p>
                  )
                },
                {
                  key: "record-visibility",
                  label: "Shared records",
                  content: (
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p>{project.visibleEstimateCount} estimate record(s)</p>
                      <p>{project.visibleContractCount} contract record(s)</p>
                      <p>{project.visibleInvoiceCount} invoice record(s)</p>
                    </div>
                  )
                },
                {
                  key: "current-state",
                  label: "Current shared state",
                  content: (
                    <div className="space-y-2 text-sm leading-6 text-slate-600">
                      <p>Estimate: {formatStatusLabel(project.latestEstimateStatus)}</p>
                      <p>Contract: {formatStatusLabel(project.latestContractStatus)}</p>
                      <p>Invoice: {formatStatusLabel(project.latestInvoiceStatus)}</p>
                      {project.latestContractStatus === "signed" ? (
                        <p>Contract signing is complete for this shared project workflow.</p>
                      ) : null}
                    </div>
                  )
                },
                {
                  key: "next-action",
                  label: "Next record to review",
                  content: (
                    <NextActionCard title={nextAction.title} description={nextAction.description} />
                  )
                }
              ]}
            />
          </div>
        </div>

        <DetailPanel
          title="Commercial Records"
          description="These are the customer-facing records currently visible on this project. They stay grouped under the project so the portal remains simple and easy to follow."
        >
          <div className="space-y-8">
            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Estimates and proposals</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Shared proposal and pricing context tied to this project.
                </p>
              </div>
              {estimates.length > 0 ? (
                <div className="grid gap-4">
                  {estimates.map((estimate) => (
                    <RecordSummaryCard
                      key={estimate.id}
                      eyebrow="Estimate"
                      title={estimate.referenceNumber}
                      description={
                        estimate.notes?.trim() ||
                        "Proposal details and pricing are shared on this estimate."
                      }
                      meta={`Total ${formatMoney(estimate.totalAmount)} | Updated ${formatDateTime(estimate.updatedAt)}`}
                      badge={formatStatusLabel(estimate.status)}
                      href={`/portal/estimates/${estimate.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No estimates"
                  title="No proposal has been shared yet"
                  description="When your contractor publishes estimate information to this project, it will appear here."
                />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Contracts</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Contract visibility stays tied to the same project chain as the proposal.
                </p>
              </div>
              {contracts.length > 0 ? (
                <div className="grid gap-4">
                  {contracts.map((contract) => (
                    <RecordSummaryCard
                      key={contract.id}
                      eyebrow="Contract"
                      title={contract.title}
                      description={
                        contract.renderedSubject?.trim() ||
                        "Contract content has been shared for this project."
                      }
                      meta={getPortalContractSummary(contract)}
                      badge={formatStatusLabel(contract.status)}
                      href={`/portal/contracts/${contract.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No contracts"
                  title="No contract has been shared yet"
                  description="Contract visibility will appear here once your contractor publishes it for this project."
                />
              )}
            </section>

            <section className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-950">Invoices</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Invoice visibility stays project-centered so billing remains easy to follow.
                </p>
              </div>
              {invoices.length > 0 ? (
                <div className="grid gap-4">
                  {invoices.map((invoice) => (
                    <RecordSummaryCard
                      key={invoice.id}
                      eyebrow={invoice.workflowRole === "deposit" ? "Deposit invoice" : "Invoice"}
                      title={invoice.referenceNumber}
                      description={`Total ${formatMoney(invoice.totalAmount)} with ${formatMoney(invoice.balanceDueAmount)} currently due.`}
                      meta={`Issued ${formatDate(invoice.issueDate)} | Due ${formatDate(invoice.dueDate)}`}
                      badge={formatStatusLabel(invoice.status)}
                      href={`/portal/invoices/${invoice.id}`}
                    />
                  ))}
                </div>
              ) : (
                <AppEmptyState
                  eyebrow="No invoices"
                  title="No invoice has been shared yet"
                  description="Invoices connected to this project will appear here when they are made visible in the portal."
                />
              )}
            </section>
          </div>
        </DetailPanel>
      </section>

      <aside className="space-y-6">
        <DetailPanel
          title="Project Context"
          description="Compact project facts that support review without exposing contractor-only workflow internals."
        >
          <ContextFactsList
            items={[
              {
                label: "Customer",
                value: project.customer?.companyName ?? project.customer?.name ?? "Not provided"
              },
              {
                label: "Contact email",
                value: project.customer?.email ?? "Not provided"
              },
              {
                label: "Contact phone",
                value: project.customer?.phone ?? "Not provided"
              },
              {
                label: "Location",
                value: formatLocation([
                  project.location.addressLine1,
                  project.location.addressLine2,
                  project.location.city,
                  project.location.stateRegion,
                  project.location.postalCode,
                  project.location.countryCode
                ])
              },
              {
                label: "Project description",
                value: project.description ?? "No additional project description is shared yet."
              },
              {
                label: "Updated",
                value: formatDateTime(project.updatedAt)
              }
            ]}
          />
        </DetailPanel>

        <DetailPanel
          title="Portal Guidance"
          description="This first portal foundation stays intentionally narrow and review-first."
        >
          <div className="space-y-3 text-sm leading-6 text-slate-600">
            <p>
              Commercial records stay tied to the same canonical project your contractor uses
              internally.
            </p>
            <p>
              Contract signing now updates the same shared project workflow, so the contract and
              invoice sections above reflect the next customer-facing commercial step as it changes.
            </p>
            <Link
              href="/portal"
              className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
            >
              Return to portal home
            </Link>
          </div>
        </DetailPanel>
      </aside>
    </div>
  );
}
