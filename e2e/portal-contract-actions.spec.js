const { expect, test } = require("@playwright/test");
const { createClient } = require("@supabase/supabase-js");
const fs = require("node:fs");
const path = require("node:path");

const { loadRootEnv, loginWithEmail } = require("./auth-utils");

const disposableTitles = {
  sign: "E2E Disposable Contract Sign",
  decline: "E2E Disposable Contract Decline",
  signed: "E2E Disposable Contract Already Signed",
  unauthorized: "E2E Disposable Contract Unauthorized Project"
};

function getPortalAuthStatePath() {
  return path.resolve(
    process.env.PLAYWRIGHT_PORTAL_STORAGE_STATE ??
      "playwright/.auth/portal-user.json"
  );
}

function getRequiredEnv(names) {
  loadRootEnv();
  const missing = names.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    return {
      missing,
      values: null
    };
  }

  return {
    missing: [],
    values: Object.fromEntries(names.map((name) => [name, process.env[name].trim()]))
  };
}

function createAdminClient(env) {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function newPortalPage(browser, baseURL) {
  loadRootEnv();
  const storageStatePath = getPortalAuthStatePath();
  const hasStorageState = fs.existsSync(storageStatePath);
  const hasCredentials = Boolean(
    process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL &&
      process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD
  );

  test.skip(
    !hasStorageState && !hasCredentials,
    "Portal contract action smoke requires portal storage state or real portal E2E credentials."
  );

  const context = await browser.newContext({
    baseURL,
    storageState: hasStorageState ? storageStatePath : undefined
  });
  const page = await context.newPage();

  if (!hasStorageState) {
    await loginWithEmail(
      page,
      process.env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
      process.env.FLOORCONNECTOR_PORTAL_E2E_PASSWORD,
      {
        next: "/portal",
        expectedPath: "/portal",
        verifyContent: false
      }
    );
  }

  return { page, context };
}

async function closePortalContext(context) {
  try {
    await context.close();
  } catch {
    // Playwright can fail trace artifact cleanup after interrupted local runs.
  }
}

async function findSingleBy(supabase, table, select, filters) {
  let query = supabase.from(table).select(select);

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const response = await query
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (response.error) {
    throw new Error(`Unable to load ${table}: ${response.error.message}`);
  }

  return response.data;
}

async function getFixtureContext(supabase, env) {
  const userResponse = await supabase
    .from("users")
    .select("id, email")
    .eq("email", env.FLOORCONNECTOR_E2E_EMAIL)
    .maybeSingle();

  if (userResponse.error || !userResponse.data) {
    throw new Error(
      `Unable to load contractor E2E user: ${
        userResponse.error?.message ?? "No canonical user found."
      }`
    );
  }

  const membershipResponse = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", userResponse.data.id)
    .eq("membership_status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipResponse.error || !membershipResponse.data) {
    throw new Error(
      `Unable to load contractor E2E organization: ${
        membershipResponse.error?.message ?? "No active membership found."
      }`
    );
  }

  const organizationId = membershipResponse.data.company_id;
  const customer = await findSingleBy(supabase, "customers", "id", [
    { column: "company_id", value: organizationId },
    { column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }
  ]);
  const portalUser = await findSingleBy(supabase, "users", "id, full_name, email", [
    { column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }
  ]);
  const contact = await findSingleBy(supabase, "contacts", "id, display_name, email", [
    { column: "company_id", value: organizationId },
    { column: "email", value: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL }
  ]);
  const customerContact = customer?.id && contact?.id
    ? await findSingleBy(supabase, "customer_contacts", "id", [
        { column: "company_id", value: organizationId },
        { column: "customer_id", value: customer.id },
        { column: "contact_id", value: contact.id }
      ])
    : null;
  const grantedProject = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Golden Path" }
  ]);
  const unauthorizedProject = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: organizationId },
    { column: "name", value: "[E2E] Portal Unauthorized Boundary" }
  ]);
  const estimate = await findSingleBy(supabase, "estimates", "id", [
    { column: "company_id", value: organizationId },
    { column: "project_id", value: grantedProject?.id },
    { column: "title", value: "E2E Portal Estimate Review" }
  ]);

  if (
    !customer?.id ||
    !portalUser?.id ||
    !contact?.id ||
    !customerContact?.id ||
    !grantedProject?.id ||
    !unauthorizedProject?.id
  ) {
    throw new Error(
      "Portal contract action fixtures require the canonical portal user, customer, contact, customer-contact, and projects."
    );
  }

  const grantsResponse = await supabase
    .from("portal_access_grants")
    .select("id")
    .eq("company_id", organizationId)
    .eq("customer_id", customer.id)
    .eq("user_id", portalUser.id);

  if (grantsResponse.error) {
    throw new Error(`Unable to load portal access grants: ${grantsResponse.error.message}`);
  }

  const grantIds = ((grantsResponse.data ?? []).map((grant) => grant.id)).filter(Boolean);

  if (grantIds.length === 0) {
    throw new Error("Portal contract action fixtures require an active portal access grant.");
  }

  await ensureContractSignaturePermission(supabase, {
    organizationId,
    userId: userResponse.data.id,
    customerContactId: customerContact.id,
    grantIds
  });

  return {
    organizationId,
    userId: userResponse.data.id,
    customerId: customer.id,
    portalUserId: portalUser.id,
    portalUserName:
      contact.display_name ??
      portalUser.full_name ??
      env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
    portalEmail: env.FLOORCONNECTOR_PORTAL_E2E_EMAIL,
    grantedProjectId: grantedProject.id,
    unauthorizedProjectId: unauthorizedProject.id,
    estimateId: estimate?.id ?? null
  };
}

async function ensureContractSignaturePermission(supabase, input) {
  const grantResponse = await supabase
    .from("portal_access_grants")
    .update({
      status: "active",
      customer_contact_id: input.customerContactId,
      revoked_at: null
    })
    .eq("company_id", input.organizationId)
    .in("id", input.grantIds);

  if (grantResponse.error) {
    throw new Error(`Unable to repair portal access grant: ${grantResponse.error.message}`);
  }

  const existing = await findSingleBy(
    supabase,
    "customer_contact_portal_permissions",
    "id",
    [
      { column: "company_id", value: input.organizationId },
      { column: "customer_contact_id", value: input.customerContactId }
    ]
  );
  const payload = {
    portal_access_grant_id: input.grantIds[0],
    can_view_estimates: true,
    can_approve_estimates: true,
    can_sign_contracts: true,
    can_approve_change_orders: true,
    can_view_pay_invoices: true,
    can_request_quotes: true,
    management_source: "contractor_admin",
    last_managed_by_user_id: input.userId,
    last_override_by_user_id: input.userId
  };

  if (existing?.id) {
    const response = await supabase
      .from("customer_contact_portal_permissions")
      .update(payload)
      .eq("company_id", input.organizationId)
      .eq("id", existing.id);

    if (response.error) {
      throw new Error(`Unable to repair portal permissions: ${response.error.message}`);
    }

    return;
  }

  const response = await supabase.from("customer_contact_portal_permissions").insert({
    company_id: input.organizationId,
    customer_contact_id: input.customerContactId,
    ...payload
  });

  if (response.error) {
    throw new Error(`Unable to create portal permissions: ${response.error.message}`);
  }
}

function contractStateForStatus(status) {
  const now = new Date().toISOString();

  if (status === "signed") {
    return {
      status: "signed",
      sent_at: now,
      viewed_at: now,
      customer_viewed_at: now,
      customer_signed_at: now,
      signed_at: now,
      contractor_countersigned_at: null,
      signature_declined_at: null,
      signature_voided_at: null,
      signature_started_at: now,
      signature_readiness_status: "signed",
      locked_at: now,
      edit_lock_reason: "signature_activity_started"
    };
  }

  if (status === "declined") {
    return {
      status: "viewed",
      sent_at: now,
      viewed_at: now,
      customer_viewed_at: now,
      customer_signed_at: null,
      signed_at: null,
      contractor_countersigned_at: null,
      signature_declined_at: now,
      signature_voided_at: null,
      signature_started_at: now,
      signature_readiness_status: "out_for_signature",
      locked_at: now,
      edit_lock_reason: "signature_activity_started"
    };
  }

  return {
    status: "sent",
    sent_at: now,
    viewed_at: null,
    customer_viewed_at: null,
    customer_signed_at: null,
    signed_at: null,
    contractor_countersigned_at: null,
    signature_declined_at: null,
    signature_voided_at: null,
    signature_started_at: now,
    signature_readiness_status: "out_for_signature",
    locked_at: now,
    edit_lock_reason: "signature_activity_started"
  };
}

function signerStateForStatus(status) {
  const now = new Date().toISOString();

  if (status === "signed") {
    return {
      signer_status: "signed",
      viewed_at: now,
      signed_at: now,
      declined_at: null,
      decline_reason: null
    };
  }

  if (status === "declined") {
    return {
      signer_status: "declined",
      viewed_at: now,
      signed_at: null,
      declined_at: now,
      decline_reason: "Reset-safe disposable decline state."
    };
  }

  return {
    signer_status: "pending",
    viewed_at: null,
    signed_at: null,
    declined_at: null,
    decline_reason: null
  };
}

async function ensureDisposableContract(supabase, context, input) {
  const projectId =
    input.projectScope === "unauthorized"
      ? context.unauthorizedProjectId
      : context.grantedProjectId;
  const existing = await findSingleBy(supabase, "contracts", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "project_id", value: projectId },
    { column: "title", value: input.title }
  ]);
  const contractState = contractStateForStatus(input.status);
  const basePayload = {
    company_id: context.organizationId,
    customer_id: context.customerId,
    project_id: projectId,
    estimate_id: input.projectScope === "unauthorized" ? null : context.estimateId,
    title: input.title,
    rendered_subject: input.title,
    rendered_content:
      "<p>Disposable portal contract action E2E fixture. This contract exists only to verify customer signature decisions.</p>",
    generated_from_estimate_reference: "E2E disposable",
    internal_approval_status: "approved",
    internal_approved_at: new Date().toISOString(),
    updated_by: context.userId,
    ...contractState
  };

  let contractId;

  if (existing?.id) {
    const response = await supabase
      .from("contracts")
      .update(basePayload)
      .eq("company_id", context.organizationId)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (response.error) {
      throw new Error(`Unable to reset disposable contract: ${response.error.message}`);
    }

    contractId = response.data.id;
  } else {
    const response = await supabase
      .from("contracts")
      .insert({
        ...basePayload,
        created_by: context.userId
      })
      .select("id")
      .single();

    if (response.error) {
      throw new Error(`Unable to create disposable contract: ${response.error.message}`);
    }

    contractId = response.data.id;
  }

  const signerId = await ensureDisposableContractSigner(
    supabase,
    context,
    contractId,
    input.status
  );

  return { contractId, signerId };
}

async function ensureDisposableContractSigner(supabase, context, contractId, status) {
  const existing = await findSingleBy(supabase, "contract_signers", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "contract_id", value: contractId },
    { column: "signer_role", value: "customer" },
    { column: "signer_order", value: 1 }
  ]);
  const payload = {
    signer_role: "customer",
    customer_id: context.customerId,
    portal_user_id: context.portalUserId,
    organization_user_id: null,
    display_name: context.portalUserName,
    email: context.portalEmail,
    signer_order: 1,
    ...signerStateForStatus(status)
  };

  if (existing?.id) {
    const response = await supabase
      .from("contract_signers")
      .update(payload)
      .eq("company_id", context.organizationId)
      .eq("id", existing.id)
      .select("id")
      .single();

    if (response.error) {
      throw new Error(`Unable to reset disposable contract signer: ${response.error.message}`);
    }

    return response.data.id;
  }

  const response = await supabase
    .from("contract_signers")
    .insert({
      company_id: context.organizationId,
      contract_id: contractId,
      ...payload
    })
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to create disposable contract signer: ${response.error.message}`);
  }

  return response.data.id;
}

async function resetDisposableToSent(supabase, context, contractId, signerId) {
  const contractResponse = await supabase
    .from("contracts")
    .update({
      ...contractStateForStatus("sent"),
      updated_by: context.userId
    })
    .eq("company_id", context.organizationId)
    .eq("id", contractId);

  if (contractResponse.error) {
    throw new Error(`Unable to reset disposable contract: ${contractResponse.error.message}`);
  }

  const signerResponse = await supabase
    .from("contract_signers")
    .update(signerStateForStatus("sent"))
    .eq("company_id", context.organizationId)
    .eq("id", signerId);

  if (signerResponse.error) {
    throw new Error(`Unable to reset disposable contract signer: ${signerResponse.error.message}`);
  }
}

async function loadContract(supabase, organizationId, contractId) {
  const response = await supabase
    .from("contracts")
    .select(
      "id, status, sent_at, viewed_at, customer_viewed_at, customer_signed_at, contractor_countersigned_at, signature_declined_at, signature_voided_at, signed_at, signature_readiness_status"
    )
    .eq("company_id", organizationId)
    .eq("id", contractId)
    .single();

  if (response.error) {
    throw new Error(`Unable to load disposable contract: ${response.error.message}`);
  }

  return response.data;
}

async function loadSigner(supabase, organizationId, signerId) {
  const response = await supabase
    .from("contract_signers")
    .select("id, signer_status, viewed_at, signed_at, declined_at, decline_reason")
    .eq("company_id", organizationId)
    .eq("id", signerId)
    .single();

  if (response.error) {
    throw new Error(`Unable to load disposable contract signer: ${response.error.message}`);
  }

  return response.data;
}

async function countSignatureEvents(supabase, organizationId, contractId, eventType) {
  const response = await supabase
    .from("contract_signature_events")
    .select("id", { count: "exact", head: true })
    .eq("company_id", organizationId)
    .eq("contract_id", contractId)
    .eq("event_type", eventType);

  if (response.error) {
    throw new Error(`Unable to count contract signature events: ${response.error.message}`);
  }

  return response.count ?? 0;
}

test.describe("portal contract signature actions", () => {
  let env;
  let supabase;
  let fixtureContext;

  test.beforeAll(async () => {
    const required = getRequiredEnv([
      "NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "FLOORCONNECTOR_E2E_EMAIL",
      "FLOORCONNECTOR_PORTAL_E2E_EMAIL"
    ]);

    test.skip(
      required.missing.length > 0,
      `Portal contract action tests require env vars: ${required.missing.join(", ")}.`
    );

    env = required.values;
    supabase = createAdminClient(env);
    fixtureContext = await getFixtureContext(supabase, env);
  });

  test("portal customer can sign a disposable sent contract", async ({
    browser,
    baseURL
  }) => {
    const { contractId, signerId } = await ensureDisposableContract(
      supabase,
      fixtureContext,
      {
        title: disposableTitles.sign,
        status: "sent",
        projectScope: "granted"
      }
    );
    const signedEventCountBefore = await countSignatureEvents(
      supabase,
      fixtureContext.organizationId,
      contractId,
      "signer_signed"
    );
    const completedEventCountBefore = await countSignatureEvents(
      supabase,
      fixtureContext.organizationId,
      contractId,
      "signature_completed"
    );
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/contracts/${contractId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.sign })).toBeVisible();

      await page.getByRole("button", { name: /sign contract/i }).click();

      await expect(page.getByText(new RegExp(`${disposableTitles.sign} was signed`, "i"))).toBeVisible();
      await expect(page.getByText(/Your customer signature has already been recorded/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign contract/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /decline contract/i })).toHaveCount(0);

      const contract = await loadContract(
        supabase,
        fixtureContext.organizationId,
        contractId
      );
      const signer = await loadSigner(supabase, fixtureContext.organizationId, signerId);
      const signedEventCountAfter = await countSignatureEvents(
        supabase,
        fixtureContext.organizationId,
        contractId,
        "signer_signed"
      );
      const completedEventCountAfter = await countSignatureEvents(
        supabase,
        fixtureContext.organizationId,
        contractId,
        "signature_completed"
      );

      expect(contract.status).toBe("signed");
      expect(contract.customer_signed_at).toBeTruthy();
      expect(contract.signed_at).toBeTruthy();
      expect(contract.customer_viewed_at).toBeTruthy();
      expect(contract.signature_readiness_status).toBe("signed");
      expect(signer.signer_status).toBe("signed");
      expect(signer.signed_at).toBeTruthy();
      expect(signer.declined_at).toBeNull();
      expect(signedEventCountAfter).toBeGreaterThan(signedEventCountBefore);
      expect(completedEventCountAfter).toBeGreaterThan(completedEventCountBefore);
    } finally {
      await resetDisposableToSent(supabase, fixtureContext, contractId, signerId);
      await closePortalContext(context);
    }
  });

  test("portal customer can decline a disposable sent contract", async ({
    browser,
    baseURL
  }) => {
    const { contractId, signerId } = await ensureDisposableContract(
      supabase,
      fixtureContext,
      {
        title: disposableTitles.decline,
        status: "sent",
        projectScope: "granted"
      }
    );
    const declinedEventCountBefore = await countSignatureEvents(
      supabase,
      fixtureContext.organizationId,
      contractId,
      "signer_declined"
    );
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/contracts/${contractId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.decline })).toBeVisible();

      await page.getByLabel(/optional decline note/i).fill(
        "Declined by reset-safe portal contract E2E."
      );
      await page.getByRole("button", { name: /decline contract/i }).click();

      await expect(page.getByText(new RegExp(`${disposableTitles.decline} was declined`, "i"))).toBeVisible();
      await expect(page.getByText(/A decline was already recorded/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign contract/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /decline contract/i })).toHaveCount(0);

      const contract = await loadContract(
        supabase,
        fixtureContext.organizationId,
        contractId
      );
      const signer = await loadSigner(supabase, fixtureContext.organizationId, signerId);
      const declinedEventCountAfter = await countSignatureEvents(
        supabase,
        fixtureContext.organizationId,
        contractId,
        "signer_declined"
      );

      expect(contract.status).toBe("viewed");
      expect(contract.signature_declined_at).toBeTruthy();
      expect(contract.customer_signed_at).toBeNull();
      expect(contract.signed_at).toBeNull();
      expect(contract.signature_readiness_status).toBe("out_for_signature");
      expect(signer.signer_status).toBe("declined");
      expect(signer.declined_at).toBeTruthy();
      expect(signer.decline_reason).toContain("Declined by reset-safe");
      expect(declinedEventCountAfter).toBeGreaterThan(declinedEventCountBefore);
    } finally {
      await resetDisposableToSent(supabase, fixtureContext, contractId, signerId);
      await closePortalContext(context);
    }
  });

  test("already-signed disposable contract does not expose signature actions", async ({
    browser,
    baseURL
  }) => {
    const { contractId, signerId } = await ensureDisposableContract(
      supabase,
      fixtureContext,
      {
        title: disposableTitles.signed,
        status: "signed",
        projectScope: "granted"
      }
    );
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      await page.goto(`/portal/contracts/${contractId}`);
      await expect(page.getByRole("heading", { name: disposableTitles.signed })).toBeVisible();
      await expect(page.getByText(/Your customer signature has already been recorded/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign contract/i })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /decline contract/i })).toHaveCount(0);

      const contract = await loadContract(
        supabase,
        fixtureContext.organizationId,
        contractId
      );
      const signer = await loadSigner(supabase, fixtureContext.organizationId, signerId);

      expect(contract.status).toBe("signed");
      expect(signer.signer_status).toBe("signed");
      expect(signer.declined_at).toBeNull();
    } finally {
      await resetDisposableToSent(supabase, fixtureContext, contractId, signerId);
      await closePortalContext(context);
    }
  });

  test("portal customer cannot open a contract outside granted project access", async ({
    browser,
    baseURL
  }) => {
    const { contractId, signerId } = await ensureDisposableContract(
      supabase,
      fixtureContext,
      {
        title: disposableTitles.unauthorized,
        status: "sent",
        projectScope: "unauthorized"
      }
    );
    const { page, context } = await newPortalPage(browser, baseURL);

    try {
      const response = await page.goto(`/portal/contracts/${contractId}`);

      await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
      expect([200, 404]).toContain(response?.status());
      await expect(page.locator("body")).toContainText(
        /404|not found|could not be found/i
      );
    } finally {
      await resetDisposableToSent(supabase, fixtureContext, contractId, signerId);
      await closePortalContext(context);
    }
  });
});
