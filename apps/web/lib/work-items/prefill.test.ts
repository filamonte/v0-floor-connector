import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAppointmentCueWorkItemPrefill,
  buildEstimateHandoffWorkItemPrefill,
  buildEstimateWorkspaceShortcutWorkItemPrefill,
  buildOperationalCueWorkItemPrefill,
  buildOpportunityFollowUpWorkItemPrefill,
  buildProjectGuidanceWorkItemPrefill,
  getOperationalCueWorkItemBridgeAction
} from "./prefill";
import { workItemCreateSchema } from "./schemas";
import type { OperationalCue } from "../operational-cues/types";

const opportunityId = "11111111-1111-4111-8111-111111111111";
const appointmentId = "22222222-2222-4222-8222-222222222222";
const projectId = "44444444-4444-4444-8444-444444444444";
const invoiceId = "55555555-5555-4555-8555-555555555555";
const estimateId = "66666666-6666-4666-8666-666666666666";

function buildOperationalCue(
  overrides: Partial<OperationalCue>
): OperationalCue {
  return {
    cueKey: "estimate_sent_followup",
    subjectType: "estimate",
    subjectId: estimateId,
    projectId,
    organizationId: "77777777-7777-4777-8777-777777777777",
    assignedUserId: null,
    ownerStrategy: "estimator",
    ownerStrategyLabel: "Estimator",
    ownerResolutionStatus: "strategy_only",
    responsibility: {
      strategy: "estimator",
      strategyLabel: "Estimator",
      displayLabel: "Estimator",
      resolutionStatus: "strategy_only",
      personId: null,
      userId: null,
      source: "cue_owner_strategy"
    },
    title: "Follow up on EST-100",
    message: "Estimate was sent and is still awaiting a customer decision.",
    urgency: "high",
    ageDays: 7,
    customerName: "Taylor Customer",
    projectName: "Garage floor",
    actionHref: `/estimates/${estimateId}`,
    actionLabel: "Open estimate",
    reason: "Sent 7 days ago.",
    explanation:
      "Estimate was sent 7 days ago. This rule triggers after 5 days.",
    sourceLabel: "Estimate sent date",
    sourceValue: "May 4, 2026",
    thresholdLabel: "Rule threshold: 5 days",
    triggeredAtLabel: "Triggered after 7 days",
    ...overrides
  };
}

void test("opportunity follow-up cue prefill creates a source-locked work item draft", () => {
  const prefill = buildOpportunityFollowUpWorkItemPrefill({
    opportunityId,
    title: "Garage flake floor",
    status: "contacted",
    contactName: "Taylor Customer",
    companyName: "Taylor Homes",
    customerName: null,
    nextFollowUpAt: "2026-05-06T14:00:00.000Z",
    nextFollowUpNote: "Call after customer reviews photos.",
    lastCommunicationAt: "2026-05-05T13:00:00.000Z",
    nowIso: "2026-05-07T12:00:00.000Z"
  });

  assert.equal(prefill.kind, "lead_follow_up");
  assert.equal(prefill.priority, "high");
  assert.equal(prefill.dueAt, "2026-05-06T14:00:00.000Z");
  assert.equal(
    prefill.dedupeKey,
    "opportunity:11111111-1111-4111-8111-111111111111:lead_follow_up:2026-05-06"
  );
  assert.match(prefill.title, /Garage flake floor/);
  assert.match(prefill.description ?? "", /Call after customer reviews photos/);

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: "opportunity",
    sourceId: opportunityId,
    customerId: "",
    projectId: "",
    linkPath: `/leads/${opportunityId}`,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("estimate handoff prefill carries site assessment context without creating estimate state", () => {
  const prefill = buildEstimateHandoffWorkItemPrefill({
    opportunityId,
    projectId,
    estimateId,
    opportunityTitle: "Garage flake floor",
    customerName: "Taylor Customer",
    projectName: "Garage floor",
    contactName: "Taylor Rep",
    sourceOwnerUserId: "99999999-9999-4999-8999-999999999999",
    sourceOwnerName: "Sam Site Assessor",
    nextAction: "Draft the estimate from the captured site assessment packet.",
    requirementsSummary: "Decorative flake system with crack repair.",
    notes: "Customer wants weekend timing.",
    siteAssessmentStatus: "completed",
    siteAssessmentScheduledAt: "2026-05-04T15:00:00.000Z",
    siteAssessmentCompletedAt: "2026-05-04T16:00:00.000Z",
    measurements: [
      {
        id: "measurement-1",
        organizationId: "77777777-7777-4777-8777-777777777777",
        opportunityId,
        areaLabel: "Garage",
        measurementType: "floor_area",
        valueNumeric: "480.00",
        unit: "sqft",
        quantity: null,
        captureMethod: "manual",
        notes: "Verify apron edge.",
        createdAt: "2026-05-04T16:00:00.000Z",
        updatedAt: "2026-05-04T16:00:00.000Z"
      }
    ],
    observations: [
      {
        id: "observation-1",
        organizationId: "77777777-7777-4777-8777-777777777777",
        opportunityId,
        observationType: "surface_condition",
        title: "Existing coating",
        body: "Peeling near door.",
        severity: "medium",
        relatedAttachmentId: null,
        createdByUserId: null,
        updatedByUserId: null,
        createdAt: "2026-05-04T16:00:00.000Z",
        updatedAt: "2026-05-04T16:00:00.000Z"
      }
    ],
    attachmentCount: 3
  });

  assert.equal(prefill.kind, "estimate_follow_up");
  assert.equal(prefill.priority, "normal");
  assert.equal(
    prefill.dedupeKey,
    `opportunity:${opportunityId}:estimate_handoff:generate_estimate`
  );
  assert.match(prefill.title, /Generate estimate/);
  assert.match(prefill.description ?? "", /Source owner: Sam Site Assessor/);
  assert.match(prefill.description ?? "", /Next action:/);
  assert.match(prefill.description ?? "", /Decorative flake system/);
  assert.match(prefill.description ?? "", /Garage - 480.00 sqft/);
  assert.match(
    prefill.description ?? "",
    /Photos \/ files attached to lead: 3/
  );
  assert.equal(prefill.metadata.estimateWork, true);
  assert.equal(prefill.metadata.estimateWorkType, "generate_estimate");
  assert.equal(prefill.metadata.estimateWorkStatus, "open");
  assert.equal(prefill.metadata.projectId, projectId);
  assert.equal(prefill.metadata.estimateId, estimateId);
  assert.equal(
    prefill.metadata.sourceOwnerUserId,
    "99999999-9999-4999-8999-999999999999"
  );
  assert.equal(prefill.metadata.sourceOwnerName, "Sam Site Assessor");
  assert.equal(
    prefill.metadata.nextAction,
    "Draft the estimate from the captured site assessment packet."
  );

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: "opportunity",
    sourceId: opportunityId,
    customerId: "",
    projectId: projectId,
    linkPath: `/leads/${opportunityId}`,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("estimate handoff prefill does not invent a source owner when none is provided", () => {
  const prefill = buildEstimateHandoffWorkItemPrefill({
    opportunityId,
    opportunityTitle: "Unassigned garage estimate",
    customerName: "Taylor Customer",
    projectName: "Garage floor",
    contactName: null,
    requirementsSummary: null,
    notes: null,
    siteAssessmentStatus: "scheduled",
    siteAssessmentScheduledAt: "2026-05-04T15:00:00.000Z",
    siteAssessmentCompletedAt: null,
    measurements: [],
    observations: [],
    attachmentCount: 0
  });

  assert.doesNotMatch(prefill.description ?? "", /Source owner:/);
  assert.equal(prefill.metadata.sourceOwnerUserId, null);
  assert.equal(prefill.metadata.sourceOwnerName, null);
  assert.equal(prefill.metadata.estimateWork, true);
  assert.equal(prefill.metadata.opportunityId, opportunityId);
});

void test("estimate workspace missing-info shortcut creates estimate source-locked prefill", () => {
  const prefill = buildEstimateWorkspaceShortcutWorkItemPrefill({
    estimateId,
    estimateReference: "EST-100",
    estimateStatus: "draft",
    projectId,
    projectName: "Garage floor",
    customerName: "Taylor Customer",
    opportunityId,
    type: "request_missing_info"
  });

  assert.equal(prefill.kind, "estimate_follow_up");
  assert.equal(prefill.priority, "high");
  assert.equal(prefill.sourceType, "estimate");
  assert.equal(prefill.sourceId, estimateId);
  assert.equal(prefill.linkPath, `/estimates/${estimateId}`);
  assert.equal(
    prefill.dedupeKey,
    `estimate:${estimateId}:estimate_handoff:request_missing_info`
  );
  assert.match(prefill.title, /Request missing info/);
  assert.match(prefill.description ?? "", /Next action:/);
  assert.equal(prefill.metadata.cue, "estimate_workspace_shortcut");
  assert.equal(prefill.metadata.estimateWork, true);
  assert.equal(prefill.metadata.estimateWorkType, "request_missing_info");
  assert.equal(prefill.metadata.estimateWorkStatus, "open");
  assert.equal(prefill.metadata.estimateId, estimateId);
  assert.equal(prefill.metadata.projectId, projectId);
  assert.equal(prefill.metadata.opportunityId, opportunityId);

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: prefill.sourceType,
    sourceId: prefill.sourceId,
    customerId: "",
    projectId,
    linkPath: prefill.linkPath,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("estimate workspace review shortcut marks review work ready without mutating estimate status", () => {
  const prefill = buildEstimateWorkspaceShortcutWorkItemPrefill({
    estimateId,
    estimateReference: "EST-100",
    estimateStatus: "draft",
    projectId,
    projectName: "Garage floor",
    customerName: "Taylor Customer",
    type: "review_estimate"
  });

  assert.equal(prefill.kind, "estimate_follow_up");
  assert.equal(prefill.priority, "normal");
  assert.match(prefill.title, /Review EST-100 before send/);
  assert.match(prefill.description ?? "", /scope, pricing, exclusions/);
  assert.equal(prefill.metadata.estimateWorkType, "review_estimate");
  assert.equal(prefill.metadata.estimateWorkStatus, "ready_for_review");
  assert.equal(prefill.metadata.sourceRecordType, "estimate");
  assert.equal(prefill.metadata.estimateId, estimateId);
  assert.equal(prefill.metadata.projectId, projectId);

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: prefill.sourceType,
    sourceId: prefill.sourceId,
    customerId: "",
    projectId,
    linkPath: prefill.linkPath,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("appointment cue prefill creates confirmation prep for scheduled appointments", () => {
  const prefill = buildAppointmentCueWorkItemPrefill({
    appointmentId,
    title: "Site assessment",
    appointmentType: "site_visit",
    status: "scheduled",
    startsAt: "2026-05-08T15:00:00.000Z",
    customerName: "Taylor Customer",
    opportunityTitle: "Garage flake floor",
    assignedPersonId: "33333333-3333-4333-8333-333333333333",
    cue: "confirmation_prep"
  });

  assert.equal(prefill.kind, "appointment_confirmation_prep");
  assert.equal(prefill.priority, "normal");
  assert.equal(
    prefill.assignedPersonId,
    "33333333-3333-4333-8333-333333333333"
  );
  assert.equal(prefill.dueAt, "2026-05-08T15:00:00.000Z");
  assert.match(prefill.title, /Confirm appointment/);

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: prefill.assignedPersonId,
    sourceType: "appointment",
    sourceId: appointmentId,
    customerId: "",
    projectId: "",
    linkPath: `/appointments/${appointmentId}`,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("appointment cue prefill creates high-priority follow-up for no-show appointments", () => {
  const prefill = buildAppointmentCueWorkItemPrefill({
    appointmentId,
    title: "Estimate meeting",
    appointmentType: "estimate_appointment",
    status: "no_show",
    startsAt: "2026-05-07T15:00:00.000Z",
    cue: "appointment_follow_up"
  });

  assert.equal(prefill.kind, "appointment_follow_up");
  assert.equal(prefill.priority, "high");
  assert.equal(
    prefill.dedupeKey,
    "appointment:22222222-2222-4222-8222-222222222222:appointment_follow_up:no_show:2026-05-07"
  );
  assert.match(prefill.description ?? "", /Status: no show/);
});

void test("project guidance cue prefill creates a source-locked human follow-up draft", () => {
  const prefill = buildProjectGuidanceWorkItemPrefill({
    projectId,
    projectName: "Garage floor",
    customerName: "Taylor Customer",
    cueTitle: "Open blocker field notes need review",
    cueDescription:
      "Field blockers are still open on daily logs for this project.",
    cueReason: "Moisture issue",
    workflowHref: "/daily-logs/daily-log-1",
    bridge: {
      cue: "open_blocker_field_notes",
      href: `/projects/${projectId}?workItemCue=open_blocker_field_notes#work-items`,
      label: "Create work item",
      sourceType: "project",
      sourceId: projectId,
      sourceLabel: "Field note: Moisture issue",
      context: {
        fieldNoteId: "note-1",
        dailyLogId: "daily-log-1",
        fieldNoteTitle: "Moisture issue",
        fieldNoteType: "blocker",
        fieldNoteStatus: "open",
        openBlockerFieldNoteCount: 1
      }
    }
  });

  assert.equal(prefill.kind, "human_handoff");
  assert.equal(prefill.priority, "high");
  assert.equal(prefill.sourceType, "project");
  assert.equal(prefill.sourceId, projectId);
  assert.equal(prefill.linkPath, "/daily-logs/daily-log-1");
  assert.equal(
    prefill.dedupeKey,
    `project-guidance:${projectId}:open_blocker_field_notes:project:${projectId}`
  );
  assert.match(prefill.description ?? "", /Prefilled from project guidance/);
  assert.equal(prefill.metadata.projectCue, "open_blocker_field_notes");

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: prefill.sourceType,
    sourceId: prefill.sourceId,
    customerId: "",
    projectId,
    linkPath: prefill.linkPath,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("estimate operational cue prefill creates an estimate source-locked work item draft", () => {
  const cue = buildOperationalCue({});
  const action = getOperationalCueWorkItemBridgeAction(cue);
  const prefill = buildOperationalCueWorkItemPrefill({ cue });

  assert.deepEqual(action, {
    href: `/estimates/${estimateId}?workItemCue=estimate_sent_followup#work-items`,
    label: "Create follow-up"
  });
  assert.ok(prefill);
  assert.equal(prefill.kind, "estimate_follow_up");
  assert.equal(prefill.priority, "normal");
  assert.equal(prefill.sourceType, "estimate");
  assert.equal(prefill.sourceId, estimateId);
  assert.equal(prefill.linkPath, `/estimates/${estimateId}`);
  assert.equal(prefill.title, "Follow up on sent estimate");
  assert.match(prefill.description ?? "", /Estimate was sent 7 days ago/);
  assert.match(prefill.description ?? "", /Estimate sent date: May 4, 2026/);
  assert.equal(
    prefill.dedupeKey,
    `operational-cue:estimate_sent_followup:estimate:${estimateId}`
  );
  assert.equal(prefill.metadata.cue, "operational_cue");
  assert.equal(prefill.metadata.cueKey, "estimate_sent_followup");

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: prefill.sourceType,
    sourceId: prefill.sourceId,
    customerId: "",
    projectId,
    linkPath: prefill.linkPath,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("invoice operational cue prefill creates an invoice source-locked collection draft", () => {
  const cue = buildOperationalCue({
    cueKey: "invoice_overdue",
    subjectType: "invoice",
    subjectId: invoiceId,
    title: "INV-100 is overdue",
    message: "Invoice still has an open balance after the due date.",
    urgency: "high",
    ageDays: 3,
    actionHref: `/invoices/${invoiceId}`,
    actionLabel: "Open invoice",
    reason: "Due 3 days ago with $500.00 open.",
    explanation: "Invoice due date has passed and the invoice is still open.",
    sourceLabel: "Invoice due date",
    sourceValue: "May 8, 2026",
    thresholdLabel: "Rule threshold: 0 days",
    triggeredAtLabel: "Triggered after 3 days"
  });
  const action = getOperationalCueWorkItemBridgeAction(cue);
  const prefill = buildOperationalCueWorkItemPrefill({ cue });

  assert.deepEqual(action, {
    href: `/invoices/${invoiceId}?workItemCue=invoice_overdue#work-items`,
    label: "Create collection follow-up"
  });
  assert.ok(prefill);
  assert.equal(prefill.kind, "invoice_follow_up");
  assert.equal(prefill.priority, "high");
  assert.equal(prefill.sourceType, "invoice");
  assert.equal(prefill.sourceId, invoiceId);
  assert.equal(prefill.linkPath, `/invoices/${invoiceId}`);
  assert.equal(prefill.title, "Follow up on past-due invoice");
  assert.match(prefill.description ?? "", /Due 3 days ago with \$500.00 open/);
  assert.match(prefill.description ?? "", /Invoice due date: May 8, 2026/);

  const parsed = workItemCreateSchema.safeParse({
    title: prefill.title,
    description: prefill.description,
    priority: prefill.priority,
    kind: prefill.kind,
    dueAt: prefill.dueAt,
    assignedPersonId: "",
    sourceType: prefill.sourceType,
    sourceId: prefill.sourceId,
    customerId: "",
    projectId,
    linkPath: prefill.linkPath,
    visibility: "internal",
    dedupeKey: prefill.dedupeKey,
    metadata: prefill.metadata
  });

  assert.equal(parsed.success, true);
});

void test("unsupported operational cue types do not produce prefill bridge actions", () => {
  const cue = buildOperationalCue({
    cueKey: "job_scheduled_missing_crew",
    subjectType: "job",
    subjectId: "88888888-8888-4888-8888-888888888888",
    actionHref: "/jobs/88888888-8888-4888-8888-888888888888"
  });

  assert.equal(getOperationalCueWorkItemBridgeAction(cue), null);
  assert.equal(buildOperationalCueWorkItemPrefill({ cue }), null);
});
