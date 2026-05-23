const { test, expect } = require("@playwright/test");

test("marketing page exposes login and early-access entry points", async ({
  page
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("link", { name: "Log in" }).first()
  ).toHaveAttribute("href", "/login");
  await expect(
    page.getByRole("link", { name: "Request access" }).first()
  ).toHaveAttribute("href", "/signup?next=%2Fsetup%2Fcompany");
});

test("public auth routes load with honest early-access copy", async ({
  page
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Welcome back" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Request early access" })
  ).toHaveAttribute("href", "/signup");

  await page.goto("/signup?next=/setup/company");
  await expect(
    page.getByRole("heading", { name: "Create your account" })
  ).toBeVisible();
  await expect(
    page.getByText("Founder early access stays operator-reviewed")
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Terms of Service" })
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveCount(
    0
  );
});

test("setup routes keep auth protection for anonymous public traffic", async ({
  page
}) => {
  for (const route of [
    "/setup/company",
    "/setup/billing",
    "/setup/pending-activation"
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("next")).toBeTruthy();
  }
});

test("mobile marketing page avoids horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "One connected operating system"
  );

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1
  );
  expect(overflow).toBe(false);
});
