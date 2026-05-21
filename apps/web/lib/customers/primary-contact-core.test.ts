import assert from "node:assert/strict";
import test from "node:test";

import {
  ensurePrimaryCustomerContactWithRepository,
  type PrimaryCustomerContactRepository
} from "./primary-contact-core";

function createRepository(overrides: Partial<PrimaryCustomerContactRepository> = {}) {
  const calls: Array<{ kind: string; payload: unknown }> = [];
  const repository: PrimaryCustomerContactRepository = {
    findCustomerContactByEmail(input) {
      calls.push({ kind: "findCustomerContactByEmail", payload: input });
      return Promise.resolve(null);
    },
    findOrganizationContactByEmail(input) {
      calls.push({ kind: "findOrganizationContactByEmail", payload: input });
      return Promise.resolve(null);
    },
    createContact(input) {
      calls.push({ kind: "createContact", payload: input });
      return Promise.resolve({
        contactId: "contact-created",
        displayName: input.displayName,
        companyName: input.companyName,
        email: input.email,
        phone: input.phone
      });
    },
    upsertCustomerContactLink(input) {
      calls.push({ kind: "upsertCustomerContactLink", payload: input });
      return Promise.resolve({
        id: "customer-contact-linked",
        isPrimary: input.isPrimary
      });
    },
    ...overrides
  };

  return { calls, repository };
}

void test("skips when no usable person details were captured", async () => {
  const { calls, repository } = createRepository();

  const result = await ensurePrimaryCustomerContactWithRepository(
    {
      organizationId: "org-1",
      userId: "user-1",
      customerId: "customer-1",
      source: "customer_create"
    },
    repository
  );

  assert.deepEqual(result, {
    outcome: "skipped",
    reason: "missing_person_details"
  });
  assert.deepEqual(calls, []);
});

void test("links a known intake contact as the customer primary contact", async () => {
  const { calls, repository } = createRepository();

  const result = await ensurePrimaryCustomerContactWithRepository(
    {
      organizationId: "org-1",
      userId: "user-1",
      customerId: "customer-1",
      contactId: "contact-from-lead",
      name: "Jane Customer",
      email: "Jane@Example.com",
      source: "opportunity_conversion"
    },
    repository
  );

  assert.equal(result.outcome, "linked");
  assert.equal(result.contactId, "contact-from-lead");
  assert.equal(result.customerContactId, "customer-contact-linked");
  assert.deepEqual(calls, [
    {
      kind: "upsertCustomerContactLink",
      payload: {
        organizationId: "org-1",
        userId: "user-1",
        customerId: "customer-1",
        contactId: "contact-from-lead",
        relationshipLabel: "primary_opportunity_contact",
        isPrimary: true
      }
    }
  ]);
});

void test("reuses an existing customer-contact link by email", async () => {
  const { calls, repository } = createRepository({
    findCustomerContactByEmail(input) {
      calls.push({ kind: "findCustomerContactByEmail", payload: input });
      return Promise.resolve({
        contactId: "contact-existing",
        customerContactId: "customer-contact-existing",
        displayName: "Jane Customer",
        companyName: null,
        email: "jane@example.com",
        phone: null,
        isPrimary: false
      });
    }
  });

  const result = await ensurePrimaryCustomerContactWithRepository(
    {
      organizationId: "org-1",
      userId: "user-1",
      customerId: "customer-1",
      name: "Jane Customer",
      email: "Jane@Example.com",
      source: "customer_create"
    },
    repository
  );

  assert.equal(result.outcome, "existing");
  assert.equal(result.contactId, "contact-existing");
  assert.equal(result.customerContactId, "customer-contact-linked");
  assert.deepEqual(calls.map((call) => call.kind), [
    "findCustomerContactByEmail",
    "upsertCustomerContactLink"
  ]);
});

void test("creates and links a new primary customer contact from customer fields", async () => {
  const { calls, repository } = createRepository();

  const result = await ensurePrimaryCustomerContactWithRepository(
    {
      organizationId: "org-1",
      userId: "user-1",
      customerId: "customer-1",
      name: "Jane Customer",
      companyName: "Acme Property Group",
      email: "Jane@Example.com",
      phone: "555-555-1212",
      source: "customer_create"
    },
    repository
  );

  assert.equal(result.outcome, "created");
  assert.equal(result.contactId, "contact-created");
  assert.equal(result.customerContactId, "customer-contact-linked");
  assert.deepEqual(calls, [
    {
      kind: "findCustomerContactByEmail",
      payload: {
        organizationId: "org-1",
        customerId: "customer-1",
        email: "jane@example.com"
      }
    },
    {
      kind: "findOrganizationContactByEmail",
      payload: {
        organizationId: "org-1",
        email: "jane@example.com"
      }
    },
    {
      kind: "createContact",
      payload: {
        organizationId: "org-1",
        userId: "user-1",
        displayName: "Jane Customer",
        companyName: "Acme Property Group",
        email: "jane@example.com",
        phone: "555-555-1212",
        notes: null
      }
    },
    {
      kind: "upsertCustomerContactLink",
      payload: {
        organizationId: "org-1",
        userId: "user-1",
        customerId: "customer-1",
        contactId: "contact-created",
        relationshipLabel: "primary_customer_contact",
        isPrimary: true
      }
    }
  ]);
});
