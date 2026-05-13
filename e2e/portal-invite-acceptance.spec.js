const { expect, test } = require("@playwright/test");
const { createHash, randomBytes } = require("node:crypto");
const { createClient } = require("@supabase/supabase-js");

const { loadRootEnv } = require("./auth-utils");

const inviteEmail =
  process.env.FLOORCONNECTOR_PORTAL_INVITE_UX_EMAIL ??
  "portal.invite.local@floorconnector.test";
const fixture = {
  customerName: "E2E Portal Invite UX Customer",
  customerCompanyName: "FloorConnector Portal Invite UX",
  contactName: "E2E Portal Invite Contact",
  projectName: "[E2E] Portal Invite UX Project"
};

function createAdminClient() {
  loadRootEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

function hashPortalInviteToken(token) {
  return createHash("sha256").update(token).digest("hex");
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

async function insertAndReturnId(supabase, table, payload, label) {
  const response = await supabase
    .from(table)
    .insert(payload)
    .select("id")
    .single();

  if (response.error) {
    throw new Error(`Unable to create ${label}: ${response.error.message}`);
  }

  return response.data.id;
}

async function getContractorContext(supabase) {
  const contractorEmail = process.env.FLOORCONNECTOR_E2E_EMAIL;

  if (!contractorEmail) {
    return null;
  }

  const userResponse = await supabase
    .from("users")
    .select("id")
    .eq("email", contractorEmail)
    .maybeSingle();

  if (userResponse.error) {
    throw new Error(
      `Unable to load contractor E2E user profile: ${userResponse.error.message}`
    );
  }

  if (!userResponse.data) {
    return null;
  }

  const membershipResponse = await supabase
    .from("company_memberships")
    .select("company_id")
    .eq("user_id", userResponse.data.id)
    .eq("membership_status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipResponse.error) {
    throw new Error(
      `Unable to load contractor E2E organization membership: ${membershipResponse.error.message}`
    );
  }

  if (!membershipResponse.data) {
    return null;
  }

  return {
    userId: userResponse.data.id,
    organizationId: membershipResponse.data.company_id
  };
}

async function ensureCustomer(supabase, context) {
  const existing = await findSingleBy(supabase, "customers", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "email", value: inviteEmail }
  ]);

  if (existing) {
    return existing.id;
  }

  return insertAndReturnId(
    supabase,
    "customers",
    {
      company_id: context.organizationId,
      name: fixture.customerName,
      company_name: fixture.customerCompanyName,
      email: inviteEmail,
      phone: "555-0140",
      address_line_1: "140 Portal Invite Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      notes: "Stable local portal invite UX fixture.",
      created_by: context.userId,
      updated_by: context.userId
    },
    "portal invite UX customer"
  );
}

async function ensureContact(supabase, context) {
  const existing = await findSingleBy(supabase, "contacts", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "email", value: inviteEmail }
  ]);

  if (existing) {
    return existing.id;
  }

  return insertAndReturnId(
    supabase,
    "contacts",
    {
      company_id: context.organizationId,
      display_name: fixture.contactName,
      company_name: fixture.customerCompanyName,
      email: inviteEmail,
      phone: "555-0140",
      contact_kind: "portal_contact",
      notes: "Stable local portal invite UX contact fixture.",
      created_by: context.userId,
      updated_by: context.userId
    },
    "portal invite UX contact"
  );
}

async function ensureCustomerContact(supabase, context, customerId, contactId) {
  const existing = await findSingleBy(supabase, "customer_contacts", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "customer_id", value: customerId },
    { column: "contact_id", value: contactId }
  ]);

  if (existing) {
    return existing.id;
  }

  return insertAndReturnId(
    supabase,
    "customer_contacts",
    {
      company_id: context.organizationId,
      customer_id: customerId,
      contact_id: contactId,
      relationship_label: "Portal invite UX contact",
      is_primary: false,
      created_by: context.userId,
      updated_by: context.userId
    },
    "portal invite UX customer-contact relationship"
  );
}

async function ensureProject(supabase, context, customerId) {
  const existing = await findSingleBy(supabase, "projects", "id", [
    { column: "company_id", value: context.organizationId },
    { column: "customer_id", value: customerId },
    { column: "name", value: fixture.projectName }
  ]);

  if (existing) {
    return existing.id;
  }

  return insertAndReturnId(
    supabase,
    "projects",
    {
      company_id: context.organizationId,
      customer_id: customerId,
      name: fixture.projectName,
      status: "approved",
      description: "Stable local portal invite UX project fixture.",
      address_line_1: "140 Portal Invite Way",
      city: "Fixture City",
      state_region: "FL",
      postal_code: "00000",
      country_code: "US",
      commercial_readiness_status: "ready_to_schedule",
      financing_status: "not_applicable",
      created_by: context.userId,
      updated_by: context.userId
    },
    "portal invite UX project"
  );
}

async function preparePendingInviteFixture() {
  const supabase = createAdminClient();

  if (!supabase || process.env.FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE !== "1") {
    return null;
  }

  const context = await getContractorContext(supabase);

  if (!context) {
    return null;
  }

  const customerId = await ensureCustomer(supabase, context);
  const contactId = await ensureContact(supabase, context);
  const customerContactId = await ensureCustomerContact(
    supabase,
    context,
    customerId,
    contactId
  );
  const projectId = await ensureProject(supabase, context, customerId);
  const existingActiveGrant = await findSingleBy(
    supabase,
    "portal_access_grants",
    "id",
    [
      { column: "company_id", value: context.organizationId },
      { column: "customer_id", value: customerId },
      { column: "invited_email", value: inviteEmail },
      { column: "status", value: "active" }
    ]
  );

  if (existingActiveGrant) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const existingGrant = await findSingleBy(
    supabase,
    "portal_access_grants",
    "id",
    [
      { column: "company_id", value: context.organizationId },
      { column: "customer_id", value: customerId },
      { column: "invited_email", value: inviteEmail },
      { column: "status", value: "invited" }
    ]
  );
  const grantId = existingGrant
    ? existingGrant.id
    : await insertAndReturnId(
        supabase,
        "portal_access_grants",
        {
          company_id: context.organizationId,
          customer_id: customerId,
          customer_contact_id: customerContactId,
          user_id: null,
          invited_by: context.userId,
          invited_email: inviteEmail,
          status: "invited",
          invite_token_hash: hashPortalInviteToken(token),
          invite_expires_at: expiresAt,
          invite_accepted_at: null,
          activated_at: null,
          revoked_at: null
        },
        "portal invite UX pending access grant"
      );

  if (existingGrant) {
    const grantResponse = await supabase
      .from("portal_access_grants")
      .update({
        customer_contact_id: customerContactId,
        user_id: null,
        invite_token_hash: hashPortalInviteToken(token),
        invite_expires_at: expiresAt,
        invite_accepted_at: null,
        activated_at: null,
        revoked_at: null
      })
      .eq("company_id", context.organizationId)
      .eq("id", grantId);

    if (grantResponse.error) {
      throw new Error(
        `Unable to refresh portal invite UX token: ${grantResponse.error.message}`
      );
    }
  }

  const existingProjectAccess = await findSingleBy(
    supabase,
    "portal_project_access",
    "id",
    [
      { column: "company_id", value: context.organizationId },
      { column: "portal_access_grant_id", value: grantId },
      { column: "project_id", value: projectId }
    ]
  );

  if (existingProjectAccess) {
    const accessResponse = await supabase
      .from("portal_project_access")
      .update({ status: "active", revoked_at: null })
      .eq("company_id", context.organizationId)
      .eq("id", existingProjectAccess.id);

    if (accessResponse.error) {
      throw new Error(
        `Unable to refresh portal invite UX project access: ${accessResponse.error.message}`
      );
    }
  } else {
    await insertAndReturnId(
      supabase,
      "portal_project_access",
      {
        company_id: context.organizationId,
        portal_access_grant_id: grantId,
        project_id: projectId,
        status: "active"
      },
      "portal invite UX project access"
    );
  }

  return { token };
}

test.describe("portal invite account onboarding", () => {
  test("pending invite shows customer-safe signup, sign-in, and reset actions", async ({
    page
  }) => {
    const preparedInvite = await preparePendingInviteFixture();

    test.skip(
      !preparedInvite,
      "Portal invite UX smoke requires SUPABASE_SERVICE_ROLE_KEY, FLOORCONNECTOR_E2E_EMAIL, and FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1 for a pending invite fixture."
    );

    await page.goto(`/portal/invite?token=${encodeURIComponent(preparedInvite.token)}`);

    await expect(
      page.getByRole("heading", { name: /Continue to your shared project/i })
    ).toBeVisible();
    await expect(page.getByText(inviteEmail, { exact: true })).toBeVisible();
    await expect(
      page.getByText(/Use the invited email address shown above/i)
    ).toBeVisible();

    const createAccountLink = page.getByRole("link", {
      name: /Create portal account/i
    });
    const signInLink = page.getByRole("link", { name: /^Sign in$/i });
    const resetLink = page.getByRole("link", {
      name: /Reset it using the invited email/i
    });

    await expect(createAccountLink).toBeVisible();
    await expect(signInLink).toBeVisible();
    await expect(resetLink).toBeVisible();

    for (const link of [createAccountLink, signInLink, resetLink]) {
      const href = await link.getAttribute("href");

      expect(href).toContain(`email=${encodeURIComponent(inviteEmail)}`);
      expect(href).toContain("next=%2Fportal%2Finvite%3Ftoken%3D");
    }

    await expect(page.locator("body")).not.toContainText(
      /Payment Actions|Signature Actions|Balance due|Invoice Review|Contract Review|Estimate Review/i
    );
  });

  test("invalid invite shows a safe unavailable state", async ({ page }) => {
    await page.goto("/portal/invite?token=not-a-real-portal-invite-token");

    await expect(
      page.getByRole("heading", { name: /Continue to your shared project/i })
    ).toBeVisible();
    await expect(page.locator("body")).toContainText(
      /invalid, expired, or no longer available/i
    );
    await expect(
      page.getByRole("link", { name: /Create portal account/i })
    ).toHaveCount(0);
  });
});
