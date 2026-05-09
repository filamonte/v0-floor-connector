import type { ProjectFinancialReadinessSnapshot } from "@/lib/projects/readiness";
import type { WorkItemSourceType } from "@floorconnector/types";
import type { ProjectGuidanceWorkItemCue } from "@/lib/work-items/prefill";

export type ProjectCuePriority = "critical" | "high" | "medium";

export type ProjectCueWorkItemBridge = {
  cue: ProjectGuidanceWorkItemCue;
  href: string;
  label: "Create work item";
  sourceType: WorkItemSourceType;
  sourceId: string;
  sourceLabel: string;
  context: Record<string, string | string[] | number | null>;
};

export type ProjectCue = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  priority: ProjectCuePriority;
  reason: string;
  sortOrder: number;
  workItemBridge?: ProjectCueWorkItemBridge;
};

type CueEstimate = {
  id: string;
  status: string;
  referenceNumber?: string | null;
  updatedAt?: string | null;
};

type CueContract = {
  id: string;
  status: string;
  estimateId?: string | null;
  title?: string | null;
  updatedAt?: string | null;
};

type CueInvoice = {
  id: string;
  status: string;
  workflowRole?: string | null;
  balanceDueAmount: string | number;
  referenceNumber?: string | null;
};

type CueJob = {
  id: string;
  dispatchStatus: string;
};

type CueFieldNote = {
  id: string;
  dailyLogId: string;
  noteType: string;
  status: string;
  title: string;
};

export type BuildProjectCuesInput = {
  project: {
    id: string;
    name: string;
  };
  readinessSnapshot: ProjectFinancialReadinessSnapshot | null;
  estimates: CueEstimate[];
  contracts: CueContract[];
  invoices: CueInvoice[];
  jobs: CueJob[];
  fieldNotes?: CueFieldNote[];
};

function newestByUpdatedAt<T extends { updatedAt?: string | null }>(items: T[]) {
  return [...items].sort((left, right) =>
    (right.updatedAt ?? "").localeCompare(left.updatedAt ?? "")
  )[0] ?? null;
}

function buildJobCreateHref(input: {
  projectId: string;
  estimateId?: string | null;
  contractId?: string | null;
}) {
  const searchParams = new URLSearchParams({
    projectId: input.projectId,
    compose: "1"
  });

  if (input.estimateId) {
    searchParams.set("estimateId", input.estimateId);
  }

  if (input.contractId) {
    searchParams.set("contractId", input.contractId);
  }

  return `/jobs?${searchParams.toString()}`;
}

function buildScheduleHref(projectId: string, unscheduledJobs: CueJob[]) {
  const searchParams = new URLSearchParams({
    projectId,
    view: "unscheduled",
    action: "schedule"
  });

  if (unscheduledJobs.length === 1) {
    searchParams.set("jobId", unscheduledJobs[0].id);
  }

  return `/schedule?${searchParams.toString()}`;
}

function buildProjectCueWorkItemHref(
  projectId: string,
  cue: ProjectGuidanceWorkItemCue
) {
  return `/projects/${projectId}?workItemCue=${cue}#work-items`;
}

export function buildProjectCues(input: BuildProjectCuesInput): ProjectCue[] {
  const approvedEstimate =
    input.estimates.find((estimate) => estimate.status === "approved") ?? null;
  const latestContract = newestByUpdatedAt(input.contracts);
  const signedContract =
    input.contracts.find((contract) => contract.status === "signed") ?? null;
  const depositInvoice =
    input.invoices.find(
      (invoice) =>
        invoice.workflowRole === "deposit" &&
        invoice.status !== "paid" &&
        invoice.status !== "void" &&
        Number(invoice.balanceDueAmount) > 0
    ) ?? null;
  const unscheduledJobs = input.jobs.filter(
    (job) => job.dispatchStatus === "unscheduled"
  );
  const openBlockerFieldNotes = (input.fieldNotes ?? []).filter(
    (note) =>
      note.status === "open" && (note.noteType === "blocker" || note.noteType === "issue")
  );
  const cues: ProjectCue[] = [];

  if (approvedEstimate && input.contracts.length === 0) {
    cues.push({
      id: `${input.project.id}:approved-estimate-missing-contract`,
      projectId: input.project.id,
      projectName: input.project.name,
      title: "Approved estimate needs a contract",
      description:
        "Approved scope exists, but no canonical contract has been generated yet.",
      href: `/contracts?estimateId=${approvedEstimate.id}`,
      actionLabel: "Generate contract",
      priority: "critical",
      reason: approvedEstimate.referenceNumber
        ? `Estimate ${approvedEstimate.referenceNumber} is approved.`
        : "An approved estimate exists.",
      sortOrder: 10,
      workItemBridge: {
        cue: "approved_estimate_missing_contract",
        href: buildProjectCueWorkItemHref(
          input.project.id,
          "approved_estimate_missing_contract"
        ),
        label: "Create work item",
        sourceType: "estimate",
        sourceId: approvedEstimate.id,
        sourceLabel: approvedEstimate.referenceNumber
          ? `Estimate ${approvedEstimate.referenceNumber}`
          : "Approved estimate",
        context: {
          estimateId: approvedEstimate.id,
          estimateReferenceNumber: approvedEstimate.referenceNumber ?? null
        }
      }
    });
  }

  if (depositInvoice) {
    cues.push({
      id: `${input.project.id}:deposit-invoice-unpaid`,
      projectId: input.project.id,
      projectName: input.project.name,
      title: "Deposit invoice is still unpaid",
      description:
        "Financial readiness is waiting on the existing deposit invoice before scheduling can continue.",
      href: `/invoices/${depositInvoice.id}`,
      actionLabel: "Review deposit invoice",
      priority: "critical",
      reason: `${depositInvoice.referenceNumber ?? "Deposit invoice"} has ${Number(
        depositInvoice.balanceDueAmount
      ).toLocaleString("en-US", { style: "currency", currency: "USD" })} open.`,
      sortOrder: 20,
      workItemBridge: {
        cue: "deposit_invoice_unpaid",
        href: buildProjectCueWorkItemHref(input.project.id, "deposit_invoice_unpaid"),
        label: "Create work item",
        sourceType: "invoice",
        sourceId: depositInvoice.id,
        sourceLabel: depositInvoice.referenceNumber ?? "Deposit invoice",
        context: {
          invoiceId: depositInvoice.id,
          invoiceReferenceNumber: depositInvoice.referenceNumber ?? null,
          invoiceStatus: depositInvoice.status,
          invoiceWorkflowRole: depositInvoice.workflowRole ?? null,
          balanceDueAmount: String(depositInvoice.balanceDueAmount)
        }
      }
    });
  }

  if (openBlockerFieldNotes.length > 0) {
    const firstNote = openBlockerFieldNotes[0];

    cues.push({
      id: `${input.project.id}:open-blocker-field-notes`,
      projectId: input.project.id,
      projectName: input.project.name,
      title: "Open blocker field notes need review",
      description:
        "Field blockers are still open on daily logs for this project.",
      href: `/daily-logs/${firstNote.dailyLogId}`,
      actionLabel: "Open daily log",
      priority: "high",
      reason:
        openBlockerFieldNotes.length === 1
          ? firstNote.title
          : `${openBlockerFieldNotes.length} open blocker or issue notes.`,
      sortOrder: 30,
      workItemBridge: {
        cue: "open_blocker_field_notes",
        href: buildProjectCueWorkItemHref(input.project.id, "open_blocker_field_notes"),
        label: "Create work item",
        sourceType: "project",
        sourceId: input.project.id,
        sourceLabel:
          openBlockerFieldNotes.length === 1
            ? `Field note: ${firstNote.title}`
            : `${openBlockerFieldNotes.length} open blocker or issue field notes`,
        context: {
          fieldNoteId: firstNote.id,
          dailyLogId: firstNote.dailyLogId,
          fieldNoteTitle: firstNote.title,
          fieldNoteType: firstNote.noteType,
          fieldNoteStatus: firstNote.status,
          openBlockerFieldNoteCount: openBlockerFieldNotes.length
        }
      }
    });
  }

  if (
    signedContract &&
    input.readinessSnapshot?.isReadyToSchedule &&
    input.jobs.length === 0
  ) {
    cues.push({
      id: `${input.project.id}:signed-contract-no-job`,
      projectId: input.project.id,
      projectName: input.project.name,
      title: "Signed contract is ready for job creation",
      description:
        "Readiness is clear, but the project has no canonical job yet.",
      href: buildJobCreateHref({
        projectId: input.project.id,
        estimateId: signedContract.estimateId ?? approvedEstimate?.id,
        contractId: signedContract.id
      }),
      actionLabel: "Create job",
      priority: "high",
      reason: latestContract?.title ?? "Contract signature and readiness are complete.",
      sortOrder: 40,
      workItemBridge: {
        cue: "signed_contract_no_job",
        href: buildProjectCueWorkItemHref(input.project.id, "signed_contract_no_job"),
        label: "Create work item",
        sourceType: "contract",
        sourceId: signedContract.id,
        sourceLabel: signedContract.title ?? "Signed contract",
        context: {
          contractId: signedContract.id,
          estimateId: signedContract.estimateId ?? approvedEstimate?.id ?? null,
          contractStatus: signedContract.status
        }
      }
    });
  }

  if (input.readinessSnapshot?.isReadyToSchedule && unscheduledJobs.length > 0) {
    cues.push({
      id: `${input.project.id}:ready-unscheduled-jobs`,
      projectId: input.project.id,
      projectName: input.project.name,
      title:
        unscheduledJobs.length === 1
          ? "Ready project has an unscheduled job"
          : "Ready project has unscheduled jobs",
      description:
        "The project can move forward, but scheduling still needs human confirmation.",
      href: buildScheduleHref(input.project.id, unscheduledJobs),
      actionLabel: "Open schedule",
      priority: "medium",
      reason:
        unscheduledJobs.length === 1
          ? "One canonical job is waiting on schedule placement."
          : `${unscheduledJobs.length} canonical jobs are waiting on schedule placement.`,
      sortOrder: 50,
      workItemBridge: {
        cue: "ready_unscheduled_jobs",
        href: buildProjectCueWorkItemHref(input.project.id, "ready_unscheduled_jobs"),
        label: "Create work item",
        sourceType: unscheduledJobs.length === 1 ? "job" : "project",
        sourceId: unscheduledJobs.length === 1 ? unscheduledJobs[0].id : input.project.id,
        sourceLabel:
          unscheduledJobs.length === 1
            ? "Unscheduled job"
            : `${unscheduledJobs.length} unscheduled jobs`,
        context: {
          jobId: unscheduledJobs.length === 1 ? unscheduledJobs[0].id : null,
          jobIds: unscheduledJobs.map((job) => job.id),
          unscheduledJobCount: unscheduledJobs.length
        }
      }
    });
  }

  return cues.sort((left, right) => left.sortOrder - right.sortOrder);
}

export function selectHighestPriorityProjectCues(cues: ProjectCue[], limit: number) {
  return [...cues].sort((left, right) => left.sortOrder - right.sortOrder).slice(0, limit);
}
