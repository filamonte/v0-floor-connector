import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildCompanyDocumentBackHref,
  buildCompanyDocumentPrintHref,
  buildDocumentBackHref,
  buildDocumentEngineBrand,
  buildDocumentPrintHref,
  buildProjectCloseoutPackagePrintHref,
  getCompanyDocumentExportNotice,
  getCompanyDocumentFooterNote,
  getDocumentEngineExportNotice,
  getDocumentEngineFooterNote,
  getProjectCloseoutPackageExportNotice,
  getProjectCloseoutPackageFooterNote
} from "./print";

void test("builds contractor and portal print links without route branching in pages", () => {
  assert.equal(
    buildDocumentPrintHref({ subjectType: "estimate", subjectId: "est_123" }),
    "/estimates/est_123/pdf"
  );
  assert.equal(
    buildDocumentPrintHref({
      subjectType: "invoice",
      subjectId: "inv_123",
      audience: "portal"
    }),
    "/portal/invoices/inv_123/pdf"
  );
  assert.equal(
    buildDocumentBackHref({
      subjectType: "contract",
      subjectId: "con_123",
      audience: "portal"
    }),
    "/portal/contracts/con_123"
  );
});

void test("maps organization branding without requiring a document subsystem", () => {
  assert.deepEqual(
    buildDocumentEngineBrand({
      organization: {
        displayName: "Acme Floors",
        logoUrl: "https://example.test/logo.png",
        phone: "555-0100",
        email: "office@example.test",
        websiteUrl: "https://example.test",
        brandAccentColor: "#c65f2a"
      }
    }),
    {
      name: "Acme Floors",
      logoUrl: "https://example.test/logo.png",
      phone: "555-0100",
      email: "office@example.test",
      websiteUrl: "https://example.test",
      accentColor: "#c65f2a"
    }
  );
  assert.equal(buildDocumentEngineBrand(null).name, "FloorConnector");
});

void test("export copy keeps print separate from delivery and workflow state", () => {
  assert.match(getDocumentEngineExportNotice("invoice"), /does not send/i);
  assert.match(getDocumentEngineExportNotice("invoice"), /payment/i);
  assert.match(getDocumentEngineFooterNote("contract"), /not delivery proof/i);
  assert.match(
    getDocumentEngineFooterNote("estimate"),
    /does not create a separate document record/i
  );
});

void test("builds project closeout package print links and preserves export boundary", () => {
  assert.equal(
    buildProjectCloseoutPackagePrintHref("project_123"),
    "/projects/project_123/closeout-package/pdf"
  );
  assert.match(getProjectCloseoutPackageExportNotice(), /does not send/i);
  assert.match(
    getProjectCloseoutPackageExportNotice(),
    /create delivery proof/i
  );
  assert.match(getProjectCloseoutPackageFooterNote(), /not a stored PDF/i);
});

void test("builds company document print links without mutation semantics", () => {
  assert.equal(
    buildCompanyDocumentPrintHref("document_123"),
    "/settings/company-documents/document_123/pdf"
  );
  assert.equal(
    buildCompanyDocumentBackHref("document_123"),
    "/settings/company-documents/document_123"
  );
  assert.match(getCompanyDocumentExportNotice(), /does not send/i);
  assert.match(getCompanyDocumentExportNotice(), /change document status/i);
  assert.match(
    getCompanyDocumentFooterNote(),
    /does not provide legal advice/i
  );
  assert.match(getCompanyDocumentFooterNote(), /not a stored PDF/i);
});
