const { test, expect } = require("@playwright/test");

test("marketing page exposes login and early-access entry points", async ({
  page
}) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Log in" }).first()).toHaveAttribute(
    "href",
    "/login"
  );
  await expect(
    page.getByRole("link", { name: "Start early access" }).first()
  ).toHaveAttribute("href", "/signup?next=%2Fsetup%2Fcompany");
});
