import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCustomerPortalAccessSummary,
  selectRecommendedPortalContact
} from "./customer-access-summary";

const contacts = [
  {
    id: "contact-secondary",
    isPrimary: false,
    contact: {
      displayName: "Secondary Contact",
      email: "secondary@example.com"
    }
  },
  {
    id: "contact-primary",
    isPrimary: true,
    contact: {
      displayName: "Primary Contact",
      email: "primary@example.com"
    }
  }
];

void test("recommended portal contact prefers the primary customer contact with email", () => {
  const recommended = selectRecommendedPortalContact(contacts);

  assert.equal(recommended?.id, "contact-primary");
  assert.equal(recommended?.email, "primary@example.com");
  assert.equal(recommended?.label, "Primary Contact");
});

void test("recommended portal contact reports email-blocked state when no contact can receive invite", () => {
  const recommended = selectRecommendedPortalContact([
    {
      id: "contact-without-email",
      isPrimary: true,
      contact: {
        displayName: "No Email",
        email: null
      }
    }
  ]);

  assert.equal(recommended, null);
});

void test("customer portal access summary separates invite, active, revoked, and shared project state", () => {
  const summary = buildCustomerPortalAccessSummary({
    contacts,
    grants: [
      {
        id: "grant-pending",
        customerContactId: "contact-primary",
        status: "invited",
        invitedEmail: "primary@example.com",
        userId: null
      },
      {
        id: "grant-active",
        customerContactId: "contact-secondary",
        status: "active",
        invitedEmail: "secondary@example.com",
        userId: "user-secondary"
      },
      {
        id: "grant-revoked",
        customerContactId: null,
        status: "revoked",
        invitedEmail: "old@example.com",
        userId: null
      }
    ],
    projectAccessByGrantId: new Map([
      ["grant-active", [{ status: "active" }, { status: "revoked" }]]
    ])
  });

  assert.equal(summary.recommendedContact?.id, "contact-primary");
  assert.equal(summary.statusLabel, "Active access");
  assert.equal(summary.statusDescription, "1 active portal contact, 1 pending invite, 1 revoked grant");
  assert.equal(summary.activeGrantCount, 1);
  assert.equal(summary.invitedGrantCount, 1);
  assert.equal(summary.revokedGrantCount, 1);
  assert.equal(summary.activeSharedProjectCount, 1);
});
