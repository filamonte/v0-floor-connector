import { DetailPanel } from "@/components/detail-panel";
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
        <form action={updateOrganizationProfileAction} className="space-y-5">
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

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
            Platform status is still controlled by super admin. Contractor admins manage only the organization-owned profile layer here.
          </div>

          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-900"
          >
            Save organization profile
          </button>
        </form>
      </DetailPanel>
    </div>
  );
}
