import { DetailPanel } from "@/components/detail-panel";
import { SettingsFeedback } from "@/components/settings-feedback";
import {
  listOrganizationMembers,
  listOrganizationRoles,
  requireOrganizationAdminScope
} from "@/lib/organizations/admin";
import { updateOrganizationMembershipRoleAction } from "@/lib/settings/actions";
import { listRecentWorkflowErrorEventsForAdmin } from "@/lib/workflow-errors/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

const adminSummaryCardClassName =
  "rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-4 text-sm text-[var(--text-secondary)]";

const adminFormCardClassName =
  "rounded-lg border border-[var(--border-warm)] bg-white p-5 shadow-sm";

export default async function SettingsAdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const scope = await requireOrganizationAdminScope("/settings/admin");
  const [members, roles, workflowErrors] = await Promise.all([
    listOrganizationMembers(scope.organizationId),
    listOrganizationRoles(scope.organizationId),
    listRecentWorkflowErrorEventsForAdmin()
  ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <DetailPanel
        title="Company Admin"
        description="Manage contractor organization membership roles and tenant-scoped admin controls. Platform-admin assignment, tenant lifecycle, and global permission policy stay in Super Admin."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className={adminSummaryCardClassName}>
            <p className="font-medium text-[var(--text-primary)]">Members</p>
            <p className="mt-1">{members.length} total</p>
          </div>
          <div className={adminSummaryCardClassName}>
            <p className="font-medium text-[var(--text-primary)]">
              Organization roles
            </p>
            <p className="mt-1">{roles.length} seeded system roles</p>
          </div>
          <div className={adminSummaryCardClassName}>
            <p className="font-medium text-[var(--text-primary)]">Guardrail</p>
            <p className="mt-1">
              Company admins manage this organization only.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {members.map((member) => (
            <form
              key={member.id}
              action={updateOrganizationMembershipRoleAction}
              className={adminFormCardClassName}
            >
              <input type="hidden" name="membershipId" value={member.id} />
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    {member.users?.full_name ??
                      member.users?.email ??
                      member.invitation_email ??
                      "Member"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {member.users?.email ??
                      member.invitation_email ??
                      "No email available"}{" "}
                    | {member.membership_status}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    name="nextRole"
                    defaultValue={member.membership_role}
                    className="rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[var(--copper)] focus:ring-2 focus:ring-[var(--copper)]/20"
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.key}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--highlight)]"
                  >
                    Update role
                  </button>
                </div>
              </div>
            </form>
          ))}
        </div>
      </DetailPanel>

      <DetailPanel
        title="Operations Monitor preview"
        description="Recent tenant-scoped workflow failures are shown here only as troubleshooting evidence. A fuller Operations Monitor belongs outside Settings; company admins should use this list to find configuration blockers, then resolve the source record in its owning workspace."
      >
        {workflowErrors.length > 0 ? (
          <div className="divide-y divide-[var(--border-warm)] rounded-lg border border-[var(--border-warm)] bg-white shadow-sm">
            {workflowErrors.map((event) => (
              <div key={event.id} className="px-5 py-4">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {event.action}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {event.message}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                      {event.subjectType}
                      {event.subjectId ? ` ${event.subjectId.slice(0, 8)}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(event.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[var(--border-warm)] bg-[var(--highlight)] px-5 py-4 text-sm leading-6 text-[var(--text-secondary)]">
            No workflow errors have been recorded for this organization yet.
          </div>
        )}
      </DetailPanel>
    </div>
  );
}
