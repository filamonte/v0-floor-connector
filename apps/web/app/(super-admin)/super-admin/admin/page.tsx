import { DetailPanel } from "@/components/detail-panel";
import {
  SaveStateForm,
  SaveStateSubmitButton
} from "@/components/save-feedback/save-state-form";
import { SettingsFeedback } from "@/components/settings-feedback";
import {
  FutureCapabilityPanel,
  SuperAdminTopTabs
} from "@/components/super-admin-console";
import {
  assignPlatformAdminAction,
  updateTenantPlatformStatusAction,
  updateTenantWorkflowNumberingAction
} from "@/lib/platform-admin/actions";
import {
  getPlatformWorkflowDefaults,
  listPlatformAdmins,
  listPlatformRolesAndPermissions,
  listTenantsForPlatformAdmin
} from "@/lib/platform-admin/data";

type PageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function PlatformAdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const [admins, rolesAndPermissions, tenants, workflowDefaults] =
    await Promise.all([
      listPlatformAdmins(),
      listPlatformRolesAndPermissions(),
      listTenantsForPlatformAdmin(),
      getPlatformWorkflowDefaults()
    ]);

  return (
    <div className="space-y-6">
      <SettingsFeedback
        error={resolvedSearchParams.error}
        message={resolvedSearchParams.message}
      />

      <SuperAdminTopTabs
        tabs={[
          {
            href: "#platform-access",
            label: "Access",
            description: "Explicit platform admin assignment"
          },
          {
            href: "#tenant-oversight",
            label: "Tenants",
            description: "Lifecycle and numbering oversight"
          },
          {
            href: "#roles-permissions",
            label: "Roles",
            description: "Platform role registry"
          },
          {
            href: "#platform-operations",
            label: "Operations",
            description: "Future non-functional placeholder"
          }
        ]}
      />

      <DetailPanel
        id="platform-access"
        title="Platform Admin Access"
        description="Super-admin access is managed separately from tenant membership so global controls remain explicit and auditable. Company admins are managed in contractor Settings."
        tone="neutral"
      >
        <form
          action={assignPlatformAdminAction}
          className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-800">
              User email
            </span>
            <input
              name="email"
              type="email"
              placeholder="admin@company.com"
              required
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Assign platform admin
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600"
            >
              <p className="font-medium text-slate-950">
                {admin.users?.full_name ?? admin.users?.email ?? admin.user_id}
              </p>
              <p className="mt-1">
                {admin.users?.email ?? "No email"} -{" "}
                {admin.roles?.name ?? "Platform admin"}
              </p>
            </div>
          ))}
        </div>
      </DetailPanel>

      <DetailPanel
        id="tenant-oversight"
        title="Tenant Oversight"
        description="Manage global tenant lifecycle state and starter numbering without bypassing tenant-owned business records, workflow truth, or contractor-owned settings. This is platform oversight, not a contractor workspace."
        tone="neutral"
      >
        <div className="space-y-4">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="space-y-3">
              <form
                action={updateTenantPlatformStatusAction}
                className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
              >
                <input type="hidden" name="companyId" value={tenant.id} />
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-950">
                      {tenant.display_name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {tenant.slug} - {tenant.legal_name}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <select
                      name="tenantStatus"
                      defaultValue={tenant.tenant_status}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    >
                      <option value="trialing">trialing</option>
                      <option value="active">active</option>
                      <option value="suspended">suspended</option>
                      <option value="locked">locked</option>
                      <option value="archived">archived</option>
                      <option value="deleted">deleted</option>
                    </select>
                    <select
                      name="lifecycleState"
                      defaultValue={tenant.lifecycle_state}
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    >
                      <option value="trial">trial</option>
                      <option value="active">active</option>
                      <option value="grace_period">grace_period</option>
                      <option value="locked">locked</option>
                      <option value="retained">retained</option>
                      <option value="scheduled_for_deletion">
                        scheduled_for_deletion
                      </option>
                      <option value="deleted">deleted</option>
                      <option value="restorable">restorable</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="text-xs leading-5 text-slate-500">
                    Plan:{" "}
                    {tenant.company_subscriptions?.[0]?.subscription_plans
                      ?.name ?? "No plan"}
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
                  >
                    Save tenant status
                  </button>
                </div>
              </form>

              <SaveStateForm
                action={updateTenantWorkflowNumberingAction}
                className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4"
                pendingLabel="Saving..."
              >
                <input type="hidden" name="companyId" value={tenant.id} />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Next estimate number
                    </span>
                    <input
                      name="nextEstimateNumber"
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={
                        tenant.organization_workflow_settings?.[0]
                          ?.next_estimate_number ??
                        workflowDefaults.defaultEstimateStartNumber
                      }
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Next invoice number
                    </span>
                    <input
                      name="nextInvoiceNumber"
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={
                        tenant.organization_workflow_settings?.[0]
                          ?.next_invoice_number ??
                        workflowDefaults.defaultInvoiceStartNumber
                      }
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Next change order number
                    </span>
                    <input
                      name="nextChangeOrderNumber"
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={
                        tenant.organization_workflow_settings?.[0]
                          ?.next_change_order_number ??
                        workflowDefaults.defaultChangeOrderStartNumber
                      }
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Next contract number
                    </span>
                    <input
                      name="nextContractNumber"
                      type="number"
                      min="1"
                      step="1"
                      defaultValue={
                        tenant.organization_workflow_settings?.[0]
                          ?.next_contract_number ??
                        workflowDefaults.defaultContractStartNumber
                      }
                      required
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-700 focus:ring-4 focus:ring-brand-100"
                    />
                  </label>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs leading-5 text-slate-500">
                    Super admin can seed per-contractor numbering before first
                    use. After records exist, the next number can only move
                    upward.
                  </p>
                  <SaveStateSubmitButton
                    submitLabel="Save numbering"
                    pendingLabel="Saving..."
                    variant="secondary"
                    className="rounded-full"
                  />
                </div>
              </SaveStateForm>
            </div>
          ))}
        </div>
      </DetailPanel>

      <DetailPanel
        id="roles-permissions"
        title="Platform Roles And Permissions"
        description="The platform role layer stays separate from tenant memberships so super-admin behavior can evolve without fragmenting contractor auth."
        tone="neutral"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              Platform roles
            </p>
            <div className="mt-4 space-y-3">
              {rolesAndPermissions.roles.map((role) => (
                <div
                  key={role.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <p className="text-sm font-medium text-slate-950">
                    {role.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {role.description ?? role.key}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-950">
              Permission registry
            </p>
            <div className="mt-4 space-y-3">
              {rolesAndPermissions.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <p className="text-sm font-medium text-slate-950">
                    {permission.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {permission.module_key} - {permission.key}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetailPanel>

      <div id="platform-operations" className="grid gap-4 lg:grid-cols-2">
        <FutureCapabilityPanel title="Platform operations and errors">
          The dedicated Operations page now centralizes read-only
          workflow-error, provisioning audit, provisioning attempt, contractor
          group audit, and tenant-status health signals. It does not create
          remediation controls, operational logs, retry paths, or tenant-owned
          record changes.
        </FutureCapabilityPanel>
        <FutureCapabilityPanel title="Contractor groups">
          Contractor grouping for template assignment, starter-pack rollout, and
          entitlement policy remains future work. Existing tenant oversight
          still operates directly on canonical company records.
        </FutureCapabilityPanel>
      </div>
    </div>
  );
}
