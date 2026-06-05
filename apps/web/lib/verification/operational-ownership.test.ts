import assert from "node:assert/strict";
import test from "node:test";

import {
  getOperationalOwnershipForbiddenResponsibilities,
  getOperationalOwnershipRequiredResponsibilities,
  operationalOwnershipSurfaceOrder,
  verifyOperationalOwnership
} from "./operational-ownership";

const canonicalLifecycle = [
  "opportunity",
  "customer",
  "project",
  "estimate",
  "contract",
  "change_order",
  "job",
  "invoice",
  "payment"
];

void test("operational ownership verification passes when every surface proves its bounded job", () => {
  const summary = verifyOperationalOwnership({
    canonicalLifecycle,
    evidence: operationalOwnershipSurfaceOrder.map((surface) => ({
      surface,
      status: "verified",
      evidence: [`${surface} verification evidence`],
      verifiedResponsibilities:
        getOperationalOwnershipRequiredResponsibilities(surface),
      forbiddenResponsibilitiesAbsent:
        getOperationalOwnershipForbiddenResponsibilities(surface)
    }))
  });

  assert.equal(summary.confidence, "high");
  assert.equal(summary.findings.length, 0);
  assert.equal(summary.surfaceStatus.dashboard, "verified");
  assert.equal(summary.surfaceStatus.project_workspace, "verified");
  assert.equal(summary.surfaceStatus.owning_workspace, "verified");
  assert.equal(summary.surfaceStatus.settings, "verified");
  assert.equal(summary.surfaceStatus.super_admin, "verified");
  assert.equal(summary.surfaceStatus.portal, "verified");
});

void test("operational ownership verification blocks dashboard and portal source-of-truth drift", () => {
  const summary = verifyOperationalOwnership({
    canonicalLifecycle,
    evidence: operationalOwnershipSurfaceOrder.map((surface) => ({
      surface,
      status: "verified",
      evidence: [`${surface} verification evidence`],
      verifiedResponsibilities:
        getOperationalOwnershipRequiredResponsibilities(surface),
      forbiddenResponsibilitiesAbsent:
        surface === "dashboard" || surface === "portal"
          ? []
          : getOperationalOwnershipForbiddenResponsibilities(surface)
    }))
  });

  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "dashboard:forbidden-responsibility"
    )
  );
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "portal:forbidden-responsibility"
    )
  );
});

void test("operational ownership verification lowers confidence for partial settings proof", () => {
  const summary = verifyOperationalOwnership({
    canonicalLifecycle,
    evidence: operationalOwnershipSurfaceOrder.map((surface) => ({
      surface,
      status: surface === "settings" ? "partial" : "verified",
      evidence: [`${surface} verification evidence`],
      verifiedResponsibilities:
        getOperationalOwnershipRequiredResponsibilities(surface),
      forbiddenResponsibilitiesAbsent:
        getOperationalOwnershipForbiddenResponsibilities(surface)
    }))
  });

  assert.equal(summary.confidence, "medium");
  assert.ok(
    summary.findings.some((finding) => finding.id === "settings:partial")
  );
  assert.ok(
    summary.missingOrBlocked.some((item) => item.surface === "settings")
  );
});

void test("operational ownership verification rejects canonical lifecycle drift", () => {
  const summary = verifyOperationalOwnership({
    canonicalLifecycle: canonicalLifecycle.filter(
      (stage) => stage !== "change_order"
    ),
    evidence: operationalOwnershipSurfaceOrder.map((surface) => ({
      surface,
      status: "verified",
      evidence: [`${surface} verification evidence`],
      verifiedResponsibilities:
        getOperationalOwnershipRequiredResponsibilities(surface),
      forbiddenResponsibilitiesAbsent:
        getOperationalOwnershipForbiddenResponsibilities(surface)
    }))
  });

  assert.equal(summary.confidence, "low");
  assert.ok(
    summary.findings.some(
      (finding) => finding.id === "canonical-lifecycle:order"
    )
  );
});
