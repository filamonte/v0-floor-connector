import assert from "node:assert/strict";
import test from "node:test";

import { normalizeWebsiteUrl, organizationProfileInputSchema } from "./schemas";

const validProfileInput = {
  legalName: "Example Flooring LLC",
  displayName: "Example Flooring",
  logoUrl: "",
  phone: "",
  email: "",
  websiteUrl: "",
  primaryTrade: "",
  brandAccentColor: "",
  timeZone: "",
  slug: "example-flooring"
};

void test("normalizeWebsiteUrl converts bare public domains to usable https URLs", () => {
  assert.equal(normalizeWebsiteUrl("example.com"), "https://www.example.com/");
  assert.equal(
    normalizeWebsiteUrl("example.com/services"),
    "https://www.example.com/services"
  );
});

void test("normalizeWebsiteUrl preserves explicit protocols and local development hosts", () => {
  assert.equal(
    normalizeWebsiteUrl("https://floorconnector.com"),
    "https://floorconnector.com"
  );
  assert.equal(normalizeWebsiteUrl("localhost:3000"), "https://localhost:3000");
});

void test("organization profile parsing stores normalized website URL", () => {
  const result = organizationProfileInputSchema.parse({
    ...validProfileInput,
    websiteUrl: "example.com"
  });

  assert.equal(result.websiteUrl, "https://www.example.com/");
});
