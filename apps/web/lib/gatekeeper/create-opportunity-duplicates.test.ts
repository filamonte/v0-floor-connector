import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import {
  buildGateKeeperCreateOpportunityDuplicatePreview,
  normalizeGateKeeperDuplicatePhone,
  type GateKeeperCreateOpportunityDuplicateCandidate
} from "./create-opportunity-duplicates";
import type { GateKeeperCreateOpportunityConfirmationDraft } from "./create-opportunity-confirmation";

const helperSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-duplicates.ts"
  ),
  "utf8"
);
const dataSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/lib/gatekeeper/create-opportunity-duplicates-data.ts"
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

const baseDraft = {
  contactName: "Riley Stone",
  email: "riley@example.com",
  locationText: "12 Industrial Way",
  notes: "",
  phone: "(555) 010-2200",
  requestedAppointmentText: "",
  requestedService: "Garage epoxy",
  sourceLabel: "manual"
} satisfies GateKeeperCreateOpportunityConfirmationDraft;

function preview(input: {
  candidates: GateKeeperCreateOpportunityDuplicateCandidate[];
  draft?: Partial<GateKeeperCreateOpportunityConfirmationDraft>;
}) {
  return buildGateKeeperCreateOpportunityDuplicatePreview({
    candidates: input.candidates,
    draft: {
      ...baseDraft,
      ...input.draft
    }
  });
}

void test("create opportunity duplicate preview maps exact email to high confidence", () => {
  const result = preview({
    candidates: [
      {
        id: "opportunity-1",
        matchType: "opportunity",
        displayLabel: "Riley Stone garage",
        email: "RILEY@example.com",
        phone: null,
        name: "Different Name"
      }
    ]
  });

  assert.equal(
    result.recommendation,
    "high_confidence_duplicate_review_required"
  );
  assert.equal(result.matches[0]?.confidence, "high");
  assert.deepEqual(result.matches[0]?.reasonLabels, ["Exact email match"]);
  assert.equal(result.isReadOnly, true);
});

void test("create opportunity duplicate preview maps normalized phone to high confidence", () => {
  assert.equal(
    normalizeGateKeeperDuplicatePhone("+1 (555) 010-2200"),
    "5550102200"
  );

  const result = preview({
    candidates: [
      {
        id: "customer-1",
        matchType: "customer",
        displayLabel: "Riley Stone",
        email: null,
        phone: "555.010.2200",
        name: "Different Name"
      }
    ]
  });

  assert.equal(
    result.recommendation,
    "high_confidence_duplicate_review_required"
  );
  assert.equal(result.matches[0]?.confidence, "high");
  assert.ok(
    result.matches[0]?.reasonLabels.includes("Exact normalized phone match")
  );
});

void test("create opportunity duplicate preview keeps name-only matches low confidence", () => {
  const result = preview({
    candidates: [
      {
        id: "contact-1",
        matchType: "contact",
        displayLabel: "Riley Stone",
        email: null,
        phone: null,
        name: "Riley Stone"
      }
    ],
    draft: {
      email: "",
      phone: "",
      requestedService: "",
      locationText: ""
    }
  });

  assert.equal(result.recommendation, "review_possible_duplicate");
  assert.equal(result.matches[0]?.confidence, "low");
  assert.deepEqual(result.matches[0]?.reasonLabels, ["Exact name match"]);
});

void test("create opportunity duplicate preview uses service or location only as supporting context", () => {
  const result = preview({
    candidates: [
      {
        id: "opportunity-2",
        matchType: "opportunity",
        displayLabel: "Riley Stone epoxy",
        email: null,
        phone: null,
        name: "Riley Stone",
        service: "Garage epoxy",
        locationText: "Industrial Way"
      }
    ],
    draft: {
      email: "",
      phone: ""
    }
  });

  assert.equal(result.recommendation, "review_possible_duplicate");
  assert.equal(result.matches[0]?.confidence, "medium");
  assert.ok(
    result.matches[0]?.reasonLabels.includes(
      "Service or location context overlaps"
    )
  );
});

void test("create opportunity duplicate preview handles empty or no-match input conservatively", () => {
  const insufficient = preview({
    candidates: [],
    draft: {
      contactName: "",
      email: "",
      phone: ""
    }
  });
  const noMatch = preview({
    candidates: [],
    draft: {
      contactName: "Riley Stone",
      email: "",
      phone: ""
    }
  });

  assert.equal(insufficient.recommendation, "insufficient_input");
  assert.equal(insufficient.matches.length, 0);
  assert.equal(noMatch.recommendation, "no_match_found");
  assert.equal(noMatch.matches.length, 0);
});

void test("create opportunity duplicate preview is surfaced as read-only UI", () => {
  assert.match(componentSource, /Possible duplicates/);
  assert.match(componentSource, /Read-only tenant check/);
  assert.match(
    componentSource,
    /does not merge, link, block, or\s+create anything/
  );
  assert.match(drawerSource, /duplicatePreview/);
  assert.match(componentSource, /Save confirmation draft/);
  assert.match(componentSource, />\s*Create opportunity\s*</);
  assert.doesNotMatch(componentSource, />\s*Execute now\s*</);
});

void test("create opportunity duplicate detection does not import mutation modules or providers", () => {
  const combinedSource = `${helperSource}\n${dataSource}\n${componentSource}`;

  assert.doesNotMatch(
    combinedSource,
    /from ["']@\/lib\/(opportunities\/actions|contacts\/actions|customers\/actions|projects\/actions|schedule\/actions|appointments\/actions|jobs\/actions|communications\/actions|invoices\/actions|contracts\/actions|payments\/actions)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    combinedSource,
    /\bquickCreateOpportunityAction\b|\bcreateOpportunityAction\b|\bupdateOpportunityAction\b|\bensureOpportunityEstimateFlow\b|\bcreateContact\b|\bcreateCustomer\b|\bcreateProject\b|\bcreateAppointment\b|\bscheduleAppointment\b|\bcreateInvoice\b|\bsendEmail\b|\bsendSms\b|\bexecuteGateKeeper\b|execution_validated/i
  );
});

void test("review approval remains separate from duplicate preview", () => {
  const approveReviewSource = actionsSource.slice(
    actionsSource.indexOf(
      "export async function approveGateKeeperSuggestionReviewAction"
    ),
    actionsSource.indexOf(
      "export async function rejectGateKeeperSuggestionAction"
    )
  );

  assert.match(actionsSource, /No action was executed/);
  assert.doesNotMatch(
    approveReviewSource,
    /createOpportunityDuplicate|getGateKeeperCreateOpportunityDuplicate|createOpportunityAction|executeGateKeeper/i
  );
});
