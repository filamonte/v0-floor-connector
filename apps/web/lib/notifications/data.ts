import "server-only";

import { cache } from "react";

import { listAppointments } from "@/lib/appointments/data";
import { listContracts } from "@/lib/contracts/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobAssignmentsByJobIds, listJobs } from "@/lib/jobs/data";
import { listProgressBillingWorkspaces } from "@/lib/progress-billing/data";
import { listPunchlistItems } from "@/lib/punchlists/data";
import type {
  ContractorNotificationItem,
  ContractorNotificationSection,
  ContractorNotificationsSummary
} from "@/lib/notifications/types";

const MAX_VISIBLE_PER_SECTION = 2;
const MAX_VISIBLE_ITEMS = 6;

function formatCurrency(value: number | string) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

function buildJobsSection(input: {
  jobs: Awaited<ReturnType<typeof listJobs>>;
  assignmentCountsByJobId: Map<string, number>;
}): ContractorNotificationSection | null {
  const unscheduledJobs = input.jobs.filter((job) => job.dispatchStatus === "unscheduled");
  const scheduledJobsMissingCrew = input.jobs.filter((job) => {
    if (job.dispatchStatus === "unscheduled" || job.dispatchStatus === "completed") {
      return false;
    }

    return (input.assignmentCountsByJobId.get(job.id) ?? 0) === 0;
  });
  const items: ContractorNotificationItem[] = [
    ...unscheduledJobs.slice(0, MAX_VISIBLE_PER_SECTION).map((job) => ({
      id: `job-unscheduled-${job.id}`,
      category: "jobs" as const,
      tone: "critical" as const,
      title: job.project?.name ?? "Unscheduled job",
      description: `${
        job.customer?.name ?? "Unknown customer"
      } still needs a committed schedule date before work can move.`,
      href: `/schedule?action=schedule&jobId=${job.id}#schedule-action`,
      badge: "Unscheduled",
      contextHref: job.project ? `/projects/${job.project.id}` : null,
      contextLabel: job.project ? "Open project" : null
    })),
    ...scheduledJobsMissingCrew.slice(0, MAX_VISIBLE_PER_SECTION).map((job) => ({
      id: `job-missing-crew-${job.id}`,
      category: "jobs" as const,
      tone: "warning" as const,
      title: job.project?.name ?? "Scheduled job",
      description: `${
        job.scheduledDate ? `Scheduled ${formatShortDate(job.scheduledDate)}` : "Scheduled work"
      } is still missing crew assignment.`,
      href: `/schedule?action=assign&jobId=${job.id}#schedule-action`,
      badge: "Needs crew",
      contextHref: job.project ? `/projects/${job.project.id}` : null,
      contextLabel: job.project ? "Open project" : null
    }))
  ];

  const count = unscheduledJobs.length + scheduledJobsMissingCrew.length;

  if (count === 0) {
    return null;
  }

  return {
    key: "jobs",
    label: "Jobs / scheduling",
    count,
    items
  };
}

function buildCollectionsSection(
  invoices: Awaited<ReturnType<typeof listInvoices>>,
  todayKey: string
): ContractorNotificationSection | null {
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );
  const overdueInvoices = openInvoices
    .filter((invoice) => Boolean(invoice.dueDate && invoice.dueDate < todayKey))
    .sort((left, right) =>
      (left.dueDate ?? "9999-12-31").localeCompare(right.dueDate ?? "9999-12-31")
    );

  if (overdueInvoices.length > 0) {
    return {
      key: "collections",
      label: "Collections pressure",
      count: overdueInvoices.length,
      items: overdueInvoices.slice(0, MAX_VISIBLE_PER_SECTION).map((invoice) => ({
        id: `invoice-overdue-${invoice.id}`,
        category: "collections",
        tone: "critical",
        title: invoice.referenceNumber,
        description: `${
          invoice.customer?.name ?? "Unknown customer"
        } is overdue since ${invoice.dueDate ? formatShortDate(invoice.dueDate) : "the due date"}.`,
        href: `/invoices/${invoice.id}`,
        badge: "Overdue",
        contextHref: invoice.project ? `/projects/${invoice.project.id}` : "/payments",
        contextLabel: invoice.project ? "Open project" : "Open payments"
      }))
    };
  }

  const openReceivables = openInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );

  if (openInvoices.length >= 3 && openReceivables > 0) {
    return {
      key: "collections",
      label: "Collections pressure",
      count: openInvoices.length,
      items: [
        {
          id: "invoice-open-collections-pressure",
          category: "collections",
          tone: "warning",
          title: "Open collections pressure is building",
          description: `${openInvoices.length} invoices still carry ${formatCurrency(
            openReceivables
          )} in open balances.`,
          href: "/payments",
          badge: "Open balances"
        }
      ]
    };
  }

  return null;
}

function buildContractsSection(
  contracts: Awaited<ReturnType<typeof listContracts>>
): ContractorNotificationSection | null {
  const awaitingSignature = contracts.filter((contract) => {
    if (contract.status === "signed" || contract.status === "void") {
      return false;
    }

    if (contract.customerSignedAt && !contract.contractorCountersignedAt) {
      return true;
    }

    return contract.status === "sent" || contract.status === "viewed";
  });

  if (awaitingSignature.length === 0) {
    return null;
  }

  return {
    key: "contracts",
    label: "Contracts",
    count: awaitingSignature.length,
    items: awaitingSignature.slice(0, MAX_VISIBLE_PER_SECTION).map((contract) => ({
      id: `contract-${contract.id}`,
      category: "contracts",
      tone: contract.customerSignedAt && !contract.contractorCountersignedAt
        ? "critical"
        : "warning",
      title: contract.title,
      description:
        contract.customerSignedAt && !contract.contractorCountersignedAt
          ? `Customer signed on ${formatDateTime(
              contract.customerSignedAt
            )}. Contractor countersign is still blocking completion.`
          : contract.customerViewedAt
            ? `Customer viewed on ${formatDateTime(
                contract.customerViewedAt
              )}. Signature is still outstanding.`
            : contract.sentAt
              ? `Sent on ${formatDateTime(
                  contract.sentAt
                )}. Signature is still outstanding.`
              : "Signature activity is still blocking the project handoff.",
      href: `/contracts/${contract.id}`,
      badge:
        contract.customerSignedAt && !contract.contractorCountersignedAt
          ? "Countersign"
          : "Awaiting signature",
      contextHref: contract.project ? `/projects/${contract.project.id}` : null,
      contextLabel: contract.project ? "Open project" : null
    }))
  };
}

function buildAppointmentsSection(
  appointments: Awaited<ReturnType<typeof listAppointments>>,
  today: Date
): ContractorNotificationSection | null {
  const upcomingHorizon = addDays(today, 3);
  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const upcomingAppointments = scheduledAppointments.filter((appointment) => {
    const startsAt = new Date(appointment.startsAt);
    return startsAt >= today && startsAt < upcomingHorizon;
  });

  if (upcomingAppointments.length === 0) {
    return null;
  }

  return {
    key: "appointments",
    label: "Appointments",
    count: upcomingAppointments.length,
    items: upcomingAppointments
      .slice(0, MAX_VISIBLE_PER_SECTION)
      .map((appointment) => {
        const startsAt = new Date(appointment.startsAt);
        const isToday =
          startsAt.toISOString().slice(0, 10) === today.toISOString().slice(0, 10);

        return {
          id: `appointment-${appointment.id}`,
          category: "appointments" as const,
          tone: isToday ? "warning" : "neutral",
          title: appointment.title,
          description: `${isToday ? "Today" : "Upcoming"} at ${formatDateTime(
            appointment.startsAt
          )}${appointment.project?.name ? ` for ${appointment.project.name}` : ""}.`,
          href: `/appointments/${appointment.id}`,
          badge: isToday ? "Today" : "Upcoming",
          contextHref: appointment.project ? `/projects/${appointment.project.id}` : null,
          contextLabel: appointment.project ? "Open project" : null
        };
      })
  };
}

function buildPunchlistsSection(
  punchlistItems: Awaited<ReturnType<typeof listPunchlistItems>>,
  todayKey: string
): ContractorNotificationSection | null {
  const openPunchlists = punchlistItems.filter(
    (item) => item.status === "open" || item.status === "in_progress"
  );

  if (openPunchlists.length === 0) {
    return null;
  }

  const overdueCount = openPunchlists.filter(
    (item) => Boolean(item.dueDate && item.dueDate < todayKey)
  ).length;
  const nextDueItem = openPunchlists.find((item) => item.dueDate) ?? openPunchlists[0];

  return {
    key: "punchlists",
    label: "Punchlists",
    count: openPunchlists.length,
    items: [
      {
        id: "punchlists-open-summary",
        category: "punchlists",
        tone: overdueCount > 0 ? "warning" : "neutral",
        title: `${openPunchlists.length} punchlist item${
          openPunchlists.length === 1 ? "" : "s"
        } still need closeout`,
        description: overdueCount > 0
          ? `${overdueCount} are overdue, and ${
              nextDueItem.project?.name ?? "project closeout"
            } still needs follow-through.`
          : `${
              nextDueItem.project?.name ?? "Project closeout"
            } still has open corrective work on the shared execution chain.`,
        href: "/punchlists",
        badge: overdueCount > 0 ? "Overdue items" : "Open items",
        contextHref: nextDueItem.project ? `/projects/${nextDueItem.project.id}` : null,
        contextLabel: nextDueItem.project ? "Open project" : null
      }
    ]
  };
}

function buildProgressBillingSection(
  workspaces: Awaited<ReturnType<typeof listProgressBillingWorkspaces>>
): ContractorNotificationSection | null {
  const readyToBill = workspaces.filter((workspace) => workspace.status === "ready_to_bill");

  if (readyToBill.length === 0) {
    return null;
  }

  const leadWorkspace = readyToBill[0];

  return {
    key: "progress-billing",
    label: "Progress billing",
    count: readyToBill.length,
    items: [
      {
        id: "progress-billing-ready-summary",
        category: "progress-billing",
        tone: "neutral",
        title: `${readyToBill.length} progress billing workspace${
          readyToBill.length === 1 ? "" : "s"
        } ready to bill`,
        description: `${leadWorkspace.project?.name ?? "Approved scope"} has ${formatCurrency(
          leadWorkspace.currentBillableTotal
        )} ready for the next draw.`,
        href: readyToBill.length === 1 ? `/progress-billing/${leadWorkspace.id}` : "/progress-billing",
        badge: "Ready to bill",
        contextHref: leadWorkspace.project ? `/projects/${leadWorkspace.project.id}` : null,
        contextLabel: leadWorkspace.project ? "Open project" : null
      }
    ]
  };
}

export const listContractorNotifications = cache(
  async (): Promise<ContractorNotificationsSummary> => {
    const today = startOfToday();
    const todayKey = today.toISOString().slice(0, 10);
    const [jobs, contracts, invoices, appointments, punchlistItems, progressBillingWorkspaces] =
      await Promise.all([
        listJobs(),
        listContracts(),
        listInvoices(),
        listAppointments(),
        listPunchlistItems(),
        listProgressBillingWorkspaces()
      ]);
    const assignmentsByJobId = await listJobAssignmentsByJobIds(
      jobs.map((job) => job.id),
      "/dashboard"
    );
    const assignmentCountsByJobId = new Map(
      jobs.map((job) => [job.id, assignmentsByJobId.get(job.id)?.length ?? 0])
    );
    const sections = [
      buildJobsSection({ jobs, assignmentCountsByJobId }),
      buildCollectionsSection(invoices, todayKey),
      buildContractsSection(contracts),
      buildAppointmentsSection(appointments, today),
      buildPunchlistsSection(punchlistItems, todayKey),
      buildProgressBillingSection(progressBillingWorkspaces)
    ].filter(Boolean) as ContractorNotificationSection[];
    const visibleItems = sections.flatMap((section) => section.items).slice(0, MAX_VISIBLE_ITEMS);
    const totalCount = sections.reduce((sum, section) => sum + section.count, 0);

    return {
      totalCount,
      sections,
      visibleItems
    };
  }
);
