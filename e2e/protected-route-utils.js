const { test } = require("@playwright/test");

async function requireAuthenticatedPage(page, route, label) {
  await page.goto(route, { waitUntil: "domcontentloaded" });

  if (new URL(page.url()).pathname.startsWith("/login")) {
    throw new Error(
      `${label} requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials and matching PLAYWRIGHT_BASE_URL.`
    );
  }
}

async function resolveFirstLinkedDetailPath(page, options) {
  const [detailPath] = await resolveLinkedDetailPaths(page, {
    ...options,
    limit: 1
  });

  return detailPath;
}

async function resolveLinkedDetailPaths(page, options) {
  const { listPath, hrefPrefix, label } = options;
  const limit = options.limit ?? 3;

  await requireAuthenticatedPage(page, listPath, label);

  const detailLinks = page.locator(`main a[href^="${hrefPrefix}"]`);
  const detailLinkCount = await detailLinks.count();

  test.skip(
    detailLinkCount === 0,
    `No ${label} detail links were available for protected route QA.`
  );

  const hrefs = [];

  for (let index = 0; index < detailLinkCount; index += 1) {
    const href = await detailLinks.nth(index).getAttribute("href");

    if (href && !hrefs.includes(href)) {
      hrefs.push(href);
    }
  }

  const validHrefs = [];

  for (const href of hrefs) {
    await page.goto(href, { waitUntil: "domcontentloaded", timeout: 90_000 });
    await page
      .waitForLoadState("networkidle", { timeout: 15_000 })
      .catch(() => {});
    await page.waitForTimeout(1_000);

    if (new URL(page.url()).pathname.startsWith("/login")) {
      throw new Error(
        `${label} requires authenticated storage state. Run pnpm e2e:auth with the configured contractor credentials and matching PLAYWRIGHT_BASE_URL.`
      );
    }

    const bodyText = await page
      .locator("body")
      .innerText({ timeout: 15_000 })
      .catch(() => "");

    if (
      !/Record not found|not available in your workspace|Customer not found/i.test(
        bodyText
      )
    ) {
      validHrefs.push(href);

      if (validHrefs.length >= limit) {
        return validHrefs;
      }
    }
  }

  if (validHrefs.length > 0) {
    return validHrefs;
  }

  test.skip(
    true,
    `No ${label} detail links from ${listPath} were valid for the active organization.`
  );

  throw new Error(
    `Unable to resolve a valid ${label} detail href from ${listPath}.`
  );
}

async function resolveProjectDetailPath(page) {
  const configuredPath = process.env.FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH;

  if (configuredPath) {
    return configuredPath;
  }

  return resolveFirstLinkedDetailPath(page, {
    listPath: "/projects",
    hrefPrefix: "/projects/",
    label: "Project detail smoke"
  });
}

module.exports = {
  requireAuthenticatedPage,
  resolveFirstLinkedDetailPath,
  resolveLinkedDetailPaths,
  resolveProjectDetailPath
};
