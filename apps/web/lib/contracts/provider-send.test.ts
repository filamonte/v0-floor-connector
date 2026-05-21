import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const source = readFileSync(path.join(__dirname, "data.ts"), "utf8");

function getFunctionSource(name: string) {
  const start = source.indexOf(`export async function ${name}`);

  assert.notEqual(start, -1, `${name} should exist`);

  const nextExport = source.indexOf("\nexport async function", start + 1);

  return source.slice(start, nextExport === -1 ? undefined : nextExport);
}

void test("contract provider send wraps existing signature send semantics", () => {
  const wrapper = getFunctionSource(
    "sendContractForSignatureWithProviderEmail"
  );

  assert.match(wrapper, /sendContractForSignature\(input\)/);
  assert.match(wrapper, /createNotificationEvent/);
  assert.match(wrapper, /createContractNotificationDelivery/);
  assert.match(wrapper, /sendPostmarkEmail/);
  assert.match(wrapper, /eventType: "send_requested"/);
  assert.match(wrapper, /eventType: "sent"/);
  assert.match(wrapper, /eventType: "failed"/);
});

void test("contract provider delivery does not become signature truth", () => {
  const wrapper = getFunctionSource(
    "sendContractForSignatureWithProviderEmail"
  );

  assert.doesNotMatch(wrapper, /signer_status:\s*"signed"/);
  assert.doesNotMatch(wrapper, /eventType:\s*"signer_signed"/);
  assert.doesNotMatch(wrapper, /\.from\("payment_events"\)/);
  assert.doesNotMatch(wrapper, /\.from\("payments"\)/);
  assert.match(wrapper, /signatureTruth: "contract_signature_events"/);
  assert.match(wrapper, /signatureMutation: false/);
  assert.match(wrapper, /statusMutation: false/);
});
