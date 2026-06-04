import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEstimateRoleSlotContext,
  buildInheritedProjectRoleSlots,
  buildRoleSlotDisplay,
  selectRoleSlotPersonOptions
} from "./read-model";
import {
  estimateRoleSlotsInputSchema,
  opportunityRoleSlotsInputSchema,
  projectRoleSlotsInputSchema
} from "./schemas";

const activeAssignablePeople = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    displayName: "Bailey Writer",
    isActive: true,
    isAssignable: true
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    displayName: "Alex Relationship",
    isActive: true,
    isAssignable: true
  }
];

void test("role slot display shows assigned owner names", () => {
  const display = buildRoleSlotDisplay({
    role: "estimate_writer",
    personId: "11111111-1111-4111-8111-111111111111",
    people: activeAssignablePeople
  });

  assert.equal(display.label, "Estimate Writer");
  assert.equal(display.personName, "Bailey Writer");
  assert.equal(display.displayText, "Bailey Writer");
});

void test("role slot display uses truthful missing assignment fallback", () => {
  const display = buildRoleSlotDisplay({
    role: "sales_credit_owner",
    personId: null,
    people: activeAssignablePeople
  });

  assert.equal(display.label, "Sales Credit Owner");
  assert.equal(display.personName, null);
  assert.equal(display.displayText, "Not assigned");
});

void test("role slot display does not invent a fake owner for unknown person ids", () => {
  const display = buildRoleSlotDisplay({
    role: "relationship_owner",
    personId: "33333333-3333-4333-8333-333333333333",
    people: activeAssignablePeople
  });

  assert.equal(display.personName, null);
  assert.equal(display.displayText, "Not captured yet");
});

void test("role slot candidates are active assignable people only", () => {
  const candidates = selectRoleSlotPersonOptions([
    ...activeAssignablePeople,
    {
      id: "33333333-3333-4333-8333-333333333333",
      displayName: "Inactive Person",
      isActive: false,
      isAssignable: true
    },
    {
      id: "44444444-4444-4444-8444-444444444444",
      displayName: "Not Assignable",
      isActive: true,
      isAssignable: false
    }
  ]);

  assert.deepEqual(
    candidates.map((candidate) => candidate.displayName),
    ["Alex Relationship", "Bailey Writer"]
  );
});

void test("project role slots inherit explicit opportunity roles only", () => {
  const inherited = buildInheritedProjectRoleSlots({
    opportunity: {
      onsiteRepPersonId: "11111111-1111-4111-8111-111111111111",
      relationshipOwnerPersonId: null
    }
  });

  assert.deepEqual(inherited, {
    onsiteRepPersonId: "11111111-1111-4111-8111-111111111111",
    relationshipOwnerPersonId: null
  });
});

void test("estimate role slot context keeps estimate writer separate from project owners", () => {
  const context = buildEstimateRoleSlotContext({
    estimate: {
      estimateWriterPersonId: "11111111-1111-4111-8111-111111111111"
    },
    project: {
      relationshipOwnerPersonId: "22222222-2222-4222-8222-222222222222",
      salesCreditOwnerPersonId: null
    }
  });

  assert.deepEqual(context, {
    estimateWriterPersonId: "11111111-1111-4111-8111-111111111111",
    relationshipOwnerPersonId: "22222222-2222-4222-8222-222222222222",
    salesCreditOwnerPersonId: null
  });
});

void test("role slot schemas normalize cleared selections to null", () => {
  const opportunityResult = opportunityRoleSlotsInputSchema.parse({
    opportunityId: "55555555-5555-4555-8555-555555555555",
    onsiteRepPersonId: "",
    relationshipOwnerPersonId: "11111111-1111-4111-8111-111111111111",
    returnTo: "/leads/55555555-5555-4555-8555-555555555555"
  });
  const projectResult = projectRoleSlotsInputSchema.parse({
    projectId: "66666666-6666-4666-8666-666666666666",
    onsiteRepPersonId: "",
    relationshipOwnerPersonId: "",
    followUpOwnerPersonId: "",
    salesCreditOwnerPersonId: "",
    returnTo: "/projects/66666666-6666-4666-8666-666666666666"
  });
  const estimateResult = estimateRoleSlotsInputSchema.parse({
    estimateId: "77777777-7777-4777-8777-777777777777",
    estimateWriterPersonId: "",
    returnTo: "/estimates/77777777-7777-4777-8777-777777777777"
  });

  assert.equal(opportunityResult.onsiteRepPersonId, null);
  assert.equal(
    opportunityResult.relationshipOwnerPersonId,
    "11111111-1111-4111-8111-111111111111"
  );
  assert.equal(projectResult.salesCreditOwnerPersonId, null);
  assert.equal(estimateResult.estimateWriterPersonId, null);
});
