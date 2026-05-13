import assert from "node:assert/strict";
import test from "node:test";

import { buildPortalInviteEmailContent } from "./email";

void test("portal invite email explains branded portal access and auth expectation", () => {
  const content = buildPortalInviteEmailContent({
    contractorCompanyName: "Filamonte Floors",
    contactName: "Jeff Filamonte",
    customerName: "Filamonte Residence",
    projectName: "Garage floor project",
    inviteUrl: "https://app.example.test/portal/invite?token=redacted"
  });

  assert.equal(content.subject, "You've been invited to view your project");
  assert.match(content.textBody, /Filamonte Floors invited you/);
  assert.match(content.textBody, /Garage floor project/);
  assert.match(content.textBody, /create an account or sign in/i);
  assert.match(content.textBody, /email address it was sent to/i);
  assert.match(content.textBody, /contracts, invoices, and payments/i);
});

void test("portal invite email escapes customer-visible html fields", () => {
  const content = buildPortalInviteEmailContent({
    contractorCompanyName: "A&B <Floors>",
    contactName: "Jeff <Owner>",
    customerName: "Residence & Shop",
    projectName: "Garage <Phase 1>",
    inviteUrl: "https://app.example.test/portal/invite?token=a&b"
  });

  assert.match(content.htmlBody, /A&amp;B &lt;Floors&gt;/);
  assert.match(content.htmlBody, /Jeff &lt;Owner&gt;/);
  assert.match(content.htmlBody, /Garage &lt;Phase 1&gt;/);
  assert.match(content.htmlBody, /token=a&amp;b/);
});
