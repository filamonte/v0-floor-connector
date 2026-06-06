import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLeadFollowUpQueue,
  classifyLeadFollowUp,
  deriveSalesEstimateReadiness
} from "./follow-up-read-model";
import type { LeadFollowUpOpportunity } from "./follow-up-read-model";

const nowIso = "2026-05-07T14:00:00.000Z";

function opportunity(
  overrides: Partial<LeadFollowUpOpportunity>
): LeadFollowUpOpportunity {
  return {
    id: overrides.id ?? "opportunity-1",
    title: overrides.title ?? "Garage coating lead",
    status: overrides.status ?? "contacted",
    prospectName: overrides.prospectName ?? "Jamie Rivera",
    prospectCompanyName: overrides.prospectCompanyName ?? "Rivera Home",
    customerId: overrides.customerId ?? null,
    projectId: overrides.projectId ?? null,
    nextFollowUpAt: overrides.nextFollowUpAt ?? null,
    nextFollowUpNote: overrides.nextFollowUpNote ?? null,
    updatedAt: overrides.updatedAt ?? "2026-05-06T14:00:00.000Z",
    primaryContact: overrides.primaryContact ?? null,
    customer: overrides.customer ?? null,
    project: overrides.project ?? null
  };
}

void test("lead follow-up read model classifies overdue, today, upcoming, and missing follow-ups", () => {
  assert.equal(
    classifyLeadFollowUp("2026-05-06T21:00:00.000Z", nowIso),
    "overdue"
  );
  assert.equal(
    classifyLeadFollowUp("2026-05-07T09:00:00.000Z", nowIso),
    "due_today"
  );
  assert.equal(
    classifyLeadFollowUp("2026-05-08T09:00:00.000Z", nowIso),
    "upcoming"
  );
  assert.equal(classifyLeadFollowUp(null, nowIso), "no_follow_up");
});

void test("lead follow-up read model builds a due-first queue and carries recent communication timestamps", () => {
  const queue = buildLeadFollowUpQueue({
    nowIso,
    opportunities: [
      opportunity({
        id: "upcoming",
        title: "Upcoming follow-up",
        nextFollowUpAt: "2026-05-08T15:00:00.000Z"
      }),
      opportunity({
        id: "overdue",
        title: "Overdue follow-up",
        nextFollowUpAt: "2026-05-06T15:00:00.000Z"
      }),
      opportunity({
        id: "today",
        title: "Today follow-up",
        nextFollowUpAt: "2026-05-07T17:00:00.000Z",
        nextFollowUpNote: "Call after lunch."
      })
    ],
    lastCommunicationByOpportunityId: new Map([
      ["today", "2026-05-07T13:00:00.000Z"]
    ])
  });

  assert.deepEqual(
    queue.map((item) => [item.opportunityId, item.bucket]),
    [
      ["overdue", "overdue"],
      ["today", "due_today"],
      ["upcoming", "upcoming"]
    ]
  );
  assert.equal(queue[1]?.nextFollowUpNote, "Call after lunch.");
  assert.equal(queue[1]?.lastCommunicationAt, "2026-05-07T13:00:00.000Z");
});

void test("lead follow-up read model excludes closed leads and only includes no-follow-up leads when requested", () => {
  const baseOpportunities = [
    opportunity({ id: "open-missing", status: "qualified" }),
    opportunity({ id: "won-missing", status: "won" }),
    opportunity({ id: "lost-missing", status: "lost" }),
    opportunity({ id: "converted-missing", status: "converted" })
  ];

  assert.deepEqual(
    buildLeadFollowUpQueue({
      opportunities: baseOpportunities,
      nowIso
    }).map((item) => item.opportunityId),
    []
  );

  assert.deepEqual(
    buildLeadFollowUpQueue({
      opportunities: baseOpportunities,
      nowIso,
      includeNoFollowUp: true
    }).map((item) => item.opportunityId),
    ["open-missing"]
  );
});

void test("lead follow-up read model limits upcoming queue items to the configured horizon", () => {
  const queue = buildLeadFollowUpQueue({
    nowIso,
    upcomingDays: 2,
    opportunities: [
      opportunity({
        id: "soon",
        nextFollowUpAt: "2026-05-08T15:00:00.000Z"
      }),
      opportunity({
        id: "later",
        nextFollowUpAt: "2026-05-14T15:00:00.000Z"
      })
    ]
  });

  assert.deepEqual(
    queue.map((item) => item.opportunityId),
    ["soon"]
  );
});

void test("sales estimate readiness blocks missing assessment and canonical links", () => {
  const readiness = deriveSalesEstimateReadiness({
    status: "qualified",
    customerId: null,
    projectId: null,
    siteAssessmentStatus: "pending",
    requirementsSummary: null,
    measurementCount: 0,
    observationCount: 0,
    attachmentCount: 0
  });

  assert.equal(readiness.statusTone, "blocked");
  assert.equal(readiness.title, "Sales context needs work before estimating");
  assert.ok(
    readiness.blockers.some((blocker) =>
      blocker.includes("site assessment requirements")
    )
  );
  assert.ok(
    readiness.blockers.some((blocker) => blocker.includes("canonical customer"))
  );
  assert.ok(
    readiness.blockers.some((blocker) => blocker.includes("canonical project"))
  );
});

void test("sales estimate readiness calls for estimate ownership after canonical context is ready", () => {
  const readiness = deriveSalesEstimateReadiness({
    status: "site_assessment_complete",
    customerId: "customer-1",
    projectId: "project-1",
    siteAssessmentStatus: "completed",
    requirementsSummary: "Repair cracks and install flake broadcast.",
    measurementCount: 1,
    observationCount: 0,
    attachmentCount: 2
  });

  assert.equal(readiness.statusTone, "attention");
  assert.equal(readiness.blockers.length, 0);
  assert.equal(
    readiness.recommendedNextAction,
    "Assign Estimate Writer from this lead."
  );
});

void test("sales estimate readiness marks handoff ready when ownership is assigned", () => {
  const readiness = deriveSalesEstimateReadiness({
    status: "estimating",
    customerId: "customer-1",
    projectId: "project-1",
    siteAssessmentStatus: "completed",
    requirementsSummary: null,
    measurementCount: 0,
    observationCount: 1,
    attachmentCount: 0,
    estimateWriterName: "Ada Lovelace"
  });

  assert.equal(readiness.statusTone, "ready");
  assert.equal(readiness.title, "Ready for estimate handoff");
});
