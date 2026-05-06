#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");

function loadRootEnv() {
  const envPath = path.join(workspaceRoot, ".env.local");

  if (!fs.existsSync(envPath)) {
    return;
  }

  const envText = fs.readFileSync(envPath, "utf8");
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

function readArgs() {
  const [, , command, emailArg] = process.argv;
  const email = emailArg ?? process.env.PLATFORM_SUPER_ADMIN_EMAIL;

  if (!["grant", "revoke", "status"].includes(command)) {
    throw new Error(
      "Usage: pnpm platform-admin <grant|revoke|status> <email>\n" +
        "You can also omit <email> when PLATFORM_SUPER_ADMIN_EMAIL is set."
    );
  }

  if (!email) {
    throw new Error(
      "Platform admin email is required. Pass it as an argument or set PLATFORM_SUPER_ADMIN_EMAIL."
    );
  }

  return {
    command,
    email: email.toLowerCase().trim()
  };
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

async function getCanonicalUser(supabase, email) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name")
    .ilike("email", email)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to look up canonical user: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      `No canonical user was found for ${email}. The auth user must sign in once so the public.users profile exists before assigning platform access.`
    );
  }

  return data;
}

async function getPlatformAdminRole(supabase) {
  const { data, error } = await supabase
    .from("roles")
    .select("id, key, name")
    .is("company_id", null)
    .eq("scope", "platform")
    .eq("key", "platform_admin")
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      `Unable to resolve platform_admin role: ${error?.message ?? "Missing role."}`
    );
  }

  return data;
}

async function listUserStatus(supabase, userId) {
  const [platformRolesResponse, membershipsResponse] = await Promise.all([
    supabase
      .from("platform_user_roles")
      .select(
        `
          id,
          roles (
            key,
            name,
            scope
          )
        `
      )
      .eq("user_id", userId),
    supabase
      .from("company_memberships")
      .select(
        `
          company_id,
          membership_role,
          membership_status,
          companies (
            display_name,
            legal_name
          )
        `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
  ]);

  if (platformRolesResponse.error) {
    throw new Error(
      `Unable to load platform roles: ${platformRolesResponse.error.message}`
    );
  }

  if (membershipsResponse.error) {
    throw new Error(
      `Unable to load contractor memberships: ${membershipsResponse.error.message}`
    );
  }

  return {
    platformRoles: platformRolesResponse.data ?? [],
    memberships: membershipsResponse.data ?? []
  };
}

function printStatus(user, status) {
  const platformRoleKeys = status.platformRoles
    .map((assignment) => {
      const role = Array.isArray(assignment.roles)
        ? assignment.roles[0]
        : assignment.roles;

      return role?.key;
    })
    .filter(Boolean);

  console.log(`User: ${user.email} (${user.id})`);
  console.log(
    `Platform roles: ${platformRoleKeys.length > 0 ? platformRoleKeys.join(", ") : "none"}`
  );

  if (status.memberships.length === 0) {
    console.log("Contractor memberships: none");
    return;
  }

  console.log("Contractor memberships:");
  for (const membership of status.memberships) {
    const company = Array.isArray(membership.companies)
      ? membership.companies[0]
      : membership.companies;
    const companyName =
      company?.display_name ?? company?.legal_name ?? membership.company_id;

    console.log(
      `- ${companyName}: ${membership.membership_role} (${membership.membership_status})`
    );
  }
}

async function main() {
  loadRootEnv();
  const { command, email } = readArgs();
  const supabase = createAdminClient();
  const user = await getCanonicalUser(supabase, email);
  const role = await getPlatformAdminRole(supabase);

  if (command === "grant") {
    const { error } = await supabase.from("platform_user_roles").upsert(
      {
        user_id: user.id,
        role_id: role.id,
        created_by: user.id,
        updated_by: user.id
      },
      {
        onConflict: "user_id,role_id"
      }
    );

    if (error) {
      throw new Error(`Unable to grant platform admin access: ${error.message}`);
    }

    console.log(`Granted platform_admin to ${user.email}.`);
  }

  if (command === "revoke") {
    const { error } = await supabase
      .from("platform_user_roles")
      .delete()
      .eq("user_id", user.id)
      .eq("role_id", role.id);

    if (error) {
      throw new Error(`Unable to revoke platform admin access: ${error.message}`);
    }

    console.log(`Revoked platform_admin from ${user.email}.`);
  }

  const status = await listUserStatus(supabase, user.id);
  printStatus(user, status);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
