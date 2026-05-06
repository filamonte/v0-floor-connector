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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">Slug</span>
            <input
              name="slug"
              defaultValue={scope.organization.slug}
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                  className="h-10 w-10 shrink-0 rounded-full border border-slate-300"
                  style={{ backgroundColor: brandAccentColor }}
                />
                <input
                  name="brandAccentColor"
                  defaultValue={scope.organization.brandAccentColor ?? ""}
                  placeholder="#d8731f"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
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
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
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
