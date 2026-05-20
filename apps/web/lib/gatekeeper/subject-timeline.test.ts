import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const memory = readFileSync(
  join(process.cwd(), "apps/web/lib/gatekeeper/memory.ts"),
  "utf8"
);
const panel = readFileSync(
  join(
    process.cwd(),
    "apps/web/components/gatekeeper-subject-memory-panel.tsx"
  ),
  "utf8"
);
const projectPage = readFileSync(
  join(process.cwd(), "apps/web/app/(app)/projects/[projectId]/page.tsx"),
  "utf8"
);
const customerPage = readFileSync(
  join(process.cwd(), "apps/web/app/(app)/customers/[customerId]/page.tsx"),
  "utf8"
);
const leadPage = readFileSync(
  join(process.cwd(), "apps/web/app/(app)/leads/[leadId]/page.tsx"),
  "utf8"
);

void test("GateKeeper subject memory loader is company and subject scoped", () => {
  assert.match(memory, /export async function getGateKeeperSubjectMemory/);
  assert.match(memory, /\.eq\("company_id", scope\.organizationId\)/);
  assert.match(memory, /\.eq\("subject_type", input\.subjectType\)/);
  assert.match(memory, /\.eq\("subject_id", input\.subjectId\)/);
  assert.match(memory, /subjectMemoryMessageSelect/);
  assert.match(memory, /subjectMemoryThreadSelect/);
  assert.match(memory, /subjectExecutionResultSelect/);
  assert.match(memory, /\.from\("gatekeeper_execution_attempts"\)/);
  assert.match(memory, /\.eq\("result_subject_type", input\.subjectType\)/);
  assert.match(memory, /\.eq\("result_subject_id", input\.subjectId\)/);
});

void test("GateKeeper subject memory panel shows read-only memory and internal note entry", () => {
  assert.match(panel, /GateKeeper Operational Memory/);
  assert.match(panel, /This panel is read-only/);
  assert.match(panel, /Internal GateKeeper note/);
  assert.match(panel, /Add memory note/);
  assert.match(panel, /Execution results/);
  assert.match(panel, /Created by GateKeeper controlled execution/);
  assert.match(panel, /createGateKeeperInternalNoteAction/);
  assert.match(panel, /Approval\s+is review state only/);
  assert.match(panel, /href="\/gatekeeper/);
  assert.doesNotMatch(
    panel,
    /reviewGateKeeper|sendEmail|sendSms|scheduleAppointment|createOpportunity|createProject|createWorkItem/i
  );
});

void test("GateKeeper subject memory appears on canonical project customer and opportunity workspaces", () => {
  assert.match(projectPage, /GateKeeperSubjectMemoryPanel/);
  assert.match(projectPage, /subjectType: "project"/);
  assert.match(customerPage, /GateKeeperSubjectMemoryPanel/);
  assert.match(customerPage, /subjectType: "customer"/);
  assert.match(leadPage, /GateKeeperSubjectMemoryPanel/);
  assert.match(leadPage, /subjectType: "opportunity"/);
});

void test("GateKeeper subject timeline code does not add providers or execution paths", () => {
  const combined = [memory, panel, projectPage, customerPage, leadPage].join(
    "\n"
  );

  assert.doesNotMatch(
    combined,
    /from ["']twilio|from ["']@telnyx|from ["']openai|from ["']@sendgrid|from ["']postmark|fetch\(|retell|vapi/i
  );
  assert.doesNotMatch(
    panel,
    /createOpportunity|updateOpportunity|createProject|scheduleAppointment|createInvoice|sendEmail|sendSms/i
  );
});
