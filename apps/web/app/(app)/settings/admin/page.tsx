import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import {
  listOrganizationMembers,
  listOrganizationRoles,
  requireOrganizationAdminScope
} from "@/lib/organizations/admin";
import { updateOrganizationMembershipRoleAction } from "@/lib/settings/actions";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsAdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/admin");
  const [members, roles] = await Promise.all([
    listOrganizationMembers(scope.organizationId),
    listOrganizationRoles(scope.organizationId)
  ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Organization Admin"
        description="Manage organization membership roles and review the tenant-scoped system roles available for contractor administration."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p className="font-medium text-slate-950">Members</p>
            <p className="mt-1">{members.length} total</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p className="font-medium text-slate-950">Organization roles</p>
            <p className="mt-1">{roles.length} seeded system roles</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <p className="font-medium text-slate-950">Guardrail</p>
            <p className="mt-1">Platform policy still controls deeper permissions.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {members.map((member) => (
            <form
              key={member.id}
              action={updateOrganizationMembershipRoleAction}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
            >
              <input type="hidden" name="membershipId" value={member.id} />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    {member.users?.full_name ?? member.users?.email ?? member.invitation_email ?? "Member"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {member.users?.email ?? member.invitation_email ?? "No email available"} ·{" "}
                    {member.membership_status}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    name="nextRole"
                    defaultValue={member.membership_role}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.key}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
                  >
                    Update role
                  </button>
                </div>
              </div>
            </form>
          ))}
        </div>
      </DetailPanel>
    </div>
  );
}
