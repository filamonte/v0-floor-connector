const { expect } = require("@playwright/test");
const fsSync = require("node:fs");
const path = require("node:path");

function loadRootEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");

  if (!fsSync.existsSync(envPath)) {
    return;
  }

  const envText = fsSync.readFileSync(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);

    if (!match) {
      continue;
    }

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] ??= value;
  }
}

async function loginWithEmail(page, email, password) {
  await page.goto("/login");

  const emailLoginButton = page.getByRole("button", { name: "Log in with email" });
  const emailLoginForm = page.locator("form").filter({ has: emailLoginButton });
  const emailInput = emailLoginForm.locator('input[name="email"]');
  const passwordInput = emailLoginForm.locator('input[name="password"]');

  await expect(emailInput).toBeVisible();
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await emailLoginForm.getByRole("button", { name: "Log in with email" }).click();

  await page.waitForURL((url) => url.pathname === "/dashboard", { timeout: 30_000 });
  await expect(page.locator("body")).toContainText(/Dashboard|FloorConnector/i);
}

module.exports = {
  loadRootEnv,
  loginWithEmail
};
