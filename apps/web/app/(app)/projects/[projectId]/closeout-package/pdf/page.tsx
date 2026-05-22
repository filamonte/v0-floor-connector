import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import {
  CustomerDocumentPrintView,
  CustomerDocumentSection,
  formatDocumentAddress,
  formatDocumentDate,
  formatDocumentMoney,
  formatDocumentStatus
} from "@/components/customer-document-print-view";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listProjectChangeOrders } from "@/lib/change-orders/data";
import {
  deriveCloseoutTrailSummary,
  type CloseoutTrailSummary
} from "@/lib/closeouttrail/summary";
import { listContracts } from "@/lib/contracts/data";
import { listDailyLogsByProject } from "@/lib/daily-logs/data";
import {
  buildDocumentEngineBrand,
  getProjectCloseoutPackageBackHref,
  getProjectCloseoutPackageExportNotice,
  getProjectCloseoutPackageFooterNote
} from "@/lib/document-engine/print";
import { listEstimates } from "@/lib/estimates/data";
import { listExecutionAttachmentsBySubjects } from "@/lib/execution-attachments/data";
import {
  deriveFieldTrailSummary,
  type FieldTrailSummary
} from "@/lib/fieldtrail/summary";
import { listFieldNotes } from "@/lib/field-notes/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { getProjectMessageCenterTrail } from "@/lib/messagecenter/data";
import {
  deriveMessageCenterSummary,
  type MessageCenterSummary
} from "@/lib/messagecenter/summary";
import { getOpportunityByProjectId } from "@/lib/opportunities/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import {
  listPortalAccessGrantsByCustomer,
  listPortalProjectAccessByGrantId
} from "@/lib/portal-access/data";
import {
  deriveProjectPulseSummary,
  type ProjectPulseSummary
} from "@/lib/projectpulse/summary";
import {
  deriveProofCenterSummary,
  type ProofCenterSummary
} from "@/lib/proofcenter/summary";
import { getProjectById } from "@/lib/projects/data";
import { getProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import { buildScheduleHref } from "@/lib/schedule/links";
import { listServiceTicketsByProject } from "@/lib/service-tickets/data";
import { listTimeCardsByProject } from "@/lib/time/data";
import { listWarrantyDocumentsByProject } from "@/lib/warranty-documents/data";

type ProjectCloseoutPackagePdfPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

function formatStatus(value: string | null | undefined) {
  return value ? formatDocumentStatus(value) : "Not available";
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleString();
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

function EmptyPrintState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)] print:break-inside-avoid">
      {children}
    </p>
  );
}

function SummaryGrid({
  items
}: {
  items: Array<{ label: string; value: ReactNode; detail?: ReactNode }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 print:break-inside-avoid">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-[var(--border-warm)] bg-[var(--paper)] px-4 py-3"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
            {item.label}
          </p>
          <div className="mt-1 text-sm font-semibold leading-6 text-[var(--text-primary)]">
            {item.value}
          </div>
          {item.detail ? (
            <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
              {item.detail}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PrintList({ items, empty }: { items: ReactNode[]; empty: ReactNode }) {
  if (items.length === 0) {
    return <EmptyPrintState>{empty}</EmptyPrintState>;
  }

  return <div className="grid gap-3">{items}</div>;
}

function SourceCard({
  title,
  meta,
  detail,
  href
}: {
  title: string;
  meta: string;
  detail?: string;
  href?: string;
}) {
  const body = (
    <div className="rounded-md border border-[var(--border-warm)] bg-white px-4 py-3 text-sm leading-6 print:break-inside-avoid">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <p className="font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {meta}
        </p>
      </div>
      {detail ? (
        <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
          {detail}
        </p>
      ) : null}
      {href ? (
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
          Source: {href}
        </p>
      ) : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block print:text-inherit">
      {body}
    </Link>
  ) : (
    body
  );
}

function ProjectPulsePrintSection({
  summary
}: {
  summary: ProjectPulseSummary;
}) {
  const leadItems =
    summary.blockers.length > 0
      ? summary.blockers
      : summary.warnings.length > 0
        ? summary.warnings
        : summary.highlights;

  return (
    <CustomerDocumentSection title="ProjectPulse summary">
      <SummaryGrid
        items={[
          { label: "Stage", value: summary.stageLabel },
          { label: "Project health", value: formatStatus(summary.healthTone) },
          {
            label: "Next Move",
            value: summary.nextMove.label,
            detail: summary.nextMove.reason
          },
          { label: "Jobs", value: summary.linkedCounts.jobs },
          { label: "Open blockers", value: summary.linkedCounts.openBlockers },
          {
            label: "Unpaid invoices",
            value: summary.linkedCounts.unpaidInvoices
          }
        ]}
      />
      {leadItems.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
          {leadItems.slice(0, 4).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <EmptyPrintState>
          No major project health warnings are visible from current records.
        </EmptyPrintState>
      )}
    </CustomerDocumentSection>
  );
}

function CloseoutTrailPrintSection({
  summary
}: {
  summary: CloseoutTrailSummary;
}) {
  return (
    <CustomerDocumentSection title="CloseoutTrail checklist">
      <SummaryGrid
        items={[
          { label: "Closeout status", value: summary.closeoutStatusLabel },
          {
            label: "Closeout Next Move",
            value: summary.nextMove.label,
            detail: summary.nextMove.reason
          },
          {
            label: "Completed jobs",
            value: summary.linkedCounts.completedJobs
          },
          { label: "Open jobs", value: summary.linkedCounts.openJobs },
          {
            label: "Open balance",
            value: formatDocumentMoney(summary.linkedCounts.unpaidBalance)
          },
          {
            label: "Warranty/service",
            value: summary.linkedCounts.warrantyOrServiceItems
          }
        ]}
      />
      <div className="mt-4 grid gap-2">
        {summary.checklistItems.map((item) => (
          <SourceCard
            key={item.id}
            title={item.label}
            meta={formatStatus(item.state)}
            detail={item.detail}
            href={item.href}
          />
        ))}
      </div>
    </CustomerDocumentSection>
  );
}

function ProofCenterPrintSection({ summary }: { summary: ProofCenterSummary }) {
  return (
    <CustomerDocumentSection title="Proof Center index">
      <SummaryGrid
        items={[
          {
            label: "Commercial records",
            value: `${summary.counts.estimates} estimates / ${summary.counts.contracts} contracts`
          },
          {
            label: "Customer actions",
            value: `${summary.counts.sendTrailItems} send / ${summary.counts.signatureTrailItems} signature`
          },
          {
            label: "Billing proof",
            value: `${summary.counts.invoices} invoices / ${summary.counts.paymentTrailItems} payment`
          },
          {
            label: "Field proof",
            value: `${summary.counts.dailyJobLogs} logs / ${summary.counts.evidenceItems} files`
          },
          {
            label: "Closeout/support",
            value: `${summary.counts.warrantyDocuments} warranty / ${summary.counts.serviceTickets} service`
          },
          {
            label: "Proof Next Move",
            value: summary.nextMove.label,
            detail: summary.nextMove.reason
          }
        ]}
      />
      {summary.missingProofItems.length > 0 ? (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--text-secondary)]">
          {summary.missingProofItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {summary.sections.map((section) => (
          <div key={section.id} className="space-y-2 print:break-inside-avoid">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {section.title}
            </h3>
            {section.items.map((item) => (
              <SourceCard
                key={item.id}
                title={item.label}
                meta={item.status}
                detail={item.detail}
                href={item.href}
              />
            ))}
          </div>
        ))}
      </div>
    </CustomerDocumentSection>
  );
}

function FieldTrailPrintSection({
  summary,
  jobs
}: {
  summary: FieldTrailSummary;
  jobs: Array<{
    id: string;
    dispatchStatus: string;
    scheduledDate: string | null;
    scheduledStartAt: string | null;
    scheduledEndAt: string | null;
  }>;
}) {
  const completedJobs = jobs.filter(
    (job) => job.dispatchStatus === "completed"
  ).length;

  return (
    <CustomerDocumentSection title="Field summary">
      <SummaryGrid
        items={[
          { label: "Jobs", value: jobs.length },
          { label: "Completed jobs", value: completedJobs },
          { label: "Daily Job Logs", value: summary.dailyLogCount },
          { label: "Job Notes", value: summary.fieldNoteCount },
          { label: "Open blockers", value: summary.openBlockerCount },
          {
            label: "Evidence",
            value: `${summary.attachmentCount} files / ${summary.photoCount} photos`
          }
        ]}
      />
      <div className="mt-4 grid gap-3">
        {jobs.slice(0, 8).map((job, index) => (
          <SourceCard
            key={job.id}
            title={`Job ${index + 1}`}
            meta={formatStatus(job.dispatchStatus)}
            detail={[
              job.scheduledDate
                ? `Scheduled ${formatDocumentDate(job.scheduledDate)}`
                : "No scheduled date",
              job.scheduledStartAt
                ? `Starts ${formatDateTime(job.scheduledStartAt)}`
                : null,
              job.scheduledEndAt
                ? `Ends ${formatDateTime(job.scheduledEndAt)}`
                : null
            ]
              .filter(Boolean)
              .join(" | ")}
            href={`/jobs/${job.id}`}
          />
        ))}
      </div>
      <div className="mt-4 grid gap-3">
        {summary.timeline.slice(0, 5).map((item) => (
          <SourceCard
            key={item.dailyLog.id}
            title={`Daily Job Log - ${formatDocumentDate(item.dailyLog.logDate)}`}
            meta={formatStatus(item.dailyLog.status)}
            detail={[
              item.dailyLog.summary,
              `${formatCount(item.notes.length, "Job Note")}`,
              `${formatCount(item.attachmentCount, "evidence file")}`,
              `${formatCount(item.openBlockerCount, "open blocker")}`
            ]
              .filter(Boolean)
              .join(" | ")}
            href={`/daily-logs/${item.dailyLog.id}`}
          />
        ))}
      </div>
    </CustomerDocumentSection>
  );
}

function MessageCenterPrintSection({
  summary
}: {
  summary: MessageCenterSummary;
}) {
  return (
    <CustomerDocumentSection title="Communication and send summary">
      <SummaryGrid
        items={[
          { label: "Threads", value: summary.threadCount },
          { label: "Messages", value: summary.messageCount },
          { label: "Send Trail", value: summary.sendTrailCount },
          { label: "Signature Trail", value: summary.signatureTrailCount },
          { label: "Payment Trail", value: summary.paymentTrailCount },
          {
            label: "Next Move",
            value: summary.nextMove.label,
            detail: summary.nextMove.detail
          }
        ]}
      />
      <div className="mt-4">
        <PrintList
          empty="No MessageCenter, Send Trail, Signature Trail, or Payment Trail activity is visible yet."
          items={summary.timeline.slice(0, 8).map((item) => (
            <SourceCard
              key={item.id}
              title={item.title}
              meta={item.eyebrow}
              detail={`${item.description} | ${formatDateTime(item.occurredAt)}`}
              href={item.href}
            />
          ))}
        />
      </div>
    </CustomerDocumentSection>
  );
}

export default async function ProjectCloseoutPackagePdfPage({
  params
}: ProjectCloseoutPackagePdfPageProps) {
  const { projectId } = await params;
  const next = `/projects/${projectId}/closeout-package/pdf`;
  const user = await requireAuthenticatedUser(next);
  const [
    project,
    organizationContext,
    estimates,
    contracts,
    jobs,
    invoices,
    projectOpportunity,
    projectChangeOrders,
    fieldNotes,
    projectTimeCards,
    projectServiceTickets,
    projectWarrantyDocuments
  ] = await Promise.all([
    getProjectById(projectId, next),
    getActiveOrganizationContext(user.id),
    listEstimates(),
    listContracts(),
    listJobs(),
    listInvoices(),
    getOpportunityByProjectId(projectId, next),
    listProjectChangeOrders(projectId, next),
    listFieldNotes(),
    listTimeCardsByProject(projectId, next),
    listServiceTicketsByProject(projectId),
    listWarrantyDocumentsByProject(projectId)
  ]);

  if (!project) {
    notFound();
  }

  const projectEstimates = estimates.filter(
    (estimate) => estimate.projectId === project.id
  );
  const approvedEstimate =
    projectEstimates.find((estimate) => estimate.status === "approved") ?? null;
  const projectContracts = contracts.filter(
    (contract) => contract.projectId === project.id
  );
  const latestContract = projectContracts[0] ?? null;
  const projectJobs = jobs.filter((job) => job.projectId === project.id);
  const projectInvoices = invoices.filter(
    (invoice) => invoice.projectId === project.id
  );
  const projectFieldNotes = fieldNotes.filter(
    (fieldNote) => fieldNote.projectId === project.id
  );
  const projectDailyLogs = await listDailyLogsByProject(project.id, next);
  const projectExecutionAttachments = await listExecutionAttachmentsBySubjects(
    [
      ...projectDailyLogs.map((dailyLog) => ({
        subjectType: "daily_log" as const,
        subjectId: dailyLog.id
      })),
      ...projectFieldNotes.map((fieldNote) => ({
        subjectType: "field_note" as const,
        subjectId: fieldNote.id
      }))
    ],
    next
  );
  const customerPortalAccessGrants = project.customerId
    ? await listPortalAccessGrantsByCustomer(project.customerId, next)
    : [];
  const projectPortalAccessEntries = await Promise.all(
    customerPortalAccessGrants.map(
      async (grant) =>
        [
          grant.id,
          await listPortalProjectAccessByGrantId(grant.id, next)
        ] as const
    )
  );
  const projectVisiblePortalGrants = customerPortalAccessGrants
    .map((grant) => ({
      grant,
      access:
        projectPortalAccessEntries
          .find(([grantId]) => grantId === grant.id)?.[1]
          .find((access) => access.projectId === project.id) ?? null
    }))
    .filter(({ access }) => access?.status === "active");
  const readinessSnapshot = await getProjectFinancialReadinessSnapshot({
    organizationId: project.organizationId,
    projectId: project.id
  });
  const messageCenterTrail = await getProjectMessageCenterTrail({
    projectId: project.id,
    organizationId: project.organizationId,
    estimateIds: projectEstimates.map((estimate) => estimate.id),
    contractIds: projectContracts.map((contract) => contract.id),
    invoiceIds: projectInvoices.map((invoice) => invoice.id)
  });
  const projectScheduleHref = buildScheduleHref({
    projectId: project.id,
    q: project.name,
    view: "all"
  });
  const fieldTrail = deriveFieldTrailSummary({
    projectId: project.id,
    dailyLogs: projectDailyLogs,
    fieldNotes: projectFieldNotes,
    attachments: projectExecutionAttachments,
    timeCards: projectTimeCards,
    jobs: projectJobs
  });
  const messageCenter = deriveMessageCenterSummary({
    projectId: project.id,
    threads: messageCenterTrail.threads,
    messages: messageCenterTrail.messages,
    deliveryEvents: messageCenterTrail.deliveryEvents,
    signatureEvents: messageCenterTrail.signatureEvents,
    paymentEvents: messageCenterTrail.paymentEvents,
    estimates: projectEstimates.map((estimate) => ({
      id: estimate.id,
      label: `Estimate ${estimate.referenceNumber}`,
      href: `/estimates/${estimate.id}`
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      label: `Contract ${contract.referenceNumber}`,
      href: `/contracts/${contract.id}`
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      label: `Invoice ${invoice.referenceNumber}`,
      href: `/invoices/${invoice.id}`
    })),
    customerAccessCount: projectVisiblePortalGrants.length
  });
  const closeoutTrail = deriveCloseoutTrailSummary({
    projectId: project.id,
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      status: contract.status
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      balanceDueAmount: invoice.balanceDueAmount
    })),
    changeOrders: projectChangeOrders.map((changeOrder) => ({
      id: changeOrder.id,
      status: changeOrder.status
    })),
    fieldTrail,
    messageCenter,
    customerAccessCount: projectVisiblePortalGrants.length,
    warrantyOrServiceItemCount:
      projectWarrantyDocuments.length + projectServiceTickets.length,
    scheduleHref: projectScheduleHref,
    dailyLogsHref: `/daily-logs?projectId=${project.id}`,
    fieldTrailHref: "#fieldtrail",
    messageCenterHref: "#messagecenter",
    serviceWarrantyHref:
      projectWarrantyDocuments.length > 0
        ? `/warranty-documents/${projectWarrantyDocuments[0].id}`
        : `/service-tickets?projectId=${project.id}`
  });
  const proofCenter = deriveProofCenterSummary({
    projectId: project.id,
    estimates: projectEstimates.map((estimate) => ({
      id: estimate.id,
      status: estimate.status
    })),
    contracts: projectContracts.map((contract) => ({
      id: contract.id,
      status: contract.status
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status
    })),
    changeOrders: projectChangeOrders.map((changeOrder) => ({
      id: changeOrder.id,
      status: changeOrder.status
    })),
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus
    })),
    fieldTrail,
    messageCenter,
    customerAccessCount: projectVisiblePortalGrants.length,
    warrantyDocumentCount: projectWarrantyDocuments.length,
    serviceTicketCount: projectServiceTickets.length,
    closeoutReady: closeoutTrail.closeoutTone === "ready",
    latestEstimateHref: projectEstimates[0]
      ? `/estimates/${projectEstimates[0].id}`
      : `/estimates?projectId=${project.id}&customerId=${project.customerId}${
          projectOpportunity?.id
            ? `&opportunityId=${projectOpportunity.id}`
            : ""
        }`,
    latestContractHref: projectContracts[0]
      ? `/contracts/${projectContracts[0].id}`
      : approvedEstimate
        ? `/contracts?estimateId=${approvedEstimate.id}`
        : "/contracts",
    latestInvoiceHref: projectInvoices[0]
      ? `/invoices/${projectInvoices[0].id}`
      : `/invoices?projectId=${project.id}`,
    latestChangeOrderHref: projectChangeOrders[0]
      ? `/change-orders/${projectChangeOrders[0].id}`
      : "/change-orders",
    dailyLogsHref: `/daily-logs?projectId=${project.id}`,
    fieldTrailHref: "#fieldtrail",
    messageCenterHref: "#messagecenter",
    customerAccessHref: `/people?accessCustomerId=${project.customerId}#customer-access`,
    warrantyServiceHref:
      projectWarrantyDocuments.length > 0
        ? `/warranty-documents/${projectWarrantyDocuments[0].id}`
        : `/service-tickets?projectId=${project.id}`
  });
  const projectPulse = deriveProjectPulseSummary({
    projectId: project.id,
    readinessSnapshot,
    readyCheckBlockers: (readinessSnapshot?.blockers ?? []).map(humanize),
    approvedEstimateId: approvedEstimate?.id ?? null,
    latestContractId: latestContract?.id ?? null,
    latestContractStatus: latestContract?.status ?? null,
    jobs: projectJobs.map((job) => ({
      id: job.id,
      dispatchStatus: job.dispatchStatus,
      scheduledDate: job.scheduledDate
    })),
    invoices: projectInvoices.map((invoice) => ({
      id: invoice.id,
      status: invoice.status,
      balanceDueAmount: invoice.balanceDueAmount
    })),
    fieldTrail,
    messageCenter,
    scheduleHref: projectScheduleHref,
    todayIsoDate: new Date().toISOString().slice(0, 10)
  });
  const projectAddress = formatDocumentAddress([
    project.addressLine1,
    project.addressLine2,
    project.city,
    project.stateRegion,
    project.postalCode,
    project.countryCode
  ]);
  const openInvoiceBalance = projectInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );
  const generatedAt = new Date().toISOString();

  return (
    <CustomerDocumentPrintView
      brand={buildDocumentEngineBrand(organizationContext)}
      title={`${project.name} Closeout Package`}
      subtitle="Printable project closeout packet"
      statusLabel={formatStatus(project.status)}
      backHref={getProjectCloseoutPackageBackHref(project.id)}
      backLabel="Back to project"
      exportNotice={getProjectCloseoutPackageExportNotice()}
      footerNote={getProjectCloseoutPackageFooterNote()}
      facts={[
        {
          label: "Customer",
          value:
            project.customer?.companyName ??
            project.customer?.name ??
            "Unknown customer"
        },
        { label: "Project status", value: formatStatus(project.status) },
        { label: "Location", value: projectAddress },
        { label: "Generated", value: formatDateTime(generatedAt) },
        { label: "Closeout", value: closeoutTrail.closeoutStatusLabel },
        {
          label: "Open balance",
          value: formatDocumentMoney(openInvoiceBalance)
        }
      ]}
    >
      <CustomerDocumentSection title="Cover / project summary">
        <SummaryGrid
          items={[
            {
              label: "Project",
              value: project.name,
              detail: project.description ?? "No project description on file."
            },
            {
              label: "Customer",
              value:
                project.customer?.companyName ??
                project.customer?.name ??
                "Unknown customer"
            },
            { label: "Location", value: projectAddress },
            { label: "Generated", value: formatDateTime(generatedAt) },
            { label: "Project status", value: formatStatus(project.status) },
            {
              label: "Customer Access",
              value: formatCount(projectVisiblePortalGrants.length, "contact")
            }
          ]}
        />
      </CustomerDocumentSection>

      <ProjectPulsePrintSection summary={projectPulse} />
      <CloseoutTrailPrintSection summary={closeoutTrail} />
      <ProofCenterPrintSection summary={proofCenter} />

      <CustomerDocumentSection title="Commercial record summary">
        <PrintList
          empty="No estimate, contract, or change order records are connected to this project yet."
          items={[
            ...projectEstimates
              .slice(0, 4)
              .map((estimate) => (
                <SourceCard
                  key={`estimate:${estimate.id}`}
                  title={`Estimate ${estimate.referenceNumber}`}
                  meta={formatStatus(estimate.status)}
                  detail={`Total ${formatDocumentMoney(estimate.totalAmount)} | Updated ${formatDocumentDate(estimate.updatedAt)}`}
                  href={`/estimates/${estimate.id}`}
                />
              )),
            ...projectContracts
              .slice(0, 4)
              .map((contract) => (
                <SourceCard
                  key={`contract:${contract.id}`}
                  title={`Contract ${contract.referenceNumber}`}
                  meta={formatStatus(contract.status)}
                  detail={`Signature status: ${formatStatus(contract.signatureReadinessStatus)} | Updated ${formatDocumentDate(contract.updatedAt)}`}
                  href={`/contracts/${contract.id}`}
                />
              )),
            ...projectChangeOrders
              .slice(0, 4)
              .map((changeOrder) => (
                <SourceCard
                  key={`change-order:${changeOrder.id}`}
                  title={`Change order ${changeOrder.referenceNumber}`}
                  meta={formatStatus(changeOrder.status)}
                  detail={`Adjustment ${formatDocumentMoney(changeOrder.priceAdjustment)} | Updated ${formatDocumentDate(changeOrder.updatedAt)}`}
                  href={`/change-orders/${changeOrder.id}`}
                />
              ))
          ]}
        />
      </CustomerDocumentSection>

      <CustomerDocumentSection title="Billing summary">
        <SummaryGrid
          items={[
            { label: "Invoices", value: projectInvoices.length },
            {
              label: "Payment Trail",
              value: formatCount(messageCenter.paymentTrailCount, "item")
            },
            {
              label: "Open balance",
              value: formatDocumentMoney(openInvoiceBalance)
            }
          ]}
        />
        <div className="mt-4">
          <PrintList
            empty="No invoices are connected to this project yet."
            items={projectInvoices.slice(0, 6).map((invoice) => (
              <SourceCard
                key={invoice.id}
                title={`Invoice ${invoice.referenceNumber}`}
                meta={formatStatus(invoice.status)}
                detail={`Total ${formatDocumentMoney(invoice.totalAmount)} | Balance ${formatDocumentMoney(invoice.balanceDueAmount)}`}
                href={`/invoices/${invoice.id}`}
              />
            ))}
          />
        </div>
      </CustomerDocumentSection>

      <FieldTrailPrintSection summary={fieldTrail} jobs={projectJobs} />
      <MessageCenterPrintSection summary={messageCenter} />

      <CustomerDocumentSection title="Warranty/service handoff">
        <PrintList
          empty="No warranty documents or service tickets are connected to this project yet."
          items={[
            ...projectWarrantyDocuments
              .slice(0, 5)
              .map((document) => (
                <SourceCard
                  key={`warranty:${document.id}`}
                  title={document.title}
                  meta={formatStatus(document.status)}
                  detail={`Warranty basis: ${formatStatus(document.warrantyBasis)} | Ends ${formatDocumentDate(document.warrantyEndDate)}`}
                  href={`/warranty-documents/${document.id}`}
                />
              )),
            ...projectServiceTickets
              .slice(0, 5)
              .map((ticket) => (
                <SourceCard
                  key={`service:${ticket.id}`}
                  title={ticket.title}
                  meta={formatStatus(ticket.status)}
                  detail={`Priority ${formatStatus(ticket.priority)} | Reported ${formatDocumentDate(ticket.reportedOn)}`}
                  href={`/service-tickets/${ticket.id}`}
                />
              ))
          ]}
        />
      </CustomerDocumentSection>
    </CustomerDocumentPrintView>
  );
}
