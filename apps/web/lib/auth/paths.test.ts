import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInternalRedirectPath,
  getSafeInternalRedirectPath,
  isPortalAuthPath,
  sanitizeRedirectPath
} from "./paths";

void test("safe auth next paths allow internal portal invite returns", () => {
  const next = "/portal/invite?token=redacted";

  assert.equal(getSafeInternalRedirectPath(next), next);
  assert.equal(sanitizeRedirectPath(next), next);
});

void test("safe auth next paths reject external redirects", () => {
  assert.equal(getSafeInternalRedirectPath("https://example.test"), null);
  assert.equal(getSafeInternalRedirectPath("//example.test/path"), null);
  assert.equal(sanitizeRedirectPath("https://example.test"), "/dashboard");
});

void test("auth redirects append status params without dropping existing query", () => {
  assert.equal(
    buildInternalRedirectPath("/portal/invite?token=redacted", {
      message: "Password updated."
    }),
    "/portal/invite?token=redacted&message=Password+updated."
  );
});

void test("portal auth paths are recognized for customer-only auth redirects", () => {
  assert.equal(isPortalAuthPath("/portal"), true);
  assert.equal(isPortalAuthPath("/portal/invite?token=redacted"), true);
  assert.equal(isPortalAuthPath("/dashboard"), false);
  assert.equal(isPortalAuthPath("//example.test/portal"), false);
});
