import assert from "node:assert/strict";
import test from "node:test";

import {
  isPortalWarrantyDocumentStatusVisible,
  resolvePortalWarrantySignerState,
  shouldMarkWarrantyDocumentSigned
} from "./warranty-documents";

void test("portal warranty visibility exposes issued customer-safe documents only", () => {
  assert.equal(isPortalWarrantyDocumentStatusVisible("issued"), true);
  assert.equal(isPortalWarrantyDocumentStatusVisible("signed"), true);
  assert.equal(isPortalWarrantyDocumentStatusVisible("draft"), false);
  assert.equal(isPortalWarrantyDocumentStatusVisible("void"), false);
});

void test("portal warranty signer state requires customer email match for actions", () => {
  const state = resolvePortalWarrantySignerState(
    [
      {
        signerRole: "customer",
        signerEmail: "owner@example.com",
        status: "requested"
      },
      {
        signerRole: "customer",
        signerEmail: "other@example.com",
        status: "requested"
      }
    ],
    "OWNER@example.com"
  );

  assert.equal(state.currentUserSignerStatus, "requested");
  assert.equal(state.currentUserCanAct, true);
  assert.equal(state.matchingCustomerSigners.length, 1);
});

void test("portal warranty signing completes only after all active customer signers sign", () => {
  assert.equal(
    shouldMarkWarrantyDocumentSigned([
      {
        signerRole: "customer",
        signerEmail: "one@example.com",
        status: "signed"
      },
      {
        signerRole: "customer",
        signerEmail: "two@example.com",
        status: "requested"
      }
    ]),
    false
  );

  assert.equal(
    shouldMarkWarrantyDocumentSigned([
      {
        signerRole: "customer",
        signerEmail: "one@example.com",
        status: "signed"
      },
      {
        signerRole: "customer",
        signerEmail: "two@example.com",
        status: "signed"
      },
      {
        signerRole: "customer",
        signerEmail: "old@example.com",
        status: "voided"
      }
    ]),
    true
  );
});
