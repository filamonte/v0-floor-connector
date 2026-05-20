import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const drawerSource = readFileSync(
  join(
    process.cwd(),
    "apps/web/components/gatekeeper-suggestion-detail-drawer.tsx"
  ),
  "utf8"
);
const pageSource = readFileSync(
  join(process.cwd(), "apps/web/app/(app)/gatekeeper/page.tsx"),
  "utf8"
);
const actionsSource = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/actions.ts"),
  "utf8"
);

void test("GateKeeper suggestion detail drawer exposes review detail context", () => {
  assert.match(drawerSource, /Review details/);
  assert.match(drawerSource, /GateKeeper suggestion detail/);
  assert.match(drawerSource, /Source rationale/);
  assert.match(drawerSource, /Future action preview/);
  assert.match(drawerSource, /Proposed payload/);
  assert.match(drawerSource, /canExecuteNow/);
  assert.match(drawerSource, /separate controlled confirmation/);
  assert.doesNotMatch(drawerSource, /Execution is not implemented/);
  assert.match(pageSource, /Execution result/);
  assert.match(drawerSource, /role="dialog"/);
  assert.match(pageSource, /GateKeeperSuggestionDetailDrawer/);
});

void test("GateKeeper suggestion detail drawer renders payload as safe text", () => {
  assert.match(drawerSource, /JSON\.stringify/);
  assert.match(drawerSource, /Display-only and untrusted/);
  assert.doesNotMatch(drawerSource, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(drawerSource, /innerHTML/);
});

void test("GateKeeper suggestion detail drawer reuses review-only actions", () => {
  assert.match(drawerSource, /approveGateKeeperSuggestionReviewAction/);
  assert.match(drawerSource, /rejectGateKeeperSuggestionAction/);
  assert.match(drawerSource, /dismissGateKeeperSuggestionAction/);
  assert.match(drawerSource, /Approve review/);
  assert.match(actionsSource, /No action was executed/);
  assert.doesNotMatch(actionsSource, /executeGateKeeper|execution_validated/i);
});

void test("GateKeeper suggestion detail drawer does not import mutation modules or providers", () => {
  assert.doesNotMatch(
    drawerSource,
    /from ["']@\/lib\/(opportunities|projects|schedule|jobs|work-items|communications|invoices|contracts)|from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(/i
  );
  assert.doesNotMatch(
    drawerSource,
    /quickCreateOpportunityAction|createOpportunityAction|updateOpportunityAction|createProject|createWorkItem|scheduleAppointment|createInvoice|sendEmail|sendSms|executeGateKeeper|execution_validated/i
  );
});
