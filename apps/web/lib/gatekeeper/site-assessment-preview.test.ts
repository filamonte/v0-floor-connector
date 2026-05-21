import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildGateKeeperSiteAssessmentPreview } from "./site-assessment-preview";

const previewSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/site-assessment-preview.ts"),
  "utf8"
);
const drawerSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/components/gatekeeper-suggestion-detail-drawer.tsx"
  ),
  "utf8"
);
const actionsSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);

void test("site assessment preview maps known payload fields safely", () => {
  const preview = buildGateKeeperSiteAssessmentPreview({
    proposedPayload: {
      customerName: "Riley Stone",
      customerPhone: "555-0100",
      customerEmail: "riley@example.com",
      requestedService: "Garage epoxy",
      addressLine1: "12 Industrial Way",
      requestedAppointment: "Friday morning",
      schedulingNotes: "Customer prefers a morning walkthrough.",
      sourceType: "phone_call"
    },
    subjectId: "11111111-1111-4111-8111-111111111111",
    subjectType: "opportunity"
  });

  assert.equal(preview.futureOwningWorkflow, "Leads/Opportunities");
  assert.equal(preview.proposedContactName, "Riley Stone");
  assert.equal(preview.proposedPhone, "555-0100");
  assert.equal(preview.proposedEmail, "riley@example.com");
  assert.equal(preview.proposedService, "Garage epoxy");
  assert.equal(preview.proposedLocationText, "12 Industrial Way");
  assert.equal(preview.requestedAppointmentText, "Friday morning");
  assert.equal(
    preview.schedulingNotes,
    "Customer prefers a morning walkthrough."
  );
  assert.equal(preview.sourceLabel, "phone_call");
  assert.equal(
    preview.linkedSubjectLabel,
    "opportunity 11111111-1111-4111-8111-111111111111"
  );
  assert.deepEqual(preview.missingRecommendedFields, []);
  assert.equal(preview.canScheduleNow, false);
  assert.ok(
    preview.blockers.some(
      (blocker) => blocker.code === "execution_not_implemented"
    )
  );
});

void test("site assessment preview names project-linked future ownership without scheduling", () => {
  const preview = buildGateKeeperSiteAssessmentPreview({
    proposedPayload: {
      customerName: "Riley Stone",
      phone: "555-0100",
      service: "Polished concrete",
      location: "Warehouse bay",
      requestedDateText: "2026-06-03 10:00 AM"
    },
    subjectId: "22222222-2222-4222-8222-222222222222",
    subjectType: "project"
  });

  assert.equal(preview.futureOwningWorkflow, "Projects/Schedule");
  assert.equal(preview.canScheduleNow, false);
  assert.match(preview.safetyCopy, /No appointment/);
  assert.match(preview.safetyCopy, /job/);
});

void test("site assessment preview does not trust unknown fields as canonical scheduling fields", () => {
  const preview = buildGateKeeperSiteAssessmentPreview({
    proposedPayload: {
      customerName: "Riley Stone",
      requestedAppointment: "Friday morning",
      providerAppointmentId: "external-123",
      canonicalJobId: "do-not-trust",
      autoSchedule: true
    }
  });

  assert.equal(preview.proposedContactName, "Riley Stone");
  assert.equal(preview.proposedService, null);
  assert.equal(preview.proposedLocationText, null);
  assert.deepEqual(
    preview.additionalUntrustedData.map((field) => field.key),
    ["providerAppointmentId", "canonicalJobId", "autoSchedule"]
  );
  assert.ok(
    preview.missingRecommendedFields.includes("At least one contact method")
  );
  assert.ok(
    preview.missingRecommendedFields.includes("Requested service or job type")
  );
});

void test("site assessment preview remains conservative for empty or partial payloads", () => {
  const preview = buildGateKeeperSiteAssessmentPreview({
    proposedPayload: {
      notes: "Caller asked about a visit."
    }
  });

  assert.equal(preview.proposedContactName, null);
  assert.equal(preview.proposedPhone, null);
  assert.equal(preview.proposedEmail, null);
  assert.equal(preview.proposedService, null);
  assert.equal(preview.proposedLocationText, null);
  assert.equal(preview.requestedAppointmentText, null);
  assert.deepEqual(preview.missingRecommendedFields, [
    "Linked subject or contact/customer name",
    "At least one contact method",
    "Requested service or job type",
    "Site address or location text",
    "Requested appointment/date text"
  ]);
  assert.equal(preview.canScheduleNow, false);
});

void test("site assessment preview is surfaced only as detail drawer preview", () => {
  assert.match(drawerSource, /Site assessment scheduling preview/);
  assert.match(drawerSource, /No appointment has been scheduled/);
  assert.match(drawerSource, /buildGateKeeperSiteAssessmentPreview/);
  assert.doesNotMatch(drawerSource, />\s*Schedule\s*</);
  assert.doesNotMatch(drawerSource, />\s*Create appointment\s*</);
  assert.doesNotMatch(drawerSource, />\s*Create job\s*</);
  assert.doesNotMatch(drawerSource, />\s*Execute\s*</);
  assert.doesNotMatch(drawerSource, />\s*Send confirmation\s*</);
});

void test("site assessment preview does not import mutation modules or providers", () => {
  assert.doesNotMatch(
    previewSource,
    /from ["']@\/lib\/(schedule|appointments|jobs|opportunities)\/(actions|data)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    previewSource,
    /scheduleJobAction|createAppointment|updateAppointment|createOpportunityAction|updateOpportunityAction|createJob|executeGateKeeper|execution_validated/i
  );
});

void test("review approval remains separate from site assessment preview", () => {
  assert.match(actionsSource, /No action was executed/);
  assert.doesNotMatch(
    actionsSource,
    /buildGateKeeperSiteAssessmentPreview|scheduleJobAction|createAppointment|updateAppointment|createJob|executeGateKeeper/i
  );
});
