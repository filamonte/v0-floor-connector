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
  "w-full rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/15";
const organizationNoticeClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]";

export default async function OrganizationSettingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/organization");
  const brandAccentColor = scope.organization.brandAccentColor ?? "#d8731f";

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
        <SaveStateForm
          action={updateOrganizationProfileAction}
          pendingLabel="Saving..."
          className="space-y-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
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

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Slug</span>
            <input
              name="slug"
              defaultValue={scope.organization.slug}
              required
              className={organizationFieldClassName}
            />
          </label>

          <label className="block">
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
              Use an absolute image URL to show the tenant logo in the shared app header.
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Website
              </span>
              <input
                name="websiteUrl"
                type="url"
                defaultValue={scope.organization.websiteUrl ?? ""}
                placeholder="https://example.com"
                className={organizationFieldClassName}
              />
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-800">
                Brand accent color
              </span>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-10 w-10 shrink-0 rounded-[4px] border border-[var(--border-warm)]"
                  style={{ backgroundColor: brandAccentColor }}
                />
                <input
                  name="brandAccentColor"
                  defaultValue={scope.organization.brandAccentColor ?? ""}
                  placeholder="#d8731f"
                  className={organizationFieldClassName}
                />
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

          <div className={organizationNoticeClassName}>
            Platform status is still controlled by super admin. Contractor admins manage only the organization-owned profile layer here. Logo upload remains deferred; use a hosted URL or storage reference.
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
