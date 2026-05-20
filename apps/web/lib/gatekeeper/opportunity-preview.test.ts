import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { buildGateKeeperCreateOpportunityPreview } from "./opportunity-preview";

const previewSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/opportunity-preview.ts"),
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

void test("create opportunity preview maps known payload fields safely", () => {
  const preview = buildGateKeeperCreateOpportunityPreview({
    customerName: "Riley Stone",
    customerPhone: "555-0100",
    customerEmail: "riley@example.com",
    requestedService: "Garage epoxy",
    addressLine1: "12 Industrial Way",
    requestedAppointment: "Friday morning",
    sourceType: "phone_call",
    notes: "Customer wants a callback before the site visit."
  });

  assert.equal(preview.futureOwningWorkflow, "Leads/Opportunities");
  assert.equal(preview.proposedContactName, "Riley Stone");
  assert.equal(preview.proposedPhone, "555-0100");
  assert.equal(preview.proposedEmail, "riley@example.com");
  assert.equal(preview.proposedService, "Garage epoxy");
  assert.equal(preview.proposedLocationText, "12 Industrial Way");
  assert.equal(preview.requestedAppointmentText, "Friday morning");
  assert.equal(preview.sourceLabel, "phone_call");
  assert.deepEqual(preview.missingRecommendedFields, []);
  assert.equal(preview.canCreateNow, false);
  assert.ok(
    preview.blockers.some(
      (blocker) => blocker.code === "confirmation_and_request_required"
    )
  );
});

void test("create opportunity preview does not trust unknown fields as canonical fields", () => {
  const preview = buildGateKeeperCreateOpportunityPreview({
    customerName: "Riley Stone",
    requestedService: "Polished concrete",
    aiConfidence: 0.93,
    providerLeadId: "external-123",
    canonicalCustomerId: "do-not-trust"
  });

  assert.equal(preview.proposedContactName, "Riley Stone");
  assert.equal(preview.proposedService, "Polished concrete");
  assert.equal(preview.proposedLocationText, null);
  assert.deepEqual(
    preview.additionalUntrustedData.map((field) => field.key),
    ["aiConfidence", "providerLeadId", "canonicalCustomerId"]
  );
  assert.ok(
    preview.missingRecommendedFields.includes("At least one contact method")
  );
  assert.ok(
    preview.missingRecommendedFields.includes("Site address or location text")
  );
});

void test("create opportunity preview remains conservative for empty or partial payloads", () => {
  const preview = buildGateKeeperCreateOpportunityPreview({
    notes: "Caller asked for more information."
  });

  assert.equal(preview.proposedContactName, null);
  assert.equal(preview.proposedPhone, null);
  assert.equal(preview.proposedEmail, null);
  assert.equal(preview.proposedService, null);
  assert.equal(preview.proposedLocationText, null);
  assert.deepEqual(preview.missingRecommendedFields, [
    "Contact/customer name",
    "At least one contact method",
    "Requested service or job type",
    "Site address or location text"
  ]);
  assert.equal(preview.canCreateNow, false);
});

void test("create opportunity preview is surfaced separately from the controlled action", () => {
  assert.match(drawerSource, /Opportunity draft preview/);
  assert.match(drawerSource, /No opportunity has been created/);
  assert.match(drawerSource, /buildGateKeeperCreateOpportunityPreview/);
  assert.match(drawerSource, /GateKeeperCreateOpportunityConfirmation/);
  assert.doesNotMatch(drawerSource, />\s*Execute now\s*</);
});

void test("create opportunity preview does not import mutation modules or providers", () => {
  assert.doesNotMatch(
    previewSource,
    /from ["']@\/lib\/opportunities\/(actions|data)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    previewSource,
    /quickCreateOpportunityAction|createOpportunityAction|updateOpportunityAction|executeGateKeeper|execution_validated/i
  );
});

void test("review approval remains separate from create opportunity preview", () => {
  assert.match(actionsSource, /No action was executed/);
  assert.doesNotMatch(
    actionsSource,
    /buildGateKeeperCreateOpportunityPreview|quickCreateOpportunityAction|createOpportunityAction/i
  );
});
