const { expect } = require("@playwright/test");

const { loadRootEnv } = require("./auth-state");

async function loginWithEmail(page, email, password, options = {}) {
  const loginPath = options.next
    ? `/login?next=${encodeURIComponent(options.next)}`
    : "/login";
  const expectedPath = options.expectedPath ?? "/dashboard";

  await page.goto(loginPath);

  const emailLoginButton = page.getByRole("button", { name: "Sign in" });
  const emailLoginForm = page.locator("form").filter({ has: emailLoginButton });
  const emailInput = emailLoginForm.locator('input[name="email"]');
  const passwordInput = emailLoginForm.locator('input[name="password"]');

  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await emailLoginForm.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL((url) => url.pathname === expectedPath, {
    timeout: 180_000,
    waitUntil: "commit"
  });

  if (options.verifyContent !== false) {
    await expect(page.locator("body")).toContainText(
      /Dashboard|FloorConnector|Platform configuration|Global scope/i,
      { timeout: 60_000 }
    );
  }
}

module.exports = {
  loadRootEnv,
  loginWithEmail
};
