import { DetailPanel } from "@/components/detail-panel";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import { updateOrganizationProfileAction } from "@/lib/settings/actions";
import { requireOrganizationAdminScope } from "@/lib/organizations/admin";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

const organizationFieldClassName =
  "w-full rounded-[4px] border border-[#cfd6df] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[#005eb8] focus:ring-2 focus:ring-[#005eb8]/15";
const organizationNoticeClassName =
  "rounded-[4px] border border-[#cfd6df] bg-[#f7f9fc] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]";
const organizationFieldsetClassName =
  "rounded-[4px] border border-[#d1d5db] bg-white px-4 py-4 sm:px-5";
const organizationLegendClassName =
  "px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]";
const organizationFieldsetDescriptionClassName =
  "mt-2 text-sm leading-6 text-[var(--text-secondary)]";

function formatStatus(value: string | null | undefined) {
  if (!value) {
    return "Not exposed";
  }

  return value.replaceAll("_", " ");
}

export default async function OrganizationSettingsPage({
  searchParams
}: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/organization");
  const brandAccentColor = scope.organization.brandAccentColor ?? "#005EB8";
  const profileSummary = [
    {
      label: "Tenant status",
      value: formatStatus(scope.organization.tenantStatus)
    },
    {
      label: "Lifecycle state",
      value: formatStatus(scope.organization.lifecycleState)
    },
    {
      label: "Primary trade",
      value: scope.organization.primaryTrade ?? "Not set"
    },
    {
      label: "Time zone",
      value: scope.organization.timeZone ?? "Not set"
    }
  ];

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Organization Profile"
        description="This tenant-scoped profile controls how the contractor organization appears throughout the app and across canonical project, document, and billing records."
      >
        <div className="grid gap-3 md:grid-cols-4">
          {profileSummary.map((item) => (
            <div
              key={item.label}
              className="rounded-[4px] border border-[#d1d5db] bg-[#f7f9fc] px-4 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">
                {item.label}
              </p>
              <p className="mt-2 break-words text-sm font-semibold capitalize text-[var(--text-primary)]">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <SaveStateForm
          action={updateOrganizationProfileAction}
          pendingLabel="Saving..."
          className="mt-5 space-y-5"
        >
          <fieldset className={organizationFieldsetClassName}>
            <legend className={organizationLegendClassName}>
              Company identity
            </legend>
            <p className={organizationFieldsetDescriptionClassName}>
              These fields identify the contractor organization on protected app
              surfaces and canonical business records.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Legal name
                </span>
                <input
                  name="legalName"
                  defaultValue={scope.organization.legalName}
                  required
                  className={organizationFieldClassName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Display name
                </span>
                <input
                  name="displayName"
                  defaultValue={scope.organization.displayName}
                  required
                  className={organizationFieldClassName}
                />
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Slug
              </span>
              <input
                name="slug"
                defaultValue={scope.organization.slug}
                required
                className={organizationFieldClassName}
              />
            </label>
          </fieldset>

          <fieldset className={organizationFieldsetClassName}>
            <legend className={organizationLegendClassName}>
              Public contact
            </legend>
            <p className={organizationFieldsetDescriptionClassName}>
              Customer-facing contact details stay organization-scoped and feed
              records that reference the contractor profile.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Company phone
                </span>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={scope.organization.phone ?? ""}
                  className={organizationFieldClassName}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Company email
                </span>
                <input
                  name="email"
                  type="email"
                  defaultValue={scope.organization.email ?? ""}
                  className={organizationFieldClassName}
                />
              </label>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Contractor website URL
                </span>
                <input
                  name="websiteUrl"
                  defaultValue={scope.organization.websiteUrl ?? ""}
                  placeholder="example.com or https://www.example.com"
                  className={organizationFieldClassName}
                />
                <span className="mt-2 block text-xs leading-5 text-slate-500">
                  Plain domains are saved as usable HTTPS URLs.
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Primary trade / service type
                </span>
                <input
                  name="primaryTrade"
                  defaultValue={scope.organization.primaryTrade ?? ""}
                  placeholder="Epoxy flooring"
                  className={organizationFieldClassName}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className={organizationFieldsetClassName}>
            <legend className={organizationLegendClassName}>
              App presentation
            </legend>
            <p className={organizationFieldsetDescriptionClassName}>
              Logo and accent values affect the protected app header only.
              Broader theming remains platform-owned.
            </p>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Logo URL
              </span>
              <input
                name="logoUrl"
                type="url"
                defaultValue={scope.organization.logoUrl ?? ""}
                placeholder="https://example.com/logo.png"
                className={organizationFieldClassName}
              />
              <span className="mt-2 block text-xs leading-5 text-slate-500">
                Use an absolute image URL to show the tenant logo in the shared
                app header.
              </span>
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  App header accent color
                </span>
                <div className="grid gap-3 sm:grid-cols-[44px_minmax(0,1fr)] sm:items-center">
                  <div
                    aria-label={`Current app header accent preview ${brandAccentColor}`}
                    className="h-11 w-11 rounded-[4px] border border-[var(--border-warm)] shadow-inner"
                    style={{ backgroundColor: brandAccentColor }}
                  />
                  <div>
                    <input
                      name="brandAccentColor"
                      defaultValue={scope.organization.brandAccentColor ?? ""}
                      placeholder="#005EB8"
                      className={organizationFieldClassName}
                    />
                    <span className="mt-2 block text-xs leading-5 text-slate-500">
                      Used for the organization mark in the protected app
                      header.
                    </span>
                  </div>
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-800">
                  Time zone
                </span>
                <input
                  name="timeZone"
                  defaultValue={scope.organization.timeZone ?? ""}
                  placeholder="America/New_York"
                  className={organizationFieldClassName}
                />
              </label>
            </div>
          </fieldset>

          <div className={organizationNoticeClassName}>
            Platform status is still controlled by super admin. Contractor
            admins manage only the organization-owned profile layer here. Logo
            upload remains deferred; use a hosted URL or storage reference.
          </div>

          <SaveStateSubmitButton
            submitLabel="Save organization profile"
            pendingLabel="Saving..."
          />
        </SaveStateForm>
      </DetailPanel>
    </div>
  );
}
