import assert from "node:assert/strict";
import test from "node:test";

import {
  deriveOperationalCues,
  filterOperationalCuesForProject,
  filterOperationalCuesForSubject,
  groupOperationalCuesBySubject
} from "./derive";
import type { OperationalCueRule } from "./types";
import { operationalCueRuleDefinitionByKey } from "./rule-definitions";

const organizationId = "organization-1";

function rule(
  cueKey: OperationalCueRule["cueKey"],
  subjectType: OperationalCueRule["subjectType"],
  thresholdDays: number,
  urgency: OperationalCueRule["urgency"] = "high",
  ruleOrganizationId = organizationId
): OperationalCueRule {
  return {
    id: `rule-${cueKey}`,
    organizationId: ruleOrganizationId,
    cueKey,
    subjectType,
    enabled: true,
    thresholdDays,
    urgency,
    ownerStrategy: operationalCueRuleDefinitionByKey.get(cueKey)?.ownerStrategy ??
      "record_owner",
    escalationDays: null,
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  };
}

void test("derives enabled operational cues from canonical estimate, invoice, and job records", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [
      rule("estimate_sent_followup", "estimate", 3),
      rule("invoice_overdue", "invoice", 1),
      rule("job_scheduled_missing_crew", "job", 2)
    ],
    estimates: [
      {
        id: "estimate-1",
        organizationId,
        referenceNumber: "EST-100",
        status: "sent",
        sentAt: "2026-05-05T12:00:00.000Z",
        updatedAt: "2026-05-05T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    contracts: [],
    invoices: [
      {
        id: "invoice-1",
        organizationId,
        referenceNumber: "INV-100",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: "2026-05-07",
        balanceDueAmount: "1200.00",
        updatedAt: "2026-05-07T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    jobs: [
      {
        id: "job-1",
        organizationId,
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-10",
        scheduledStartAt: null,
        crewVendorId: null,
        updatedAt: "2026-05-08T12:00:00.000Z",
        assignmentCount: 0,
        projectReadinessStatus: "ready_to_schedule",
        projectReadyToScheduleAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ]
  });

  assert.deepEqual(
    cues.map((cue) => cue.cueKey).sort(),
    ["estimate_sent_followup", "invoice_overdue", "job_scheduled_missing_crew"]
  );

  const groups = groupOperationalCuesBySubject(cues);
  assert.equal(groups.estimates.length, 1);
  assert.equal(groups.invoices.length, 1);
  assert.equal(groups.jobs.length, 1);
  assert.equal(
    cues.find((cue) => cue.cueKey === "invoice_overdue")?.urgency,
    "high"
  );
});

void test("uses rule urgency on derived cues", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("estimate_sent_followup", "estimate", 3, "critical")],
    estimates: [
      {
        id: "estimate-critical",
        organizationId,
        referenceNumber: "EST-CRITICAL",
        status: "sent",
        sentAt: "2026-05-01T12:00:00.000Z",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    contracts: [],
    invoices: [],
    jobs: []
  });

  assert.equal(cues.length, 1);
  assert.equal(cues[0]?.urgency, "critical");
});

void test("includes person-resolved responsibility metadata on derived cues", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("invoice_overdue", "invoice", 1)],
    responsibilityDefaults: [
      {
        roleKey: "billing_owner",
        personId: "person-billing",
        personDisplayName: "Jane Billing",
        membershipUserId: "user-billing",
        isActive: true,
        isAssignable: true
      }
    ],
    estimates: [],
    contracts: [],
    invoices: [
      {
        id: "invoice-responsible",
        organizationId,
        referenceNumber: "INV-RESP",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: "2026-05-07",
        balanceDueAmount: "1200.00",
        updatedAt: "2026-05-07T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { id: "project-1", name: "Kitchen floor" }
      }
    ],
    jobs: []
  });

  assert.equal(cues.length, 1);
  assert.equal(cues[0]?.responsibility.displayLabel, "Jane Billing");
  assert.equal(cues[0]?.responsibility.strategyLabel, "Billing owner");
  assert.equal(cues[0]?.responsibility.resolutionStatus, "user_resolved");
  assert.equal(cues[0]?.responsibility.personId, "person-billing");
  assert.equal(cues[0]?.assignedUserId, "user-billing");
});

void test("does not derive disabled or below-threshold cues", () => {
  const disabledRule = rule("contract_sent_unsigned", "contract", 3);
  disabledRule.enabled = false;

  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [disabledRule, rule("deposit_invoice_unpaid", "invoice", 3)],
    estimates: [],
    contracts: [
      {
        id: "contract-1",
        organizationId,
        title: "Contract",
        status: "sent",
        sentAt: "2026-05-01T12:00:00.000Z",
        viewedAt: null,
        customerViewedAt: null,
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    invoices: [
      {
        id: "invoice-1",
        organizationId,
        referenceNumber: "INV-100",
        status: "sent",
        workflowRole: "deposit",
        issueDate: "2026-05-08",
        dueDate: null,
        balanceDueAmount: "100.00",
        updatedAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    jobs: []
  });

  assert.equal(cues.length, 0);
});

void test("respects threshold boundaries and fallback timestamp reasons", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("estimate_sent_followup", "estimate", 3)],
    estimates: [
      {
        id: "estimate-at-threshold",
        organizationId,
        referenceNumber: "EST-THRESHOLD",
        status: "sent",
        sentAt: null,
        updatedAt: "2026-05-06T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "estimate-before-threshold",
        organizationId,
        referenceNumber: "EST-EARLY",
        status: "sent",
        sentAt: "2026-05-07T12:00:00.000Z",
        updatedAt: "2026-05-07T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    contracts: [],
    invoices: [],
    jobs: []
  });

  assert.deepEqual(
    cues.map((cue) => cue.subjectId),
    ["estimate-at-threshold"]
  );
  assert.match(cues[0]?.reason ?? "", /updated_at is used/);
  assert.match(cues[0]?.explanation ?? "", /Using last updated date/);
  assert.equal(cues[0]?.sourceLabel, "Estimate last updated date");
});

void test("sent estimate follow-up appears only for stale sent estimates", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("estimate_sent_followup", "estimate", 3)],
    estimates: [
      {
        id: "stale-sent-estimate",
        organizationId,
        referenceNumber: "EST-STALE",
        status: "sent",
        sentAt: "2026-05-05T12:00:00.000Z",
        updatedAt: "2026-05-05T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "recent-sent-estimate",
        organizationId,
        referenceNumber: "EST-RECENT",
        status: "sent",
        sentAt: "2026-05-08T12:00:00.000Z",
        updatedAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "stale-approved-estimate",
        organizationId,
        referenceNumber: "EST-APPROVED",
        status: "approved",
        sentAt: "2026-05-01T12:00:00.000Z",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    contracts: [],
    invoices: [],
    jobs: []
  });

  assert.deepEqual(
    cues.map((cue) => cue.subjectId),
    ["stale-sent-estimate"]
  );
  assert.equal(cues[0]?.actionHref, "/estimates/stale-sent-estimate");
});

void test("does not create overdue invoice cues without a due date", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("invoice_overdue", "invoice", 1)],
    estimates: [],
    contracts: [],
    invoices: [
      {
        id: "invoice-no-due-date",
        organizationId,
        referenceNumber: "INV-NO-DUE",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: null,
        balanceDueAmount: "1200.00",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    jobs: []
  });

  assert.equal(cues.length, 0);
});

void test("past-due invoice cues require an open balance", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("invoice_overdue", "invoice", 1)],
    estimates: [],
    contracts: [],
    invoices: [
      {
        id: "invoice-with-balance",
        organizationId,
        referenceNumber: "INV-BALANCE",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: "2026-05-07",
        balanceDueAmount: "1200.00",
        updatedAt: "2026-05-07T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "invoice-zero-balance",
        organizationId,
        referenceNumber: "INV-ZERO",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: "2026-05-07",
        balanceDueAmount: "0.00",
        updatedAt: "2026-05-07T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "invoice-negative-balance",
        organizationId,
        referenceNumber: "INV-CREDIT",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: "2026-05-07",
        balanceDueAmount: "-10.00",
        updatedAt: "2026-05-07T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    jobs: []
  });

  assert.deepEqual(
    cues.map((cue) => cue.subjectId),
    ["invoice-with-balance"]
  );
});

void test("keeps deposit invoice cues scoped to deposit workflow role", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("deposit_invoice_unpaid", "invoice", 3)],
    estimates: [],
    contracts: [],
    invoices: [
      {
        id: "standard-invoice",
        organizationId,
        referenceNumber: "INV-STANDARD",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: null,
        balanceDueAmount: "1200.00",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    jobs: []
  });

  assert.equal(cues.length, 0);
});

void test("does not derive cues from another organization", () => {
  const otherOrganizationId = "organization-2";
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [
      rule("estimate_sent_followup", "estimate", 3),
      rule("invoice_overdue", "invoice", 1, "high", otherOrganizationId)
    ],
    estimates: [
      {
        id: "other-org-estimate",
        organizationId: otherOrganizationId,
        referenceNumber: "EST-OTHER",
        status: "sent",
        sentAt: "2026-05-01T12:00:00.000Z",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Other Org" },
        project: { name: "Other Project" }
      }
    ],
    contracts: [],
    invoices: [
      {
        id: "same-org-invoice",
        organizationId,
        referenceNumber: "INV-SAME",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: "2026-05-01",
        balanceDueAmount: "1200.00",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ],
    jobs: []
  });

  assert.equal(cues.length, 0);
});

void test("keeps unscheduled and scheduled job cue cases distinct", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [
      rule("job_ready_unscheduled", "job", 1),
      rule("job_scheduled_missing_crew", "job", 2)
    ],
    estimates: [],
    contracts: [],
    invoices: [],
    jobs: [
      {
        id: "unscheduled-job",
        organizationId,
        dispatchStatus: "unscheduled",
        scheduledDate: null,
        scheduledStartAt: null,
        crewVendorId: null,
        updatedAt: "2026-05-08T12:00:00.000Z",
        assignmentCount: 0,
        projectReadinessStatus: "ready_to_schedule",
        projectReadyToScheduleAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "scheduled-job",
        organizationId,
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-10",
        scheduledStartAt: null,
        crewVendorId: null,
        updatedAt: "2026-05-08T12:00:00.000Z",
        assignmentCount: 0,
        projectReadinessStatus: "ready_to_schedule",
        projectReadyToScheduleAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ]
  });

  assert.deepEqual(
    cues.map((cue) => `${cue.subjectId}:${cue.cueKey}`).sort(),
    [
      "scheduled-job:job_scheduled_missing_crew",
      "unscheduled-job:job_ready_unscheduled"
    ]
  );
  assert.equal(
    cues.find((cue) => cue.subjectId === "scheduled-job")?.actionHref,
    "/jobs/scheduled-job"
  );
  assert.equal(
    cues.find((cue) => cue.subjectId === "unscheduled-job")?.actionHref,
    "/schedule?jobId=unscheduled-job&view=unscheduled&action=schedule"
  );
});

void test("scheduled job missing crew cues require a scheduled job with no assignment or crew", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [rule("job_scheduled_missing_crew", "job", 2)],
    estimates: [],
    contracts: [],
    invoices: [],
    jobs: [
      {
        id: "scheduled-unassigned-job",
        organizationId,
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-10",
        scheduledStartAt: null,
        crewVendorId: null,
        updatedAt: "2026-05-08T12:00:00.000Z",
        assignmentCount: 0,
        projectReadinessStatus: "ready_to_schedule",
        projectReadyToScheduleAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "scheduled-assigned-job",
        organizationId,
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-10",
        scheduledStartAt: null,
        crewVendorId: null,
        updatedAt: "2026-05-08T12:00:00.000Z",
        assignmentCount: 1,
        projectReadinessStatus: "ready_to_schedule",
        projectReadyToScheduleAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "scheduled-crew-vendor-job",
        organizationId,
        dispatchStatus: "scheduled",
        scheduledDate: "2026-05-10",
        scheduledStartAt: null,
        crewVendorId: "vendor-1",
        updatedAt: "2026-05-08T12:00:00.000Z",
        assignmentCount: 0,
        projectReadinessStatus: "ready_to_schedule",
        projectReadyToScheduleAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      },
      {
        id: "unscheduled-unassigned-job",
        organizationId,
        dispatchStatus: "unscheduled",
        scheduledDate: null,
        scheduledStartAt: null,
        crewVendorId: null,
        updatedAt: "2026-05-08T12:00:00.000Z",
        assignmentCount: 0,
        projectReadinessStatus: "ready_to_schedule",
        projectReadyToScheduleAt: "2026-05-08T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { name: "Kitchen floor" }
      }
    ]
  });

  assert.deepEqual(
    cues.map((cue) => cue.subjectId),
    ["scheduled-unassigned-job"]
  );
});

void test("filters derived cues by canonical subject and linked project", () => {
  const cues = deriveOperationalCues({
    organizationId,
    now: new Date("2026-05-09T12:00:00.000Z"),
    rules: [
      rule("estimate_sent_followup", "estimate", 3),
      rule("contract_sent_unsigned", "contract", 3),
      rule("invoice_overdue", "invoice", 1)
    ],
    estimates: [
      {
        id: "estimate-project-1",
        organizationId,
        referenceNumber: "EST-P1",
        status: "sent",
        sentAt: "2026-05-01T12:00:00.000Z",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { id: "project-1", name: "Kitchen floor" }
      },
      {
        id: "estimate-project-2",
        organizationId,
        referenceNumber: "EST-P2",
        status: "sent",
        sentAt: "2026-05-01T12:00:00.000Z",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Other Customer" },
        project: { id: "project-2", name: "Garage floor" }
      }
    ],
    contracts: [
      {
        id: "contract-project-1",
        organizationId,
        title: "Project 1 Contract",
        status: "sent",
        sentAt: "2026-05-01T12:00:00.000Z",
        viewedAt: null,
        customerViewedAt: null,
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Acme Floors" },
        project: { id: "project-1", name: "Kitchen floor" }
      }
    ],
    invoices: [
      {
        id: "invoice-project-2",
        organizationId,
        referenceNumber: "INV-P2",
        status: "sent",
        workflowRole: "standard",
        issueDate: "2026-05-01",
        dueDate: "2026-05-01",
        balanceDueAmount: "1200.00",
        updatedAt: "2026-05-01T12:00:00.000Z",
        customer: { name: "Other Customer" },
        project: { id: "project-2", name: "Garage floor" }
      }
    ],
    jobs: []
  });

  assert.deepEqual(
    filterOperationalCuesForSubject(cues, {
      subjectType: "estimate",
      subjectId: "estimate-project-1"
    }).map((cue) => cue.subjectId),
    ["estimate-project-1"]
  );

  assert.deepEqual(
    filterOperationalCuesForProject(cues, { projectId: "project-1" })
      .map((cue) => `${cue.subjectType}:${cue.subjectId}`)
      .sort(),
    ["contract:contract-project-1", "estimate:estimate-project-1"]
  );

  assert.deepEqual(
    filterOperationalCuesForProject(cues, { projectId: "missing-project" }),
    []
  );
});

void test("derives each supported cue key with canonical links and project aggregation ids", () => {
  const now = new Date("2026-05-09T12:00:00.000Z");
  const project = { id: "project-cue-coverage", name: "Cue coverage project" };
  const customer = { name: "Cue Coverage Customer" };
  const cases = [
    {
      cueKey: "estimate_sent_followup",
      subjectType: "estimate",
      subjectId: "estimate-cue",
      expectedHref: "/estimates/estimate-cue",
      sources: {
        estimates: [
          {
            id: "estimate-cue",
            organizationId,
            referenceNumber: "EST-CUE",
            status: "sent",
            sentAt: "2026-05-01T12:00:00.000Z",
            updatedAt: "2026-05-01T12:00:00.000Z",
            customer,
            project
          }
        ]
      }
    },
    {
      cueKey: "contract_sent_unsigned",
      subjectType: "contract",
      subjectId: "contract-sent-cue",
      expectedHref: "/contracts/contract-sent-cue",
      sources: {
        contracts: [
          {
            id: "contract-sent-cue",
            organizationId,
            title: "Sent Contract",
            status: "sent",
            sentAt: "2026-05-01T12:00:00.000Z",
            viewedAt: null,
            customerViewedAt: null,
            updatedAt: "2026-05-01T12:00:00.000Z",
            customer,
            project
          }
        ]
      }
    },
    {
      cueKey: "contract_viewed_unsigned",
      subjectType: "contract",
      subjectId: "contract-viewed-cue",
      expectedHref: "/contracts/contract-viewed-cue",
      sources: {
        contracts: [
          {
            id: "contract-viewed-cue",
            organizationId,
            title: "Viewed Contract",
            status: "viewed",
            sentAt: "2026-05-01T12:00:00.000Z",
            viewedAt: "2026-05-05T12:00:00.000Z",
            customerViewedAt: "2026-05-05T12:00:00.000Z",
            updatedAt: "2026-05-05T12:00:00.000Z",
            customer,
            project
          }
        ]
      }
    },
    {
      cueKey: "invoice_overdue",
      subjectType: "invoice",
      subjectId: "invoice-overdue-cue",
      expectedHref: "/invoices/invoice-overdue-cue",
      sources: {
        invoices: [
          {
            id: "invoice-overdue-cue",
            organizationId,
            referenceNumber: "INV-OVERDUE-CUE",
            status: "sent",
            workflowRole: "standard",
            issueDate: "2026-05-01",
            dueDate: "2026-05-07",
            balanceDueAmount: "500.00",
            updatedAt: "2026-05-07T12:00:00.000Z",
            customer,
            project
          }
        ]
      }
    },
    {
      cueKey: "deposit_invoice_unpaid",
      subjectType: "invoice",
      subjectId: "deposit-invoice-cue",
      expectedHref: "/invoices/deposit-invoice-cue",
      sources: {
        invoices: [
          {
            id: "deposit-invoice-cue",
            organizationId,
            referenceNumber: "INV-DEPOSIT-CUE",
            status: "sent",
            workflowRole: "deposit",
            issueDate: "2026-05-01",
            dueDate: null,
            balanceDueAmount: "750.00",
            updatedAt: "2026-05-01T12:00:00.000Z",
            customer,
            project
          }
        ]
      }
    },
    {
      cueKey: "job_ready_unscheduled",
      subjectType: "job",
      subjectId: "job-ready-cue",
      expectedHref: "/schedule?jobId=job-ready-cue&view=unscheduled&action=schedule",
      sources: {
        jobs: [
          {
            id: "job-ready-cue",
            organizationId,
            dispatchStatus: "unscheduled",
            scheduledDate: null,
            scheduledStartAt: null,
            crewVendorId: null,
            updatedAt: "2026-05-07T12:00:00.000Z",
            assignmentCount: 0,
            projectReadinessStatus: "ready_to_schedule",
            projectReadyToScheduleAt: "2026-05-07T12:00:00.000Z",
            customer,
            project
          }
        ]
      }
    },
    {
      cueKey: "job_scheduled_missing_crew",
      subjectType: "job",
      subjectId: "job-missing-crew-cue",
      expectedHref: "/jobs/job-missing-crew-cue",
      sources: {
        jobs: [
          {
            id: "job-missing-crew-cue",
            organizationId,
            dispatchStatus: "scheduled",
            scheduledDate: "2026-05-10",
            scheduledStartAt: null,
            crewVendorId: null,
            updatedAt: "2026-05-07T12:00:00.000Z",
            assignmentCount: 0,
            projectReadinessStatus: "ready_to_schedule",
            projectReadyToScheduleAt: "2026-05-07T12:00:00.000Z",
            customer,
            project
          }
        ]
      }
    }
  ];

  for (const fixture of cases) {
    const enabledRule = rule(
      fixture.cueKey as OperationalCueRule["cueKey"],
      fixture.subjectType as OperationalCueRule["subjectType"],
      1
    );
    const cues = deriveOperationalCues({
      organizationId,
      now,
      rules: [enabledRule],
      estimates: [],
      contracts: [],
      invoices: [],
      jobs: [],
      ...fixture.sources
    });

    assert.equal(cues.length, 1, `${fixture.cueKey} should derive one cue`);
    assert.equal(cues[0]?.cueKey, fixture.cueKey);
    assert.equal(cues[0]?.subjectId, fixture.subjectId);
    assert.equal(cues[0]?.actionHref, fixture.expectedHref);
    assert.equal(cues[0]?.projectId, project.id);
    assert.equal(
      cues[0]?.ownerStrategy,
      operationalCueRuleDefinitionByKey.get(
        fixture.cueKey as OperationalCueRule["cueKey"]
      )?.ownerStrategy
    );
    assert.ok(cues[0]?.ownerStrategyLabel, `${fixture.cueKey} should expose owner strategy label`);
    assert.equal(cues[0]?.ownerResolutionStatus, "strategy_only");
    assert.equal(
      cues[0]?.responsibility.strategy,
      operationalCueRuleDefinitionByKey.get(
        fixture.cueKey as OperationalCueRule["cueKey"]
      )?.ownerStrategy
    );
    assert.equal(cues[0]?.responsibility.resolutionStatus, "strategy_only");
    assert.equal(cues[0]?.responsibility.personId, null);
    assert.equal(cues[0]?.responsibility.userId, null);
    assert.ok(
      cues[0]?.responsibility.displayLabel,
      `${fixture.cueKey} should expose a responsibility display label`
    );
    assert.ok(cues[0]?.explanation, `${fixture.cueKey} should explain why it appears`);
    assert.ok(cues[0]?.sourceLabel, `${fixture.cueKey} should expose a source label`);
    assert.ok(cues[0]?.sourceValue, `${fixture.cueKey} should expose a source value`);
    assert.match(
      cues[0]?.thresholdLabel ?? "",
      /Rule threshold:/,
      `${fixture.cueKey} should expose rule threshold context`
    );
    assert.ok(
      cues[0]?.triggeredAtLabel,
      `${fixture.cueKey} should expose trigger timing context`
    );

    if (
      fixture.cueKey === "estimate_sent_followup" ||
      fixture.cueKey === "contract_sent_unsigned" ||
      fixture.cueKey === "contract_viewed_unsigned" ||
      fixture.cueKey === "deposit_invoice_unpaid"
    ) {
      assert.match(cues[0]?.explanation ?? "", /This rule triggers after 1 day/);
    }

    if (fixture.cueKey === "invoice_overdue") {
      assert.match(cues[0]?.explanation ?? "", /Invoice due date has passed/);
      assert.equal(cues[0]?.sourceLabel, "Invoice due date");
    }

    if (fixture.cueKey === "job_ready_unscheduled") {
      assert.match(cues[0]?.explanation ?? "", /ready to schedule/);
      assert.equal(cues[0]?.sourceLabel, "Project ready-to-schedule date");
    }

    if (fixture.cueKey === "job_scheduled_missing_crew") {
      assert.match(cues[0]?.explanation ?? "", /no crew or vendor assignment/);
      assert.equal(cues[0]?.sourceLabel, "Job scheduled date");
    }

    const disabledRule = { ...enabledRule, enabled: false };
    const disabledCues = deriveOperationalCues({
      organizationId,
      now,
      rules: [disabledRule],
      estimates: [],
      contracts: [],
      invoices: [],
      jobs: [],
      ...fixture.sources
    });

    assert.equal(
      disabledCues.length,
      0,
      `${fixture.cueKey} should not derive when disabled`
    );
  }
});
