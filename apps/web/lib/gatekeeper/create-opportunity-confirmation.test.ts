import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildGateKeeperCreateOpportunityConfirmationModel,
  getGateKeeperCreateOpportunityConfirmationMissingFields
} from "./create-opportunity-confirmation";

const helperSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-confirmation.ts"
  ),
  "utf8"
);
const componentSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/components/gatekeeper-create-opportunity-confirmation.tsx"
  ),
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

void test("create opportunity confirmation maps suggestion payload into editable draft fields", () => {
  const model = buildGateKeeperCreateOpportunityConfirmationModel({
    customerName: "Riley Stone",
    customerPhone: "555-0100",
    customerEmail: "riley@example.com",
    requestedService: "Garage epoxy",
    addressLine1: "12 Industrial Way",
    requestedAppointment: "Friday morning",
    sourceType: "phone_call",
    notes: "Customer wants a callback before the site visit."
  });

  assert.deepEqual(model.draft, {
    contactName: "Riley Stone",
    phone: "555-0100",
    email: "riley@example.com",
    requestedService: "Garage epoxy",
    locationText: "12 Industrial Way",
    notes: "Customer wants a callback before the site visit.",
    requestedAppointmentText: "Friday morning",
    sourceLabel: "phone_call"
  });
  assert.equal(model.executionOwner, "Leads/Opportunities");
  assert.equal(model.canExecuteNow, false);
  assert.deepEqual(model.missingRecommendedFields, []);
});

void test("create opportunity confirmation surfaces missing fields for edited drafts", () => {
  assert.deepEqual(
    getGateKeeperCreateOpportunityConfirmationMissingFields({
      contactName: "",
      phone: "",
      email: "",
      requestedService: "",
      locationText: "",
      notes: "",
      requestedAppointmentText: "",
      sourceLabel: ""
    }),
    [
      "Contact/customer name",
      "At least one contact method",
      "Requested service or job type",
      "Site address or location text"
    ]
  );
});

void test("create opportunity confirmation duplicate checks remain display-only placeholders", () => {
  const model = buildGateKeeperCreateOpportunityConfirmationModel({
    customerName: "Riley Stone"
  });

  assert.equal(model.duplicatePlaceholders.length, 3);
  assert.deepEqual(
    model.duplicatePlaceholders.map((placeholder) => placeholder.status),
    ["not_run", "not_run", "not_run"]
  );
  assert.ok(
    model.blockers.some(
      (blocker) => blocker.code === "confirmation_and_request_required"
    )
  );
});

void test("create opportunity confirmation appears in the suggestion drawer with local-only draft copy", () => {
  assert.match(drawerSource, /GateKeeperCreateOpportunityConfirmation/);
  assert.match(componentSource, /Prepare opportunity draft/);
  assert.match(componentSource, /Open confirmation preview/);
  assert.match(componentSource, /Save confirmation draft/);
  assert.match(componentSource, /saveCreateOpportunityExecutionDraftAction/);
  assert.match(componentSource, /No opportunity/);
  assert.match(componentSource, /canExecuteNow/);
  assert.match(
    componentSource,
    /This local draft does not create an opportunity/
  );
  assert.match(componentSource, />\s*Create opportunity\s*</);
  assert.doesNotMatch(componentSource, />\s*Execute now\s*</);
});

void test("create opportunity confirmation does not import mutation modules or providers", () => {
  const combinedSource = `${helperSource}\n${componentSource}`;

  assert.doesNotMatch(
    combinedSource,
    /from ["']@\/lib\/(opportunities|contacts|customers|projects|schedule|appointments|jobs|work-items|communications|invoices|contracts|payments)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    combinedSource,
    /\bquickCreateOpportunityAction\b|\bcreateOpportunityAction\b|\bupdateOpportunityAction\b|\bensureOpportunityEstimateFlow\b|\bcreateContact\b|\bcreateCustomer\b|\bcreateProject\b|\bcreateAppointment\b|\bscheduleAppointment\b|\bcreateInvoice\b|\bsendEmail\b|\bsendSms\b|\bexecuteGateKeeper\b|execution_validated/i
  );
});

void test("review approval remains separate from create opportunity confirmation", () => {
  assert.match(actionsSource, /No action was executed/);
  assert.doesNotMatch(
    actionsSource,
    /buildGateKeeperCreateOpportunityConfirmationModel|createOpportunityAction|executeGateKeeper/i
  );
});
