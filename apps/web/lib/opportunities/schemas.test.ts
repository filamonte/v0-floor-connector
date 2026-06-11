import assert from "node:assert/strict";
import test from "node:test";

import {
  formatOpportunityStatusLabel,
  opportunityInputSchema,
  opportunityQuickCreateInputSchema,
  opportunityStatusUpdateInputSchema
} from "./schemas";

const baseOpportunityInput = {
  title: "",
  status: "new",
  source: "",
  sourceDetail: "",
  serviceType: "",
  jobType: "Garage coating",
  siteName: "Main garage",
  contactName: "Jordan Customer",
  contactCompanyName: "",
  email: "customer@example.com",
  contactPhone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  countryCode: "US",
  siteAssessmentScheduledOn: "",
  siteAssessmentScheduledTime: "",
  siteAssessmentCompletedOn: "",
  requirementsSummary: "",
  notes: "",
  measurements: [],
  observations: [],
  attachments: []
};

void test("opportunity intake requires assessment date and time when status schedules assessment", () => {
  const result = opportunityInputSchema.safeParse({
    ...baseOpportunityInput,
    status: "site_assessment_scheduled",
    siteAssessmentScheduledOn: "2026-05-20",
    siteAssessmentScheduledTime: ""
  });

  assert.equal(result.success, false);
  assert.match(
    result.success ? "" : (result.error.issues[0]?.message ?? ""),
    /assessment time/i
  );
});

void test("opportunity intake accepts scheduled assessment date and time together", () => {
  const result = opportunityInputSchema.safeParse({
    ...baseOpportunityInput,
    status: "site_assessment_scheduled",
    siteAssessmentScheduledOn: "2026-05-20",
    siteAssessmentScheduledTime: "09:30"
  });

  assert.equal(result.success, true);
  assert.equal(
    result.success ? result.data.siteAssessmentScheduledTime : null,
    "09:30"
  );
});

void test("quick create lead intake requires assessment date and time when scheduled", () => {
  const result = opportunityQuickCreateInputSchema.safeParse({
    firstName: "Jordan",
    lastName: "Customer",
    addressLine1: "123 Main St",
    addressLine2: "",
    city: "Phoenix",
    stateRegion: "AZ",
    postalCode: "85001",
    countryCode: "US",
    phoneNumber: "555-0100",
    email: "customer@example.com",
    cellPhone: "555-0101",
    leadStage: "site_assessment_scheduled",
    companyName: "",
    source: "Website",
    sourceDetail: "",
    serviceType: "Epoxy Flooring",
    siteAssessmentScheduledOn: "2026-05-20",
    siteAssessmentScheduledTime: ""
  });

  assert.equal(result.success, false);
  assert.match(
    result.success ? "" : (result.error.issues[0]?.message ?? ""),
    /assessment time/i
  );
});

void test("opportunity status labels keep canonical values display-safe", () => {
  assert.equal(formatOpportunityStatusLabel("new"), "New intake");
  assert.equal(
    formatOpportunityStatusLabel("qualified"),
    "Qualified opportunity"
  );
  assert.equal(
    formatOpportunityStatusLabel("site_assessment_scheduled"),
    "Site visit scheduled"
  );
});

void test("opportunity status update accepts existing status values only", () => {
  const result = opportunityStatusUpdateInputSchema.safeParse({
    opportunityId: "b497db9d-9f4d-4cd0-ac72-43817cabb308",
    status: "proposal_sent",
    returnTo: "/leads/b497db9d-9f4d-4cd0-ac72-43817cabb308?view=overview"
  });

  assert.equal(result.success, true);
  assert.equal(result.success ? result.data.status : null, "proposal_sent");

  const invalidResult = opportunityStatusUpdateInputSchema.safeParse({
    opportunityId: "b497db9d-9f4d-4cd0-ac72-43817cabb308",
    status: "custom_status",
    returnTo: "/leads/b497db9d-9f4d-4cd0-ac72-43817cabb308"
  });

  assert.equal(invalidResult.success, false);
});
