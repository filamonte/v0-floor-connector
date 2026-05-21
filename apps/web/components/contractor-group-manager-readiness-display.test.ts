import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const componentSource = readFileSync(
  new URL("./contractor-group-manager.tsx", import.meta.url),
  "utf8"
);

void test("contractor group manager renders read-only proposal readiness fields", () => {
  assert.match(componentSource, /function ProposalReadinessDetails/);
  assert.match(componentSource, /proposal\.readinessLabel/);
  assert.match(componentSource, /proposal\.readinessExplanation/);
  assert.match(componentSource, /proposal\.reasonCode/);
  assert.match(componentSource, /proposal\.evidenceItems/);
  assert.match(componentSource, /proposal\.caveatItems/);
  assert.match(componentSource, /proposal\.futureApplyPreview\.summary/);
  assert.match(componentSource, /proposal\.starterPackImpactPreview/);
  assert.match(componentSource, /No runtime effect/);
  assert.match(componentSource, /Current action available: no/);
  assert.match(componentSource, /server-side proposal\s+recomputation/);
});

void test("eligible proposal rows render exactly one manual assignment form path", () => {
  assert.match(componentSource, /function isProposalEligibleForManualAssignment/);
  assert.match(componentSource, /proposal\.status === "proposed"/);
  assert.match(
    componentSource,
    /proposal\.manualReviewReadiness === "ready_for_review"/
  );
  assert.match(componentSource, /proposal\.confidence === "high"/);
  assert.match(componentSource, /proposal\.confidence === "medium"/);
  assert.match(componentSource, /proposal\.assignmentApplied === false/);
  assert.match(componentSource, /proposal\.runtimeEffect === "none"/);
  assert.match(componentSource, /proposal\.contractorGroupStatus === "active"/);
  assert.match(
    componentSource,
    /proposal\.contractorGroupType !== "future_plan"/
  );
  assert.match(
    componentSource,
    /proposal\.contractorGroupType !== "future_entitlement"/
  );
  assert.equal(
    componentSource.match(
      /data-testid="contractor-group-proposal-manual-assignment-form"/g
    )?.length,
    1
  );
});

void test("manual assignment form includes phrase reason and stale-detection fingerprint fields", () => {
  assert.match(
    componentSource,
    /action=\{applyContractorGroupProposalManualAssignmentAction\}/
  );
  assert.match(componentSource, /name="operatorReason"[\s\S]{0,180}required/);
  assert.match(componentSource, /name="confirmationPhrase"[\s\S]{0,180}required/);
  assert.match(componentSource, /pattern="ASSIGN GROUP MANUALLY"/);
  assert.match(componentSource, /name="organizationId"/);
  assert.match(componentSource, /name="contractorGroupId"/);
  assert.match(componentSource, /name="submittedProposal"/);
  for (const field of [
    "proposalId",
    "organizationId",
    "contractorGroupId",
    "contractorGroupKey",
    "contractorGroupType",
    "contractorGroupStatus",
    "status",
    "confidence",
    "source",
    "reasonCode",
    "manualReviewReadiness"
  ]) {
    assert.match(componentSource, new RegExp(`${field}: proposal\\.`));
  }
});

void test("manual assignment copy states the narrow write and no runtime behavior", () => {
  assert.match(
    componentSource,
    /This writes one contractor group membership and one audit event only/
  );
  assert.match(
    componentSource,
    /No entitlement effect, provisioning effect, pricing\/package effect,\s+contractor permission effect, starter-pack behavior, or runtime\s+behavior changes/
  );
  assert.match(
    componentSource,
    /The server recomputes readiness before writing and may reject stale\s+proposals/
  );
  assert.match(
    componentSource,
    /Starter-pack impact remains read-only targeting context/
  );
});

void test("contractor group manager does not add forbidden mutation controls", () => {
  assert.doesNotMatch(
    componentSource,
    /<button[\s\S]{0,160}(Apply all|Auto assign|Approve|Dismiss|Provision)/i
  );
  assert.doesNotMatch(componentSource, /Apply all/i);
  assert.doesNotMatch(componentSource, /Auto assign/i);
  assert.doesNotMatch(componentSource, />\s*Approve\s*</i);
  assert.doesNotMatch(componentSource, />\s*Dismiss\s*</i);
  assert.doesNotMatch(componentSource, /bulk action/i);
  assert.doesNotMatch(componentSource, /runtime controls/i);
});
