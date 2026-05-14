import assert from "node:assert/strict";
import test from "node:test";

import {
  opportunityInputSchema,
  opportunityQuickCreateInputSchema
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
    result.success ? "" : result.error.issues[0]?.message ?? "",
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
    result.success ? "" : result.error.issues[0]?.message ?? "",
    /assessment time/i
  );
});
