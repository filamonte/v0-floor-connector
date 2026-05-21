import assert from "node:assert/strict";
import test from "node:test";

import {
  filterAppointmentReminderEmailRecipientsByPreference,
  getAppointmentReminderReadinessBlockers,
  isSuccessfulAppointmentReminderDeliveryStatus
} from "./appointment-reminder-core";
import { buildAppointmentReminderPreview } from "./appointment-reminder-preview";
import { communicationPreferenceInputSchema } from "./communication-preferences-schema";
import { buildCustomerAppointmentReminderPreferenceSummary } from "./customer-communication-preferences-core";

const baseRecipient = {
  key: "customer:customer@example.com",
  email: "customer@example.com",
  displayName: "Customer",
  source: "customer" as const,
  portalUserId: null,
  portalAccessGrantId: null,
  customerContactId: null,
  contactDisplayName: null,
  isPrimaryContact: false
};

void test("communication preference validation accepts customer and customer-contact appointment reminder preferences", () => {
  const customerPreference = communicationPreferenceInputSchema.parse({
    subjectType: "customer",
    subjectId: "11111111-1111-4111-8111-111111111111",
    channel: "email",
    messageCategory: "appointment_reminder",
    status: "allowed",
    source: "manual",
    reason: "Customer requested appointment reminder emails."
  });
  const customerContactPreference = communicationPreferenceInputSchema.parse({
    subjectType: "customer_contact",
    subjectId: "22222222-2222-4222-8222-222222222222",
    channel: "email",
    messageCategory: "appointment_reminder",
    status: "opted_out",
    source: "manual"
  });

  assert.equal(customerPreference.reason, "Customer requested appointment reminder emails.");
  assert.equal(customerContactPreference.reason, null);
});

void test("communication preference validation rejects unsupported status and category values", () => {
  assert.equal(
    communicationPreferenceInputSchema.safeParse({
      subjectType: "customer",
      subjectId: "11111111-1111-4111-8111-111111111111",
      channel: "email",
      messageCategory: "marketing",
      status: "allowed",
      source: "manual"
    }).success,
    false
  );
  assert.equal(
    communicationPreferenceInputSchema.safeParse({
      subjectType: "customer",
      subjectId: "11111111-1111-4111-8111-111111111111",
      channel: "email",
      messageCategory: "appointment_reminder",
      status: "paused",
      source: "manual"
    }).success,
    false
  );
});

void test("appointment reminder recipients default to allowed when no preference exists", () => {
  const recipients = filterAppointmentReminderEmailRecipientsByPreference({
    customerId: "customer-1",
    recipients: [baseRecipient],
    preferences: []
  });

  assert.equal(recipients.length, 1);
  assert.equal(recipients[0].email, "customer@example.com");
});

void test("appointment reminder recipients exclude opted-out and suppressed preferences", () => {
  const contactRecipient = {
    ...baseRecipient,
    key: "customer_contact:contact@example.com",
    email: "contact@example.com",
    source: "customer_contact" as const,
    customerContactId: "customer-contact-1"
  };

  assert.equal(
    filterAppointmentReminderEmailRecipientsByPreference({
      customerId: "customer-1",
      recipients: [baseRecipient, contactRecipient],
      preferences: [
        {
          subjectType: "customer_contact",
          subjectId: "customer-contact-1",
          status: "opted_out"
        }
      ]
    }).length,
    1
  );
  assert.equal(
    filterAppointmentReminderEmailRecipientsByPreference({
      customerId: "customer-1",
      recipients: [baseRecipient, contactRecipient],
      preferences: [
        {
          subjectType: "customer",
          subjectId: "customer-1",
          status: "suppressed"
        }
      ]
    }).length,
    0
  );
});

void test("customer appointment reminder preference summary shows missing rows as allowed by default", () => {
  const summary = buildCustomerAppointmentReminderPreferenceSummary({
    customer: {
      id: "customer-1",
      name: "Acme Customer",
      email: "customer@example.com"
    },
    contacts: [
      {
        id: "customer-contact-1",
        displayName: "Jordan Contact",
        email: "jordan@example.com",
        relationshipLabel: "site_contact",
        isPrimary: true
      }
    ],
    preferences: []
  });

  assert.equal(summary.length, 2);
  assert.equal(summary[0].status, "allowed_by_default");
  assert.equal(summary[1].status, "allowed_by_default");
});

void test("customer-contact suppressed preference blocks only that linked contact", () => {
  const firstContact = {
    ...baseRecipient,
    key: "customer_contact:first@example.com",
    email: "first@example.com",
    source: "customer_contact" as const,
    customerContactId: "customer-contact-1"
  };
  const secondContact = {
    ...baseRecipient,
    key: "customer_contact:second@example.com",
    email: "second@example.com",
    source: "customer_contact" as const,
    customerContactId: "customer-contact-2"
  };

  const recipients = filterAppointmentReminderEmailRecipientsByPreference({
    customerId: "customer-1",
    recipients: [firstContact, secondContact],
    preferences: [
      {
        subjectType: "customer_contact",
        subjectId: "customer-contact-1",
        status: "suppressed"
      }
    ]
  });

  assert.deepEqual(
    recipients.map((recipient) => recipient.email),
    ["second@example.com"]
  );
});

void test("appointment reminder readiness suppresses hidden and inactive appointment states", () => {
  assert.deepEqual(
    getAppointmentReminderReadinessBlockers({
      customerVisible: false,
      customerId: "customer-1",
      projectId: "project-1",
      startsAt: "2026-05-08T14:00:00.000Z",
      status: "scheduled",
      eligibleRecipientCount: 1
    }),
    ["Appointment must be marked customer-visible before reminders are prepared."]
  );
  assert.match(
    getAppointmentReminderReadinessBlockers({
      customerVisible: true,
      customerId: "customer-1",
      projectId: "project-1",
      startsAt: "2026-05-08T14:00:00.000Z",
      status: "no_show",
      eligibleRecipientCount: 1
    }).join(" "),
    /suppressed/
  );
});

void test("appointment reminder preview only includes customer-safe fields", () => {
  const preview = buildAppointmentReminderPreview({
    title: "Site assessment",
    appointmentType: "site_assessment",
    startsAt: "2026-05-08T14:00:00.000Z",
    endsAt: "2026-05-08T15:00:00.000Z",
    location: "Customer site",
    customerNotes: "Please meet us at the front office.",
    customerName: "Sam Customer",
    projectName: "Warehouse floor",
    organizationName: "FloorConnector QA"
  });

  assert.equal(preview.subject, "Appointment reminder: Site assessment");
  assert.match(preview.body, /Please meet us at the front office/);
  assert.doesNotMatch(preview.body, /internal/i);
  assert.doesNotMatch(preview.body, /legacy/i);
  assert.doesNotMatch(preview.body, /work item/i);
  assert.doesNotMatch(preview.body, /assignment/i);
});

void test("appointment reminder duplicate guard treats only successful delivery states as sent", () => {
  assert.equal(isSuccessfulAppointmentReminderDeliveryStatus("pending"), false);
  assert.equal(isSuccessfulAppointmentReminderDeliveryStatus("failed"), false);
  assert.equal(isSuccessfulAppointmentReminderDeliveryStatus("sent"), true);
  assert.equal(isSuccessfulAppointmentReminderDeliveryStatus("delivered"), true);
  assert.equal(isSuccessfulAppointmentReminderDeliveryStatus("opened"), true);
  assert.equal(isSuccessfulAppointmentReminderDeliveryStatus("clicked"), true);
});
