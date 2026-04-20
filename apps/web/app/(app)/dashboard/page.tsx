import { requireAuthenticatedUser } from "@/lib/auth/session";
import { listContracts } from "@/lib/contracts/data";
import { listCustomers } from "@/lib/customers/data";
import { listDailyLogs } from "@/lib/daily-logs/data";
import { listEstimates } from "@/lib/estimates/data";
import { listInvoices } from "@/lib/invoices/data";
import { listJobs } from "@/lib/jobs/data";
import { listOpportunities } from "@/lib/opportunities/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { listProjects } from "@/lib/projects/data";
import { listOpenTimeCardStates, listTimeCards } from "@/lib/time/data";
import {
  ContractorDashboardSurface,
  type ContractorDashboardSurfaceProps
} from "@/components/dashboard/contractor-dashboard-surface";

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) {
    return "No timestamp";
  }

  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const [
    organizationContext,
    customers,
    opportunities,
    estimates,
    projects,
    contracts,
    jobs,
    invoices,
    openTimeCards,
    timeCards,
    dailyLogs
  ] = await Promise.all([
    getActiveOrganizationContext(user.id),
    listCustomers(),
    listOpportunities(),
    listEstimates(),
    listProjects(),
    listContracts(),
    listJobs(),
    listInvoices(),
    listOpenTimeCardStates(),
    listTimeCards(),
    listDailyLogs()
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const activeProjects = projects.filter((project) => project.status !== "completed");
  const projectsNeedingAttention = activeProjects.slice(0, 5);
  const activeLeadStatuses = new Set([
    "new",
    "contacted",
    "qualified",
    "site_assessment_scheduled",
    "site_assessment_complete",
    "estimating",
    "proposal_sent"
  ]);
  const leadsNeedingFollowUp = opportunities
    .filter((opportunity) => activeLeadStatuses.has(opportunity.status))
    .slice(0, 5);
  const contractsAwaitingAction = contracts
    .filter((contract) => ["draft", "sent", "viewed"].includes(contract.status))
    .slice(0, 5);
  const invoicesAwaitingPayment = invoices
    .filter((invoice) => invoice.status !== "paid" && invoice.status !== "void")
    .sort((left, right) => {
      const dueLeft = left.dueDate ?? "9999-12-31";
      const dueRight = right.dueDate ?? "9999-12-31";
      return dueLeft.localeCompare(dueRight);
    })
    .slice(0, 5);
  const activeJobs = jobs.filter(
    (job) => job.status === "scheduled" || job.status === "in_progress"
  );
  const recentDailyLogs = dailyLogs.slice(0, 4);
  const todayTimeCards = timeCards.filter((card) => card.workDate === today);
  const openInvoiceBalance = invoices
    .filter((invoice) => invoice.status !== "paid" && invoice.status !== "void")
    .reduce((sum, invoice) => sum + Number(invoice.balanceDueAmount), 0);
  const approvedEstimateCount = estimates.filter(
    (estimate) => estimate.status === "approved"
  ).length;
  const todayWorkedMinutes = todayTimeCards.reduce(
    (sum, timeCard) => sum + timeCard.workedMinutes,
    0
  );

  const surfaceProps: ContractorDashboardSurfaceProps = {
    header: {
      organizationName:
        organizationContext?.organization.displayName ?? "Organization setup pending",
      roleLabel: organizationContext?.membership.role ?? "member",
      customerCount: customers.length,
      projectCount: projects.length
    },
    overviewCards: [
      {
        label: "Projects needing attention",
        value: projectsNeedingAttention.length,
        detail: `${activeProjects.length} active projects in motion`,
        href: "/projects"
      },
      {
        label: "Commercial follow-up",
        value: leadsNeedingFollowUp.length,
        detail: `${approvedEstimateCount} approved estimates ready to move`,
        href: "/leads"
      },
      {
        label: "Contracts and invoices",
        value: contractsAwaitingAction.length + invoicesAwaitingPayment.length,
        detail: `${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(openInvoiceBalance)} still open across billing`,
        href: "/invoices"
      }
    ],
    projectItems: projectsNeedingAttention.map((project) => ({
      id: project.id,
      title: project.name,
      subtitle: project.customer?.name ?? "Unknown customer",
      meta: labelize(project.status),
      href: `/projects/${project.id}`,
      searchText: [
        project.name,
        project.customer?.name,
        project.status
      ]
        .filter(Boolean)
        .join(" ")
    })),
    leadItems: leadsNeedingFollowUp.map((lead) => ({
      id: lead.id,
      title: lead.title || lead.prospectName,
      subtitle: lead.customer?.name ?? lead.prospectCompanyName ?? "No customer linked yet",
      meta: labelize(lead.status),
      href: `/leads/${lead.id}`,
      searchText: [
        lead.title,
        lead.prospectName,
        lead.customer?.name,
        lead.status
      ]
        .filter(Boolean)
        .join(" ")
    })),
    contractItems: contractsAwaitingAction.map((contract) => ({
      id: contract.id,
      title: contract.title,
      subtitle:
        contract.project?.name ?? contract.customer?.name ?? "Project context pending",
      meta: labelize(contract.status),
      href: `/contracts/${contract.id}`,
      searchText: [
        contract.title,
        contract.project?.name,
        contract.customer?.name,
        contract.status
      ]
        .filter(Boolean)
        .join(" ")
    })),
    invoiceItems: invoicesAwaitingPayment.map((invoice) => ({
      id: invoice.id,
      title: invoice.referenceNumber,
      subtitle:
        invoice.project?.name ?? invoice.customer?.name ?? "Project context pending",
      meta: `${labelize(invoice.status)} - due ${formatShortDate(invoice.dueDate)}`,
      valueLabel: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(Number(invoice.balanceDueAmount)),
      href: `/invoices/${invoice.id}`,
      searchText: [
        invoice.referenceNumber,
        invoice.project?.name,
        invoice.customer?.name,
        invoice.status
      ]
        .filter(Boolean)
        .join(" ")
    })),
    timeItems: openTimeCards.slice(0, 4).map((timeCard) => ({
      id: timeCard.id,
      title: timeCard.person?.displayName ?? "Unknown worker",
      subtitle: timeCard.project?.name ?? "No project selected",
      meta: `${labelize(timeCard.currentPunchState)} - started ${formatTimestamp(
        timeCard.punchInAt
      )}`,
      href: "/time",
      searchText: [
        timeCard.person?.displayName,
        timeCard.project?.name,
        timeCard.currentPunchState
      ]
        .filter(Boolean)
        .join(" ")
    })),
    executionItems: recentDailyLogs.map((dailyLog) => ({
      id: dailyLog.id,
      title: dailyLog.project?.name ?? "Project context pending",
      subtitle:
        dailyLog.summary ?? dailyLog.workCompleted ?? "Daily execution log",
      meta: `${labelize(dailyLog.status)} - ${formatShortDate(dailyLog.logDate)}`,
      href: `/daily-logs/${dailyLog.id}`,
      searchText: [
        dailyLog.project?.name,
        dailyLog.summary,
        dailyLog.workCompleted,
        dailyLog.status
      ]
        .filter(Boolean)
        .join(" ")
    })),
    summary: {
      receivablesLabel: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0
      }).format(openInvoiceBalance),
      activeJobsLabel: String(activeJobs.length),
      workedTodayLabel: formatHours(todayWorkedMinutes),
      openSessionsLabel: String(openTimeCards.length)
    }
  };

  return <ContractorDashboardSurface {...surfaceProps} />;
}
