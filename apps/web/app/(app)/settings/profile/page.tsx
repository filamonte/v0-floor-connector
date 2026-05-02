import { redirect } from "next/navigation";

import { SettingsSectionCard } from "@/components/settings-section-card";
import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  lifecycle_state: string;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
};

function isProfileRow(value: unknown): value is ProfileRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<ProfileRow>;

  return (
    typeof row.id === "string" &&
    typeof row.email === "string" &&
    (row.full_name === null || typeof row.full_name === "string") &&
    (row.avatar_url === null || typeof row.avatar_url === "string") &&
    typeof row.lifecycle_state === "string" &&
    (row.last_sign_in_at === null || typeof row.last_sign_in_at === "string") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatProvider(value: string | null) {
  if (!value) {
    return "Supabase Auth";
  }

  return value
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#eaded3] py-3 last:border-b-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f7f72]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-[#2b2118]">{value}</dd>
    </div>
  );
}

export default async function ProfileSettingsPage() {
  const user = await requireAuthenticatedUser("/settings/profile");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    redirect("/dashboard?error=No+active+organization+is+available.");
  }

  const supabase = await getSupabaseServerClient();
  const profileResponse = await supabase
    .from("users")
    .select(
      "id, email, full_name, avatar_url, lifecycle_state, last_sign_in_at, created_at, updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileResponse.error) {
    throw new Error(`Unable to load account profile: ${profileResponse.error.message}`);
  }

  const profile = isProfileRow(profileResponse.data) ? profileResponse.data : null;
  const userMetadata = user.user_metadata as Record<string, unknown>;
  const appMetadata = user.app_metadata as Record<string, unknown>;
  const metadataName =
    readString(userMetadata.full_name) ??
    readString(userMetadata.name) ??
    readString(userMetadata.user_name);
  const metadataAvatar =
    readString(userMetadata.avatar_url) ?? readString(userMetadata.picture);
  const displayName = profile?.full_name ?? metadataName ?? user.email ?? "Authenticated user";
  const email = profile?.email ?? user.email ?? "No email recorded";
  const avatarUrl = profile?.avatar_url ?? metadataAvatar;
  const providers = Array.from(
    new Set(
      [
        readString(appMetadata.provider),
        ...(user.identities ?? []).map((identity) => readString(identity.provider))
      ].filter((provider): provider is string => Boolean(provider))
    )
  );
  const providerLabel =
    providers.length > 0
      ? providers.map((provider) => formatProvider(provider)).join(", ")
      : formatProvider(null);
  const initials = displayName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <SettingsSectionCard
      eyebrow="Personal Account"
      title="Profile / Account Settings"
      description="Review the authenticated profile FloorConnector uses for sign-in, membership context, and the shared contractor workspace."
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="border border-[#d9cdc2] bg-[#fbf7f2] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[4px] bg-[#171717] text-xl font-semibold text-white">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a4581a]">
                Signed in as
              </p>
              <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight text-[#221a14]">
                {displayName}
              </h2>
              <p className="mt-2 break-words text-sm leading-6 text-[#6f6256]">{email}</p>
            </div>
          </div>

          <div className="mt-5 border border-[#d9cdc2] bg-white px-4 py-3 text-sm leading-6 text-[#6f6256]">
            Profile editing is read-only in this pass because no existing app-level
            profile update action is wired for personal account settings.
          </div>
        </section>

        <section className="border border-[#d9cdc2] bg-white p-5">
          <h3 className="text-sm font-semibold text-[#221a14]">Account details</h3>
          <dl className="mt-3">
            <DetailRow label="Display name" value={displayName} />
            <DetailRow label="Email" value={email} />
            <DetailRow label="Auth provider" value={providerLabel} />
            <DetailRow
              label="Profile status"
              value={profile?.lifecycle_state ?? "Not recorded"}
            />
            <DetailRow
              label="Last sign-in"
              value={formatDateTime(profile?.last_sign_in_at ?? user.last_sign_in_at)}
            />
            <DetailRow
              label="Account created"
              value={formatDateTime(profile?.created_at ?? user.created_at)}
            />
          </dl>
        </section>
      </div>

      <section className="mt-5 border border-[#d9cdc2] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#221a14]">Current organization context</h3>
        <dl className="mt-3 grid gap-px border border-[#d9cdc2] bg-[#d9cdc2] md:grid-cols-3">
          <div className="bg-[#fbf7f2] px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f7f72]">
              Organization
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#2b2118]">
              {organizationContext.organization.displayName}
            </dd>
          </div>
          <div className="bg-[#fbf7f2] px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f7f72]">
              Role
            </dt>
            <dd className="mt-1 text-sm font-medium capitalize text-[#2b2118]">
              {organizationContext.membership.role}
            </dd>
          </div>
          <div className="bg-[#fbf7f2] px-4 py-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f7f72]">
              Membership
            </dt>
            <dd className="mt-1 text-sm font-medium capitalize text-[#2b2118]">
              {organizationContext.membership.status}
            </dd>
          </div>
        </dl>
      </section>
    </SettingsSectionCard>
  );
}
