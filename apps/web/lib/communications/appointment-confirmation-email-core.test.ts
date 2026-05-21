import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAppointmentConfirmationEmailContent,
  dedupeAppointmentConfirmationEmailRecipients,
  normalizeEmail,
  selectAppointmentConfirmationEmailRecipient
} from "./appointment-confirmation-email-core";

void test("appointment confirmation email recipients keep valid customer/contact emails and remove duplicates", () => {
  const recipients = dedupeAppointmentConfirmationEmailRecipients([
    {
      email: " CUSTOMER@Example.com ",
      displayName: "Customer",
      source: "customer",
      portalUserId: null,
      portalAccessGrantId: null,
      customerContactId: null,
      contactDisplayName: null,
      isPrimaryContact: false
    },
    {
      email: "customer@example.com",
      displayName: "Duplicate",
      source: "customer_contact",
      portalUserId: null,
      portalAccessGrantId: null,
      customerContactId: "contact-1",
      contactDisplayName: "Duplicate",
      isPrimaryContact: true
    },
    {
      email: "not-an-email",
      displayName: "Invalid",
      source: "customer_contact",
      portalUserId: null,
      portalAccessGrantId: null,
      customerContactId: "contact-2",
      contactDisplayName: "Invalid",
      isPrimaryContact: false
    }
  ]);

  assert.equal(recipients.length, 1);
  assert.equal(recipients[0].email, "customer@example.com");
  assert.equal(normalizeEmail("bad"), null);
});

void test("appointment confirmation recipient selection rejects unrelated email", () => {
  const recipients = dedupeAppointmentConfirmationEmailRecipients([
    {
      email: "portal@example.com",
      displayName: "Portal Contact",
      source: "portal_access",
      portalUserId: "portal-user-id",
      portalAccessGrantId: "grant-id",
      customerContactId: "customer-contact-id",
      contactDisplayName: "Portal Contact",
      isPrimaryContact: true
    }
  ]);

  assert.equal(
    selectAppointmentConfirmationEmailRecipient({ recipients }).email,
    "portal@example.com"
  );
  assert.throws(
    () =>
      selectAppointmentConfirmationEmailRecipient({
        recipients,
        selectedEmail: "stranger@example.com"
      }),
    /belongs to this appointment customer\/project context/
  );
});

void test("appointment confirmation email content escapes html and preserves text body", () => {
  const content = buildAppointmentConfirmationEmailContent({
    subject: " Appointment confirmation ",
    body: "Hi Sam,\nBring <nothing internal> & check in."
  });

  assert.equal(content.subject, "Appointment confirmation");
  assert.equal(content.textBody, "Hi Sam,\nBring <nothing internal> & check in.");
  assert.match(content.htmlBody, /Bring &lt;nothing internal&gt; &amp; check in\./);
});
