export type ProjectCommandTimelineCategory =
  | "project"
  | "opportunity"
  | "estimate"
  | "contract"
  | "invoice"
  | "payment"
  | "schedule"
  | "field"
  | "document"
  | "communication"
  | "portal";

export type ProjectCommandTimelineTone =
  | "neutral"
  | "ready"
  | "attention"
  | "blocked"
  | "complete";

export type ProjectCommandTimelineItem = {
  id: string;
  category: ProjectCommandTimelineCategory;
  timestamp: string | null;
  sortKey: number;
  title: string;
  summary: string;
  status: string;
  tone: ProjectCommandTimelineTone;
  relatedRecordType: string;
  relatedRecordId: string | null;
  href: string;
  sourceLabel: string;
  nextActionLabel?: string;
  nextActionHref?: string;
  customerSafe: boolean;
  needsAttention: boolean;
  priority: number;
};

type TimelineProject = {
  id: string;
  name: string;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type TimelineOpportunity = {
  id: string;
  status?: string | null;
  siteAssessmentStatus?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type TimelineEstimate = {
  id: string;
  referenceNumber?: string | null;
  status: string;
  totalAmount?: string | number | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type TimelineContract = {
  id: string;
  title?: string | null;
  referenceNumber?: string | null;
  status: string;
  internalApprovalStatus?: string | null;
  signedAt?: string | null;
  sentAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type TimelineInvoice = {
  id: string;
  referenceNumber?: string | null;
  status: string;
  workflowRole?: string | null;
  balanceDueAmount?: string | number | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type TimelineJob = {
  id: string;
  dispatchStatus: string;
  scheduledDate?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type TimelineDailyLog = {
  id: string;
  logDate: string;
  status: string;
  summary?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type TimelineFieldNote = {
  id: string;
  dailyLogId: string;
  noteType: string;
  status: string;
  title: string;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type TimelineMessageItem = {
  id: string;
  kind: "message" | "send" | "signature" | "payment";
  title: string;
  description: string;
  href: string;
  occurredAt: string;
  tone: "neutral" | "positive" | "warning" | "critical";
};

type TimelineDocumentReadiness = {
  label: string;
  detail: string;
  href: string;
  tone: "ready" | "attention" | "missing" | "neutral";
  missingCount: number;
};

export type ProjectCommandTimelineInput = {
  project: TimelineProject;
  opportunity?: TimelineOpportunity | null;
  estimates?: TimelineEstimate[];
  contracts?: TimelineContract[];
  invoices?: TimelineInvoice[];
  jobs?: TimelineJob[];
  dailyLogs?: TimelineDailyLog[];
  fieldNotes?: TimelineFieldNote[];
  messageItems?: TimelineMessageItem[];
  documentReadiness?: TimelineDocumentReadiness | null;
  customerAccessCount?: number;
  readyToSchedule?: boolean;
  scheduleHref?: string;
};

export type ProjectCommandTimeline = {
  items: ProjectCommandTimelineItem[];
  needsAttention: ProjectCommandTimelineItem[];
  readyToMove: ProjectCommandTimelineItem[];
  recentMovement: ProjectCommandTimelineItem[];
  emptyStateMessage: string;
};

function formatStatusLabel(value: string | null | undefined) {
  return value ? value.replaceAll("_", " ") : "current";
}

function formatMoney(value: string | number | null | undefined) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "$0.00";
  }

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function getTimestamp(value: string | null | undefined) {
  const timestamp = value ? new Date(value).getTime() : 0;

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getItemTimestamp(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim()) ?? null;
}

function makeItem(
  item: Omit<ProjectCommandTimelineItem, "sortKey">
): ProjectCommandTimelineItem {
  return {
    ...item,
    sortKey: getTimestamp(item.timestamp)
  };
}

function attentionPriority(tone: ProjectCommandTimelineTone) {
  switch (tone) {
    case "blocked":
      return 400;
    case "attention":
      return 300;
    case "ready":
      return 200;
    case "complete":
      return 100;
    default:
      return 0;
  }
}

function compareItems(
  left: ProjectCommandTimelineItem,
  right: ProjectCommandTimelineItem
) {
  if (right.priority !== left.priority) {
    return right.priority - left.priority;
  }

  if (right.sortKey !== left.sortKey) {
    return right.sortKey - left.sortKey;
  }

  return left.id.localeCompare(right.id);
}

function estimateItem(estimate: TimelineEstimate): ProjectCommandTimelineItem {
  const reference = estimate.referenceNumber ?? "Estimate";
  const approved = estimate.status === "approved";
  const needsAttention =
    estimate.status === "sent" || estimate.status === "rejected";
  const tone: ProjectCommandTimelineTone = approved
    ? "complete"
    : needsAttention
      ? "attention"
      : "neutral";

  return makeItem({
    id: `estimate:${estimate.id}:${estimate.status}`,
    category: "estimate",
    timestamp: getItemTimestamp(estimate.updatedAt, estimate.createdAt),
    title: approved
      ? "Estimate approved"
      : estimate.status === "sent"
        ? "Estimate awaiting customer decision"
        : estimate.status === "rejected"
          ? "Estimate needs revision"
          : "Estimate connected",
    summary: `${reference} is ${formatStatusLabel(estimate.status)} for ${formatMoney(
      estimate.totalAmount
    )}.`,
    status: formatStatusLabel(estimate.status),
    tone,
    relatedRecordType: "estimate",
    relatedRecordId: estimate.id,
    href: `/estimates/${estimate.id}`,
    sourceLabel: "Estimate Workspace",
    nextActionLabel:
      estimate.status === "approved" ? "Generate contract" : "Review estimate",
    nextActionHref:
      estimate.status === "approved"
        ? `/contracts?estimateId=${estimate.id}`
        : `/estimates/${estimate.id}`,
    customerSafe: true,
    needsAttention,
    priority: attentionPriority(tone) + (needsAttention ? 40 : 0)
  });
}

function contractItem(contract: TimelineContract): ProjectCommandTimelineItem {
  const title = contract.title ?? contract.referenceNumber ?? "Contract";
  const signed = contract.status === "signed";
  const blocked =
    contract.status === "draft" &&
    contract.internalApprovalStatus === "pending";
  const needsAttention =
    blocked ||
    contract.status === "sent" ||
    contract.status === "viewed" ||
    contract.status === "declined";
  const tone: ProjectCommandTimelineTone = signed
    ? "complete"
    : blocked || contract.status === "declined"
      ? "blocked"
      : needsAttention
        ? "attention"
        : "neutral";

  return makeItem({
    id: `contract:${contract.id}:${contract.status}`,
    category: "contract",
    timestamp: getItemTimestamp(
      contract.signedAt,
      contract.sentAt,
      contract.updatedAt,
      contract.createdAt
    ),
    title: signed
      ? "Contract signed"
      : blocked
        ? "Contract needs internal approval"
        : contract.status === "sent" || contract.status === "viewed"
          ? "Contract awaiting signature"
          : contract.status === "declined"
            ? "Contract declined"
            : "Contract connected",
    summary: `${title} is ${formatStatusLabel(contract.status)}.`,
    status: formatStatusLabel(contract.status),
    tone,
    relatedRecordType: "contract",
    relatedRecordId: contract.id,
    href: `/contracts/${contract.id}`,
    sourceLabel: "Contract Workspace",
    nextActionLabel: signed ? "Review contract" : "Review signature state",
    nextActionHref: `/contracts/${contract.id}`,
    customerSafe: contract.status !== "draft",
    needsAttention,
    priority: attentionPriority(tone) + (needsAttention ? 70 : 0)
  });
}

function invoiceItem(invoice: TimelineInvoice): ProjectCommandTimelineItem {
  const reference = invoice.referenceNumber ?? "Invoice";
  const balanceDue = Number(invoice.balanceDueAmount ?? 0);
  const isOpen =
    invoice.status !== "paid" &&
    invoice.status !== "void" &&
    Number.isFinite(balanceDue) &&
    balanceDue > 0;
  const isDeposit = invoice.workflowRole === "deposit";
  const tone: ProjectCommandTimelineTone =
    invoice.status === "paid"
      ? "complete"
      : isOpen
        ? "attention"
        : invoice.status === "void"
          ? "blocked"
          : "neutral";

  return makeItem({
    id: `invoice:${invoice.id}:${invoice.status}`,
    category: "invoice",
    timestamp: getItemTimestamp(invoice.updatedAt, invoice.createdAt),
    title:
      invoice.status === "paid"
        ? `${isDeposit ? "Deposit" : "Invoice"} paid`
        : isOpen
          ? `${isDeposit ? "Deposit" : "Invoice"} needs payment follow-up`
          : `${isDeposit ? "Deposit" : "Invoice"} connected`,
    summary: `${reference} is ${formatStatusLabel(
      invoice.status
    )}; ${formatMoney(invoice.balanceDueAmount)} remains open.`,
    status: formatStatusLabel(invoice.status),
    tone,
    relatedRecordType: "invoice",
    relatedRecordId: invoice.id,
    href: `/invoices/${invoice.id}`,
    sourceLabel: "Invoice Workspace",
    nextActionLabel: isOpen ? "Review payment state" : "Review invoice",
    nextActionHref: `/invoices/${invoice.id}`,
    customerSafe: invoice.status !== "draft",
    needsAttention: isOpen || invoice.status === "void",
    priority: attentionPriority(tone) + (isOpen ? 60 : 0)
  });
}

function jobItem(input: {
  job: TimelineJob;
  projectId: string;
}): ProjectCommandTimelineItem {
  const { job } = input;
  const scheduled = job.dispatchStatus === "scheduled";
  const inProgress = job.dispatchStatus === "in_progress";
  const unscheduled = job.dispatchStatus === "unscheduled";
  const tone: ProjectCommandTimelineTone = inProgress
    ? "ready"
    : scheduled
      ? "ready"
      : unscheduled
        ? "attention"
        : job.dispatchStatus === "completed"
          ? "complete"
          : "neutral";

  return makeItem({
    id: `job:${job.id}:${job.dispatchStatus}`,
    category: "schedule",
    timestamp: getItemTimestamp(
      job.scheduledDate,
      job.updatedAt,
      job.createdAt
    ),
    title: inProgress
      ? "Job in progress"
      : scheduled
        ? "Job scheduled"
        : unscheduled
          ? "Job ready for scheduling"
          : job.dispatchStatus === "completed"
            ? "Job completed"
            : "Job connected",
    summary: job.scheduledDate
      ? `Job is ${formatStatusLabel(job.dispatchStatus)} for ${job.scheduledDate}.`
      : `Job is ${formatStatusLabel(job.dispatchStatus)}.`,
    status: formatStatusLabel(job.dispatchStatus),
    tone,
    relatedRecordType: "job",
    relatedRecordId: job.id,
    href: `/jobs/${job.id}`,
    sourceLabel: "Job Workspace",
    nextActionLabel: unscheduled ? "Open scheduling" : "Review job",
    nextActionHref: unscheduled
      ? `/schedule?projectId=${input.projectId}&view=unscheduled`
      : `/jobs/${job.id}`,
    customerSafe: scheduled || inProgress || job.dispatchStatus === "completed",
    needsAttention: unscheduled,
    priority: attentionPriority(tone) + (unscheduled ? 50 : 0)
  });
}

function dailyLogItem(log: TimelineDailyLog): ProjectCommandTimelineItem {
  return makeItem({
    id: `daily-log:${log.id}:${log.status}`,
    category: "field",
    timestamp: getItemTimestamp(log.updatedAt, log.createdAt, log.logDate),
    title:
      log.status === "finalized" || log.status === "submitted"
        ? "Daily Log recorded"
        : "Daily Log in progress",
    summary: log.summary?.trim()
      ? log.summary.trim()
      : `Field activity for ${log.logDate} is ${formatStatusLabel(log.status)}.`,
    status: formatStatusLabel(log.status),
    tone:
      log.status === "finalized" || log.status === "submitted"
        ? "complete"
        : "neutral",
    relatedRecordType: "daily_log",
    relatedRecordId: log.id,
    href: `/daily-logs/${log.id}`,
    sourceLabel: "Daily Logs",
    nextActionLabel: "Open Daily Log",
    nextActionHref: `/daily-logs/${log.id}`,
    customerSafe: false,
    needsAttention: false,
    priority: 40
  });
}

function fieldNoteItem(note: TimelineFieldNote): ProjectCommandTimelineItem {
  const isOpenBlocker =
    note.status === "open" &&
    (note.noteType === "blocker" || note.noteType === "issue");

  return makeItem({
    id: `field-note:${note.id}:${note.status}`,
    category: "field",
    timestamp: getItemTimestamp(note.updatedAt, note.createdAt),
    title: isOpenBlocker ? "Open field blocker" : "Field note recorded",
    summary: `${note.title} is ${formatStatusLabel(note.status)}.`,
    status: formatStatusLabel(note.status),
    tone: isOpenBlocker ? "blocked" : "neutral",
    relatedRecordType: "field_note",
    relatedRecordId: note.id,
    href: `/daily-logs/${note.dailyLogId}#job-notes`,
    sourceLabel: "FieldTrail",
    nextActionLabel: "Open daily log",
    nextActionHref: `/daily-logs/${note.dailyLogId}#job-notes`,
    customerSafe: false,
    needsAttention: isOpenBlocker,
    priority: attentionPriority(isOpenBlocker ? "blocked" : "neutral") + 80
  });
}

function messageItem(item: TimelineMessageItem): ProjectCommandTimelineItem {
  const tone: ProjectCommandTimelineTone =
    item.tone === "critical"
      ? "blocked"
      : item.tone === "warning"
        ? "attention"
        : item.tone === "positive"
          ? "complete"
          : "neutral";
  const category: ProjectCommandTimelineCategory =
    item.kind === "payment"
      ? "payment"
      : item.kind === "signature"
        ? "contract"
        : item.kind === "send"
          ? "document"
          : "communication";

  return makeItem({
    id: `message-center:${item.id}`,
    category,
    timestamp: item.occurredAt,
    title: item.title,
    summary: item.description,
    status: item.kind,
    tone,
    relatedRecordType: item.kind,
    relatedRecordId: null,
    href: item.href,
    sourceLabel:
      item.kind === "payment"
        ? "Payment Trail"
        : item.kind === "signature"
          ? "Signature Trail"
          : item.kind === "send"
            ? "Send Trail"
            : "MessageCenter",
    nextActionLabel:
      item.tone === "critical" || item.tone === "warning"
        ? "Review activity"
        : "Open source",
    nextActionHref: item.href,
    customerSafe: item.kind !== "message",
    needsAttention: item.tone === "critical" || item.tone === "warning",
    priority: attentionPriority(tone) + 30
  });
}

function documentReadinessItem(
  input: TimelineDocumentReadiness
): ProjectCommandTimelineItem {
  const tone: ProjectCommandTimelineTone =
    input.tone === "missing"
      ? "blocked"
      : input.tone === "attention"
        ? "attention"
        : input.tone === "ready"
          ? "ready"
          : "neutral";

  return makeItem({
    id: "document-readiness:project-proof",
    category: "document",
    timestamp: null,
    title: input.label,
    summary: input.detail,
    status: input.missingCount > 0 ? `${input.missingCount} gaps` : "ready",
    tone,
    relatedRecordType: "project_proof",
    relatedRecordId: null,
    href: input.href,
    sourceLabel: "Proof Center",
    nextActionLabel: "Review proof",
    nextActionHref: input.href,
    customerSafe: false,
    needsAttention: input.missingCount > 0,
    priority: attentionPriority(tone) + (input.missingCount > 0 ? 35 : 0)
  });
}

export function deriveProjectCommandTimeline(
  input: ProjectCommandTimelineInput
): ProjectCommandTimeline {
  const items: ProjectCommandTimelineItem[] = [];

  items.push(
    makeItem({
      id: `project:${input.project.id}:created`,
      category: "project",
      timestamp: getItemTimestamp(
        input.project.createdAt,
        input.project.updatedAt
      ),
      title: "Project opened",
      summary: `${input.project.name} is ${formatStatusLabel(
        input.project.status
      )}.`,
      status: formatStatusLabel(input.project.status),
      tone: "neutral",
      relatedRecordType: "project",
      relatedRecordId: input.project.id,
      href: `/projects/${input.project.id}`,
      sourceLabel: "Project Workspace",
      nextActionLabel: "Review project",
      nextActionHref: `/projects/${input.project.id}`,
      customerSafe: true,
      needsAttention: false,
      priority: 10
    })
  );

  if (input.opportunity) {
    items.push(
      makeItem({
        id: `opportunity:${input.opportunity.id}:linked`,
        category: "opportunity",
        timestamp: getItemTimestamp(
          input.opportunity.updatedAt,
          input.opportunity.createdAt
        ),
        title: "Opportunity linked",
        summary: `Site assessment is ${formatStatusLabel(
          input.opportunity.siteAssessmentStatus
        )}.`,
        status: formatStatusLabel(input.opportunity.status),
        tone:
          input.opportunity.siteAssessmentStatus === "completed"
            ? "complete"
            : "neutral",
        relatedRecordType: "opportunity",
        relatedRecordId: input.opportunity.id,
        href: `/leads/${input.opportunity.id}`,
        sourceLabel: "Opportunity Workspace",
        nextActionLabel: "Open opportunity",
        nextActionHref: `/leads/${input.opportunity.id}`,
        customerSafe: false,
        needsAttention: false,
        priority: 15
      })
    );
  }

  items.push(...(input.estimates ?? []).map(estimateItem));
  items.push(...(input.contracts ?? []).map(contractItem));
  items.push(...(input.invoices ?? []).map(invoiceItem));
  items.push(
    ...(input.jobs ?? []).map((job) =>
      jobItem({ job, projectId: input.project.id })
    )
  );
  items.push(...(input.dailyLogs ?? []).slice(0, 4).map(dailyLogItem));
  items.push(
    ...(input.fieldNotes ?? [])
      .filter((note) => note.status === "open")
      .map(fieldNoteItem)
  );
  items.push(...(input.messageItems ?? []).slice(0, 8).map(messageItem));

  if (input.documentReadiness) {
    items.push(documentReadinessItem(input.documentReadiness));
  }

  if (input.readyToSchedule) {
    items.push(
      makeItem({
        id: `project:${input.project.id}:ready-to-schedule`,
        category: "schedule",
        timestamp: input.project.updatedAt ?? null,
        title: "Ready to move into scheduling",
        summary:
          "Commercial readiness is clear. Keep the next move on the canonical job and schedule chain.",
        status: "ready to schedule",
        tone: "ready",
        relatedRecordType: "project",
        relatedRecordId: input.project.id,
        href: input.scheduleHref ?? `/schedule?projectId=${input.project.id}`,
        sourceLabel: "Ready Check",
        nextActionLabel: "Open schedule",
        nextActionHref:
          input.scheduleHref ?? `/schedule?projectId=${input.project.id}`,
        customerSafe: false,
        needsAttention: false,
        priority: attentionPriority("ready") + 20
      })
    );
  }

  if ((input.customerAccessCount ?? 0) > 0) {
    items.push(
      makeItem({
        id: `portal-access:${input.project.id}:active`,
        category: "portal",
        timestamp: input.project.updatedAt ?? null,
        title: "Portal visibility active",
        summary: `${input.customerAccessCount} customer contact${
          input.customerAccessCount === 1 ? "" : "s"
        } can see this project through scoped portal access.`,
        status: "active",
        tone: "ready",
        relatedRecordType: "portal_access",
        relatedRecordId: null,
        href: "/people#customer-access",
        sourceLabel: "Customer Access",
        nextActionLabel: "Review access",
        nextActionHref: "/people#customer-access",
        customerSafe: false,
        needsAttention: false,
        priority: attentionPriority("ready")
      })
    );
  }

  const sortedItems = [...items].sort(compareItems);

  return {
    items: sortedItems,
    needsAttention: sortedItems
      .filter((item) => item.needsAttention)
      .slice(0, 6),
    readyToMove: sortedItems
      .filter((item) => item.tone === "ready" || item.tone === "complete")
      .slice(0, 6),
    recentMovement: [...items]
      .sort((left, right) => right.sortKey - left.sortKey)
      .slice(0, 8),
    emptyStateMessage:
      "No project timeline activity is available yet. Linked estimates, contracts, invoices, jobs, Daily Logs, field notes, proof, and communication evidence will appear here when they exist."
  };
}
