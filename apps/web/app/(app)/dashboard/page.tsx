import { ContractorDashboardSurface } from "@/components/dashboard/contractor-dashboard-surface";
import { listAppointments } from "@/lib/appointments/data";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { quickCreateChangeOrderAction } from "@/lib/change-orders/actions";
import { quickCreateContractFromEstimateAction } from "@/lib/contracts/actions";
import {
  listApprovedEstimatesForContracts,
  listContracts
} from "@/lib/contracts/data";
import { quickCreateCustomerAction } from "@/lib/customers/actions";
import { listCustomers } from "@/lib/customers/data";
import { quickCreateEstimateAction } from "@/lib/estimates/actions";
import { listEstimates } from "@/lib/estimates/data";
import { quickCreateInvoiceAction } from "@/lib/invoices/actions";
import { listInvoices } from "@/lib/invoices/data";
import { quickCreateJobAction } from "@/lib/jobs/actions";
import { listJobs } from "@/lib/jobs/data";
import { listContractorNotifications } from "@/lib/notifications/data";
import { quickCreateOpportunityAction } from "@/lib/opportunities/actions";
import { listOpportunities } from "@/lib/opportunities/data";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getOrganizationFinancialSettings } from "@/lib/organizations/financial-settings";
import { getOrganizationWorkflowSettings } from "@/lib/organizations/workflow-settings";
import { listPayments } from "@/lib/payments/data";
import { listPunchlistItems } from "@/lib/punchlists/data";
import { listProgressBillingWorkspaces } from "@/lib/progress-billing/data";
import { quickCreateProjectAction } from "@/lib/projects/actions";
import { listProjects } from "@/lib/projects/data";

function formatCurrency(value: number | string, maximumFractionDigits = 0) {
  return Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits
  });
}

function formatShortDate(value: string | null | undefined) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "No timestamp";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function labelize(value: string) {
  return value.replaceAll("_", " ");
}

function isOverdueInvoice(dueDate: string | null, today: string) {
  return Boolean(dueDate && dueDate < today);
}

function buildSearchText(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser("/dashboard");
  const organizationContext = await getActiveOrganizationContext(user.id);

  const [
    customers,
    opportunities,
    estimates,
    approvedEstimates,
    projects,
    contracts,
    jobs,
    appointments,
    punchlistItems,
    invoices,
    payments,
    notifications,
    progressBillingWorkspaces,
    financialSettings,
    workflowSettings
  ] = await Promise.all([
    listCustomers(),
    listOpportunities(),
    listEstimates(),
    listApprovedEstimatesForContracts(),
    listProjects(),
    listContracts(),
    listJobs(),
    listAppointments(),
    listPunchlistItems(),
    listInvoices(),
    listPayments(),
    listContractorNotifications(),
    listProgressBillingWorkspaces(),
    organizationContext
      ? getOrganizationFinancialSettings(organizationContext.organization.id)
      : Promise.resolve(null),
    organizationContext
      ? getOrganizationWorkflowSettings(organizationContext.organization.id)
      : Promise.resolve(null)
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const activeLeadStatuses = new Set([
    "new",
    "contacted",
    "qualified",
    "site_assessment_scheduled",
    "site_assessment_complete",
    "estimating",
    "proposal_sent"
  ]);
  const activeProjects = projects.filter((project) => project.status !== "completed");
  const openInvoices = invoices.filter(
    (invoice) => invoice.status !== "paid" && invoice.status !== "void"
  );
  const overdueInvoices = openInvoices
    .filter((invoice) => isOverdueInvoice(invoice.dueDate, today))
    .sort((left, right) =>
      (left.dueDate ?? "9999-12-31").localeCompare(right.dueDate ?? "9999-12-31")
    );
  const leadsNeedingFollowUp = opportunities
    .filter((opportunity) => activeLeadStatuses.has(opportunity.status))
    .slice(0, 5);
  const estimatesAwaitingAction = estimates
    .filter((estimate) => ["draft", "sent", "rejected"].includes(estimate.status))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
  const contractsAwaitingAction = contracts
    .filter((contract) => ["draft", "sent", "viewed"].includes(contract.status))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 5);
  const projectsNeedingAttention = activeProjects.slice(0, 5);
  const jobsNeedingScheduling = jobs
    .filter((job) => job.dispatchStatus === "unscheduled")
    .slice(0, 5);
  const jobsTodayOrInProgress = jobs
    .filter(
      (job) => job.dispatchStatus === "in_progress" || job.scheduledDate === today
    )
    .sort((left, right) => {
      if (left.dispatchStatus === "in_progress" && right.dispatchStatus !== "in_progress") {
        return -1;
      }

      if (left.dispatchStatus !== "in_progress" && right.dispatchStatus === "in_progress") {
        return 1;
      }

      return (left.scheduledStartAt ?? left.updatedAt).localeCompare(
        right.scheduledStartAt ?? right.updatedAt
      );
    })
    .slice(0, 5);
  const scheduledAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled"
  );
  const appointmentsToday = scheduledAppointments
    .filter((appointment) => {
      const appointmentDate = new Date(appointment.startsAt);
      return appointmentDate.toISOString().slice(0, 10) === today;
    })
    .slice(0, 5);
  const openPunchlistCount = punchlistItems.filter(
    (item) => item.status === "open" || item.status === "in_progress"
  ).length;
  const progressBillingReadyCount = progressBillingWorkspaces.filter(
    (workspace) => workspace.status === "ready_to_bill"
  ).length;
  const recentPayments = payments.filter((payment) => payment.status !== "void").slice(0, 5);
  const openReceivables = openInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balanceDueAmount),
    0
  );
  const attentionWidget =
    notifications.visibleItems.length > 0
      ? {
          key: "contractor-attention",
          eyebrow: "Action awareness",
          title: "High-signal attention",
          description:
            "The same shell-level awareness feed is surfaced here so schedule, collections, contracts, appointments, punchlists, and billing pressure are visible from the home board.",
          href: notifications.visibleItems[0]?.href ?? "/dashboard",
          actionLabel: "Open first item",
          emptyTitle: "No high-signal attention items are active right now.",
          emptyDescription:
            "As real contractor workflow pressure builds, it will surface here and in the shared header attention center.",
          items: notifications.visibleItems.map((item) => ({
            id: item.id,
            title: item.title,
            subtitle: item.description,
            meta: item.badge,
            href: item.href,
            actionLabel: "Open",
            badge: item.category.replaceAll("-", " "),
            contextHref: item.contextHref ?? null,
            contextLabel: item.contextLabel ?? null,
            searchText: [item.title, item.description, item.badge, item.category].join(" ")
          }))
        }
      : {
          key: "contractor-attention",
          eyebrow: "Action awareness",
          title: "High-signal attention",
          description:
            "The same shell-level awareness feed is surfaced here so schedule, collections, contracts, appointments, punchlists, and billing pressure are visible from the home board.",
          href: "/dashboard",
          actionLabel: "Stay on dashboard",
          emptyTitle: "No high-signal attention items are active right now.",
          emptyDescription:
            "As real contractor workflow pressure builds, it will surface here and in the shared header attention center.",
          items: []
        };

  return (
    <ContractorDashboardSurface
      header={{
        organizationName:
          organizationContext?.organization.displayName ?? "Organization setup pending",
        currentRole: organizationContext?.membership.role ?? "member",
        roleLabel: organizationContext?.membership.role ?? "member",
        activeProjectCount: activeProjects.length,
        openReceivablesLabel: formatCurrency(openReceivables)
      }}
      metrics={[
        {
          key: "leads-follow-up",
          label: "Leads needing follow-up",
          value: String(leadsNeedingFollowUp.length),
          detail:
            "Upstream opportunity work still waiting on qualification, assessment, or commercial follow-through.",
          href: "/opportunities"
        },
        {
          key: "estimates-awaiting-action",
          label: "Estimates awaiting action",
          value: String(estimatesAwaitingAction.length),
          detail:
            "Draft, sent, or rejected estimate work that still needs commercial attention.",
          href: "/estimates"
        },
        {
          key: "jobs-needing-schedule",
          label: "Jobs needing schedule",
          value: String(jobsNeedingScheduling.length),
          detail:
            "Execution records already exist, but planned dates still need to be assigned.",
          href: "/schedule?view=unscheduled"
        },
        {
          key: "appointments-today",
          label: "Appointments today",
          value: String(appointmentsToday.length),
          detail:
            "Site visits, estimate meetings, and follow-up blocks stay visible without becoming a second job scheduler.",
          href: "/calendar"
        },
        {
          key: "jobs-today",
          label: "Jobs today / live",
          value: String(jobsTodayOrInProgress.length),
          detail:
            "Today's scheduled work and active in-progress jobs stay visible from one surface.",
          href: "/schedule?view=today"
        }
      ]}
      attentionWidget={attentionWidget}
      commercialWidgets={[
        {
          key: "leads",
          eyebrow: "Commercial follow-up",
          title: "Leads / opportunities needing follow-up",
          description:
            "Keep the early revenue queue visible so qualification and estimating work move before projects stall.",
          href: "/opportunities",
          actionLabel: "Open leads",
          emptyTitle: "No leads are waiting on follow-up.",
          emptyDescription:
            "When new, qualified, or proposal-stage opportunities need attention, they will surface here.",
          items: leadsNeedingFollowUp.map((lead) => ({
            id: lead.id,
            title: lead.title || lead.prospectName,
            subtitle:
              lead.customer?.name ??
              lead.prospectCompanyName ??
              "Prospect not linked to a customer yet",
            meta: `${labelize(lead.status)} - upstream opportunity record`,
            href: `/leads/${lead.id}`,
            actionLabel: "Open lead",
            badge: labelize(lead.status),
            contextHref: lead.project?.id ? `/projects/${lead.project.id}` : null,
            contextLabel: lead.project?.id ? "Open project" : null,
            searchText: buildSearchText(
              lead.title,
              lead.prospectName,
              lead.customer?.name,
              lead.prospectCompanyName,
              lead.status
            )
          }))
        },
        {
          key: "estimates",
          eyebrow: "Proposal queue",
          title: "Estimates awaiting action",
          description:
            "Draft scope, customer follow-up, and revision work stays visible before the estimate chain goes quiet.",
          href: "/estimates",
          actionLabel: "Open estimates",
          emptyTitle: "No estimates need immediate action.",
          emptyDescription:
            "Draft, sent, or revised commercial records will surface here when the proposal queue needs attention.",
          items: estimatesAwaitingAction.map((estimate) => ({
            id: estimate.id,
            title: estimate.referenceNumber,
            subtitle: `${estimate.customer?.name ?? "Unknown customer"} - ${estimate.project?.name ?? "Unknown project"}`,
            meta: `${labelize(estimate.status)} - updated ${formatDateTime(estimate.updatedAt)}`,
            href: `/estimates/${estimate.id}`,
            actionLabel:
              estimate.status === "draft" ? "Finish estimate" : "Open estimate",
            badge: labelize(estimate.status),
            trailing: formatCurrency(estimate.totalAmount),
            contextHref: estimate.project ? `/projects/${estimate.project.id}` : null,
            contextLabel: estimate.project ? "Open project" : null,
            searchText: buildSearchText(
              estimate.referenceNumber,
              estimate.customer?.name,
              estimate.project?.name,
              estimate.status
            )
          }))
        },
        {
          key: "contracts",
          eyebrow: "Signature queue",
          title: "Contracts awaiting send or signature",
          description:
            "Draft contracts, sent records, and viewed signature work stay tied to the same project and estimate handoff.",
          href: "/contracts",
          actionLabel: "Open contracts",
          emptyTitle: "No contracts are waiting on send or signature.",
          emptyDescription:
            "Drafts, sent contracts, and viewed signature records will appear here when they need the next commercial handoff.",
          items: contractsAwaitingAction.map((contract) => ({
            id: contract.id,
            title: contract.title,
            subtitle: `${contract.customer?.name ?? "Unknown customer"} - ${contract.project?.name ?? "Unknown project"}`,
            meta: `${labelize(contract.status)} - project readiness still depends on this commercial step`,
            href: `/contracts/${contract.id}`,
            actionLabel:
              contract.status === "draft" ? "Send contract" : "Open contract",
            badge: labelize(contract.status),
            contextHref: contract.project ? `/projects/${contract.project.id}` : null,
            contextLabel: contract.project ? "Open project" : null,
            searchText: buildSearchText(
              contract.title,
              contract.customer?.name,
              contract.project?.name,
              contract.estimate?.referenceNumber,
              contract.status
            )
          }))
        }
      ]}
      operationsWidgets={[
        {
          key: "projects",
          eyebrow: "Project continuity",
          title: "Projects needing attention",
          description:
            "Projects stay as the operational root, with the dashboard surfacing where continuity or next-step follow-through still matters.",
          href: "/projects",
          actionLabel: "Open projects",
          emptyTitle: "No active projects need attention right now.",
          emptyDescription:
            "Broader blocker scoring is still growing, but active projects will keep surfacing here as continuity work concentrates.",
          items: projectsNeedingAttention.map((project) => ({
            id: project.id,
            title: project.name,
            subtitle: project.customer?.name ?? "Unknown customer",
            meta: `${labelize(project.status)} - open the project workspace for estimates, contracts, jobs, invoices, and continuity`,
            href: `/projects/${project.id}`,
            actionLabel: "Open project",
            badge: labelize(project.status),
            searchText: buildSearchText(
              project.name,
              project.customer?.name,
              project.customer?.companyName,
              project.status
            )
          }))
        },
        {
          key: "jobs-needing-schedule",
          eyebrow: "Scheduling pressure",
          title: "Jobs needing scheduling",
          description:
            "These jobs already exist on the canonical project chain, but the schedule and crew handoff still need to happen.",
          href: "/schedule?view=unscheduled",
          actionLabel: "Open schedule",
          emptyTitle: "No jobs are waiting for scheduling.",
          emptyDescription:
            "As unscheduled jobs enter the execution queue, they will surface here for operational follow-through.",
          items: jobsNeedingScheduling.map((job) => ({
            id: job.id,
            title: job.project?.name ?? "Untitled job",
            subtitle: `${job.customer?.name ?? "Unknown customer"} - ${job.estimate?.referenceNumber ?? "Created from project chain"}`,
            meta: "Unscheduled - set the work date, then assign crew from the same job record",
            href: `/jobs/${job.id}`,
            actionLabel: "Open job",
            badge: "Needs schedule",
            contextHref: job.project ? `/projects/${job.project.id}` : null,
            contextLabel: job.project ? "Open project" : null,
            searchText: buildSearchText(
              job.project?.name,
              job.customer?.name,
              job.estimate?.referenceNumber,
              job.dispatchStatus
            )
          }))
        },
        {
          key: "jobs-today",
          eyebrow: "Execution today",
          title: "Jobs today / in progress",
          description:
            "Today's work stays visible from one home surface without turning the dashboard into a separate dispatch system.",
          href: "/schedule?view=today",
          actionLabel: "Open today",
          emptyTitle: "No jobs are scheduled for today right now.",
          emptyDescription:
            "Once near-term work is scheduled or crews are in progress, it will surface here for day-of follow-through.",
          items: jobsTodayOrInProgress.map((job) => ({
            id: job.id,
            title: job.project?.name ?? "Untitled job",
            subtitle: `${job.customer?.name ?? "Unknown customer"} - ${job.estimate?.referenceNumber ?? "Created from project chain"}`,
            meta: `${
              job.dispatchStatus === "in_progress"
                ? "in progress"
                : `scheduled ${formatShortDate(job.scheduledDate)}`
            } - crew and schedule stay on the same job record`,
            href: `/jobs/${job.id}`,
            actionLabel:
              job.dispatchStatus === "in_progress"
                ? "Open live job"
                : "Open scheduled job",
            badge:
              job.dispatchStatus === "in_progress"
                ? "In progress"
                : job.scheduledDate === today
                  ? "Today"
                  : "Scheduled",
            contextHref: job.project ? `/projects/${job.project.id}` : null,
            contextLabel: job.project ? "Open project" : null,
            searchText: buildSearchText(
              job.project?.name,
              job.customer?.name,
              job.estimate?.referenceNumber,
              job.dispatchStatus,
              job.scheduledDate
            )
          }))
        }
      ]}
      financeWidgets={[
        {
          key: "unpaid-invoices",
          eyebrow: "Collections watch",
          title: "Unpaid / overdue invoices",
          description:
            "Keep collection pressure visible on the dashboard, but continue the real billing work in the invoice workspace and payments manager.",
          href: "/payments",
          actionLabel: "Open payments",
          emptyTitle: "No unpaid or overdue invoices need attention right now.",
          emptyDescription:
            "As open balances age, the related invoices will surface here for collections follow-through.",
          items: (overdueInvoices.length > 0 ? overdueInvoices : openInvoices.slice(0, 5)).map(
            (invoice) => ({
              id: invoice.id,
              title: invoice.referenceNumber,
              subtitle: `${invoice.customer?.name ?? "Unknown customer"} - ${invoice.project?.name ?? "Unknown project"}`,
              meta: `${
                isOverdueInvoice(invoice.dueDate, today)
                  ? "overdue"
                  : labelize(invoice.status)
              } - due ${formatShortDate(invoice.dueDate)}`,
              href: `/invoices/${invoice.id}`,
              actionLabel: "Open invoice",
              badge: isOverdueInvoice(invoice.dueDate, today) ? "Overdue" : "Open",
              trailing: formatCurrency(invoice.balanceDueAmount),
              contextHref: invoice.project ? `/projects/${invoice.project.id}` : null,
              contextLabel: invoice.project ? "Open project" : null,
              searchText: buildSearchText(
                invoice.referenceNumber,
                invoice.customer?.name,
                invoice.project?.name,
                invoice.status,
                invoice.dueDate
              )
            })
          )
        },
        {
          key: "recent-payments",
          eyebrow: "Cash movement",
          title: "Recent payment activity",
          description:
            "Recent payment rows keep cash movement visible without pulling finance out of the same invoice and project chain.",
          href: "/payments",
          actionLabel: "Open payments",
          emptyTitle: "No recent payment activity has posted yet.",
          emptyDescription:
            "As recorded and pending payments move through the canonical payment chain, they will surface here.",
          items: recentPayments.map((payment) => ({
            id: payment.id,
            title: payment.invoice?.referenceNumber ?? "Payment activity",
            subtitle: `${payment.customer?.name ?? "Unknown customer"} - ${payment.project?.name ?? "Unknown project"}`,
            meta: `${labelize(payment.status)} - ${formatDateTime(payment.createdAt)}`,
            href: `/invoices/${payment.invoiceId}`,
            actionLabel: "Open invoice",
            badge:
              payment.paymentSource === "customer_portal"
                ? "Portal"
                : labelize(payment.paymentSource),
            trailing: formatCurrency(payment.amount),
            contextHref: payment.project ? `/projects/${payment.project.id}` : null,
            contextLabel: payment.project ? "Open project" : null,
            searchText: buildSearchText(
              payment.invoice?.referenceNumber,
              payment.customer?.name,
              payment.project?.name,
              payment.status,
              payment.paymentMethod,
              payment.paymentSource
            )
          }))
        }
      ]}
      shortcuts={[
        {
          key: "cost-items-database",
          label: "Cost items database",
          description:
            "Open the canonical catalog, systems, and optional inventory workspace that feeds estimates without changing pricing logic.",
          href: "/cost-items-database",
          metric: "Module"
        },
        {
          key: "appointments",
          label: "Appointments",
          description:
            "Run commercial and customer-facing visits from the same canonical lead, customer, and project chain.",
          href: "/calendar",
          metric: `${scheduledAppointments.length} scheduled`
        },
        {
          key: "schedule",
          label: "Schedule manager",
          description:
            "Cross-project schedule review, crew visibility, and near-term board scanning.",
          href: "/schedule",
          metric: `${jobsNeedingScheduling.length} unscheduled`
        },
        {
          key: "payments",
          label: "Payments manager",
          description:
            "Recorded, pending, failed, and open collection activity on the same billing chain.",
          href: "/payments",
          metric: formatCurrency(openReceivables)
        },
        {
          key: "projects",
          label: "Projects",
          description:
            "Open the operational root for readiness, execution, and downstream continuity.",
          href: "/projects",
          metric: `${activeProjects.length} active`
        },
        {
          key: "estimates",
          label: "Estimates",
          description:
            "Review pipeline, follow-up, and approved commercial work ready for the next step.",
          href: "/estimates",
          metric: `${estimates.length} total`
        },
        {
          key: "punchlists",
          label: "Punchlists",
          description:
            "Review project and job closeout items on the same execution chain.",
          href: "/punchlists",
          metric: `${openPunchlistCount} active`
        },
        {
          key: "progress-billing",
          label: "Progress billing",
          description:
            "Review schedule-of-values state and turn approved-scope progress into canonical invoices.",
          href: "/progress-billing",
          metric: `${progressBillingReadyCount} ready`
        },
        {
          key: "customers",
          label: "Customers",
          description:
            "Open the canonical account records that anchor projects and billing defaults.",
          href: "/customers",
          metric: `${customers.length} records`
        }
      ]}
      placeholders={[
        {
          key: "advanced-scheduling",
          title: "Advanced dispatch controls",
          description:
            "The shared schedule workspace is live, but drag-and-drop rescheduling, deeper crew-calendar coordination, and fuller dispatch controls are still missing.",
          priority: "High"
        },
        {
          key: "time-clock-system",
          title: "Workforce approvals and management",
          description:
            "The contractor-side time home is live on the canonical punch-event and time-card chain, but approvals, payroll-adjacent review, and broader workforce management are still intentionally out of scope.",
          priority: "High"
        }
      ]}
      quickCreate={{
        defaultRetainagePercentage:
          financialSettings?.defaultRetainagePercentage ?? "0.00",
        customerOptions: customers,
        opportunityOptions: opportunities.map((opportunity) => ({
          id: opportunity.id,
          title: opportunity.title,
          contactName:
            opportunity.primaryContact?.displayName ?? opportunity.prospectName,
          customerName: opportunity.customer?.name ?? null,
          jobType: opportunity.jobType,
          siteName: opportunity.siteName,
          status: opportunity.status
        })),
        projectOptions: projects.map((project) => ({
          id: project.id,
          name: project.name,
          customerName: project.customer?.name ?? null
        })),
        approvedEstimateOptions: approvedEstimates.map((estimate) => ({
          id: estimate.id,
          referenceNumber: estimate.referenceNumber,
          projectName: estimate.project?.name ?? null
        })),
        contractOptions: contracts.map((contract) => ({
          id: contract.id,
          projectId: contract.projectId,
          title: contract.title,
          status: contract.status
        })),
        invoiceOptions: invoices.map((invoice) => ({
          id: invoice.id,
          projectId: invoice.projectId,
          referenceNumber: invoice.referenceNumber,
          status: invoice.status
        })),
        actions: {
          lead: quickCreateOpportunityAction,
          customer: quickCreateCustomerAction,
          project: quickCreateProjectAction,
          estimate: quickCreateEstimateAction,
          contract: quickCreateContractFromEstimateAction,
          job: quickCreateJobAction,
          invoice: quickCreateInvoiceAction,
          changeOrder: quickCreateChangeOrderAction
        },
        preferredContractTemplateId:
          workflowSettings?.approvedEstimateContractTemplateId ?? "",
        requireContractInternalApproval:
          workflowSettings?.requireContractInternalApproval ?? false
      }}
    />
  );
}

