import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readSource(...segments: string[]) {
  return readFileSync(path.join(__dirname, "..", ...segments), "utf8");
}

function getFunctionSource(source: string, name: string) {
  const start = source.indexOf(`export async function ${name}`);

  assert.notEqual(start, -1, `${name} should exist`);

  const nextExport = source.indexOf("\nexport async function", start + 1);

  return source.slice(start, nextExport === -1 ? undefined : nextExport);
}

function assertProviderDeliveryLadder(source: string) {
  assert.match(source, /createNotificationEvent/);
  assert.match(source, /create[A-Za-z]+NotificationDelivery/);
  assert.match(source, /sendPostmarkEmail/);
  assert.match(source, /eventType: "send_requested"/);
  assert.match(source, /eventType: "sent"/);
  assert.match(source, /eventType: "failed"/);
}

void test("provider document sends share the canonical delivery evidence ladder", () => {
  const warrantySend = getFunctionSource(
    readSource("warranty-documents", "data.ts"),
    "sendWarrantyDocumentReviewEmail"
  );
  const estimateSend = getFunctionSource(
    readSource("estimates", "data.ts"),
    "sendEstimateToCustomer"
  );
  const invoiceSend = getFunctionSource(
    readSource("invoices", "data.ts"),
    "sendInvoiceReviewEmail"
  );
  const contractSend = getFunctionSource(
    readSource("contracts", "data.ts"),
    "sendContractForSignatureWithProviderEmail"
  );

  for (const sendSource of [
    warrantySend,
    estimateSend,
    invoiceSend,
    contractSend
  ]) {
    assertProviderDeliveryLadder(sendSource);
    assert.match(sendSource, /provider: "postmark"/);
    assert.match(sendSource, /source: "contractor_app_provider_send"/);
    assert.match(sendSource, /evidenceOnly: true/);
  }
});

void test("provider delivery does not become approval, payment, or signature truth", () => {
  const warrantySend = getFunctionSource(
    readSource("warranty-documents", "data.ts"),
    "sendWarrantyDocumentReviewEmail"
  );
  const estimateSend = getFunctionSource(
    readSource("estimates", "data.ts"),
    "sendEstimateToCustomer"
  );
  const invoiceSend = getFunctionSource(
    readSource("invoices", "data.ts"),
    "sendInvoiceReviewEmail"
  );
  const contractSend = getFunctionSource(
    readSource("contracts", "data.ts"),
    "sendContractForSignatureWithProviderEmail"
  );

  assert.match(warrantySend, /signatureMutation: false/);
  assert.match(warrantySend, /documentStatusMutation: false/);
  assert.doesNotMatch(warrantySend, /eventType:\s*"signed"/);
  assert.doesNotMatch(warrantySend, /status:\s*"signed"/);

  assert.match(estimateSend, /approvalMutation: false/);
  assert.doesNotMatch(estimateSend, /status:\s*"approved"/);
  assert.doesNotMatch(estimateSend, /\.from\("payments"\)/);
  assert.doesNotMatch(estimateSend, /\.from\("payment_events"\)/);

  assert.match(invoiceSend, /checkoutStarted: false/);
  assert.match(invoiceSend, /paymentMutation: false/);
  assert.match(invoiceSend, /paymentEventMutation: false/);
  assert.doesNotMatch(invoiceSend, /\.from\("payments"\)\s*\.insert/);
  assert.doesNotMatch(invoiceSend, /\.from\("payment_events"\)\s*\.insert/);

  assert.match(contractSend, /signatureTruth: "contract_signature_events"/);
  assert.match(contractSend, /signatureMutation: false/);
  assert.doesNotMatch(contractSend, /eventType:\s*"signer_signed"/);
  assert.doesNotMatch(contractSend, /signer_status:\s*"signed"/);
  assert.doesNotMatch(contractSend, /\.from\("payments"\)/);
  assert.doesNotMatch(contractSend, /\.from\("payment_events"\)/);
});
