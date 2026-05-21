const { test, expect } = require("@playwright/test");

const draftEstimatePath =
  process.env.FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_PATH ??
  (process.env.FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID
    ? `/estimates/${process.env.FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID}/edit`
    : "");

const groupACatalogItem = process.env.FLOORCONNECTOR_E2E_GROUP_A_CATALOG_ITEM ?? "";
const groupBCatalogItem = process.env.FLOORCONNECTOR_E2E_GROUP_B_CATALOG_ITEM ?? "";
const globalCatalogItem = process.env.FLOORCONNECTOR_E2E_GLOBAL_CATALOG_ITEM ?? "";

function safeGroupName(label) {
  return `${label} ${Date.now()}`;
}

async function assertAuthenticatedEstimateEditor(page) {
  await page.goto(draftEstimatePath);
  await page.waitForLoadState("domcontentloaded");

  if (page.url().includes("/login")) {
    throw new Error(
      "Estimate e2e requires authenticated storage state. Run `pnpm e2e:auth` with FLOORCONNECTOR_E2E_EMAIL and FLOORCONNECTOR_E2E_PASSWORD, or set PLAYWRIGHT_STORAGE_STATE to an existing saved state."
    );
  }

  await expect(page.getByTestId("estimate-add-group")).toBeVisible();
}

async function addGroup(page, label) {
  const beforeCount = await page.getByTestId("estimate-item-group").count();
  await page.getByTestId("estimate-add-group").click();
  await expect(page.getByTestId("estimate-item-group")).toHaveCount(beforeCount + 1);

  const group = page.getByTestId("estimate-item-group").nth(beforeCount);
  await group.getByTestId("estimate-group-name-input").fill(label);
  await expect(group.getByTestId("estimate-group-name-input")).toHaveValue(label);
  return group;
}

async function addCatalogItemToGroup(page, group, catalogItemName) {
  await group.getByTestId("estimate-group-add-item").click();
  await expect(page.getByTestId("estimate-add-item-tools")).toHaveAttribute("open", "");

  await page.getByTestId("estimate-catalog-search").fill(catalogItemName);
  const quickAdd = page
    .getByTestId("estimate-catalog-quick-add")
    .filter({ hasText: catalogItemName })
    .first();

  await expect(quickAdd).toBeVisible();
  await quickAdd.click();

  await expect(
    group.getByTestId("estimate-line-item-row").filter({ hasText: catalogItemName }).last()
  ).toBeVisible();
}

async function addCatalogItemWithoutGroup(page, catalogItemName) {
  await page.getByTestId("estimate-add-item-tools-summary").click();
  await expect(page.getByTestId("estimate-add-item-tools")).toHaveAttribute("open", "");

  await page.getByTestId("estimate-catalog-search").fill(catalogItemName);
  const quickAdd = page
    .getByTestId("estimate-catalog-quick-add")
    .filter({ hasText: catalogItemName })
    .first();

  await expect(quickAdd).toBeVisible();
  await quickAdd.click();

  const ungrouped = page
    .getByTestId("estimate-item-group")
    .filter({ has: page.getByTestId("estimate-group-name").filter({ hasText: "Ungrouped Items" }) })
    .first();

  await expect(
    ungrouped.getByTestId("estimate-line-item-row").filter({ hasText: catalogItemName }).last()
  ).toBeVisible();
}

test.describe("estimate editor group-targeted catalog insertion", () => {
  test.skip(!draftEstimatePath, "Set FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID or FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_PATH.");
  test.skip(!groupACatalogItem || !groupBCatalogItem, "Set FLOORCONNECTOR_E2E_GROUP_A_CATALOG_ITEM and FLOORCONNECTOR_E2E_GROUP_B_CATALOG_ITEM.");

  test("adds active catalog items into the selected estimate groups", async ({ page }) => {
    await assertAuthenticatedEstimateEditor(page);

    const groupAName = safeGroupName("E2E Group A");
    const groupBName = safeGroupName("E2E Group B");

    const groupA = await addGroup(page, groupAName);
    const groupB = await addGroup(page, groupBName);

    await addCatalogItemToGroup(page, groupA, groupACatalogItem);
    await addCatalogItemToGroup(page, groupB, groupBCatalogItem);

    const renamedGroupA = `${groupAName} Renamed`;
    await groupA.getByTestId("estimate-group-name-input").fill(renamedGroupA);
    await expect(groupA.getByTestId("estimate-group-name-input")).toHaveValue(renamedGroupA);
    await expect(
      groupA.getByTestId("estimate-line-item-row").filter({ hasText: groupACatalogItem }).last()
    ).toBeVisible();
  });

  test("keeps global catalog insertion available without selected group", async ({ page }) => {
    test.skip(!globalCatalogItem, "Set FLOORCONNECTOR_E2E_GLOBAL_CATALOG_ITEM to run global fallback insertion.");

    await assertAuthenticatedEstimateEditor(page);
    await addCatalogItemWithoutGroup(page, globalCatalogItem);
  });
});
