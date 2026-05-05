import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { CustomerContactForm } from "@/components/customer-contact-form";
import { PortalAccessGrantForm } from "@/components/portal-access-grant-form";
import { PortalProjectAccessForm } from "@/components/portal-project-access-form";
import {
  createCustomerContactAction,
  makeCustomerContactPrimaryAction,
  updateCustomerContactAction
} from "@/lib/contacts/actions";
import type { DirectoryCustomerContactListItem } from "@/lib/contacts/data";
import {
  createPortalAccessGrantAction,
  createPortalProjectAccessAction,
  updateCustomerContactPortalPermissionAction,
  updatePortalAccessGrantLinkAction,
  updatePortalAccessGrantStatusAction,
  updatePortalProjectAccessStatusAction
} from "@/lib/portal-access/actions";
import type {
  CustomerContactPortalPermissionListItem,
  PortalAccessGrantListItem,
  PortalProjectAccessListItem
} from "@/lib/portal-access/data";
import type { ProjectListItem } from "@/lib/projects/data";

type PeoplePortalAccessPanelProps = {
  customerContacts: DirectoryCustomerContactListItem[];
  portalAccessGrants: PortalAccessGrantListItem[];
  portalProjectAccessByGrantId: Map<string, PortalProjectAccessListItem[]>;
  portalPermissionsByCustomerContactId: Map<string, CustomerContactPortalPermissionListItem>;
  projectsByCustomerId: Map<string, ProjectListItem[]>;
  canManageCustomerContacts: boolean;
  returnTo?: string;
};

const futurePortalPermissionReadiness = [
  "View estimates",
  "Approve estimates",
  "Sign contracts",
  "Approve change orders",
  "View/pay invoices",
  "Request new quote"
];

function formatLabel(value: string | null | undefined, fallback = "Not provided") {
  return value?.replaceAll("_", " ") ?? fallback;
}

function getPortalAccessStatusClasses(status: string) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "revoked":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-900";
  }
}

function formatManagementSourceLabel(value: string) {
  switch (value) {
    case "contractor_admin":
      return "Customized by contractor admin";
    case "main_contact":
      return "Customized by main contact";
    case "migration":
      return "Seeded from migration";
    default:
      return "Default stored permissions";
  }
}

function buildCustomerContactOptions(
  customerContacts: DirectoryCustomerContactListItem[],
  customerId: string
) {
  return customerContacts
    .filter((customerContact) => customerContact.customerId === customerId)
    .map((customerContact) => {
      const contactName = customerContact.contact?.displayName ?? "Linked contact";
      const contactEmail = customerContact.contact?.email?.trim() ?? "";
      const relationshipLabel = formatLabel(customerContact.relationshipLabel, "Related contact");
      const primaryLabel = customerContact.isPrimary ? "Main contact" : relationshipLabel;

      return {
        id: customerContact.id,
        label: contactEmail
          ? `${contactName} (${contactEmail}) - ${primaryLabel}`
          : `${contactName} - ${primaryLabel}`
      };
    });
}

function PermissionBadges({
  storedPortalPermission
}: {
  storedPortalPermission: CustomerContactPortalPermissionListItem | null;
}) {
  if (!storedPortalPermission) {
    return (
      <div className="flex flex-wrap gap-2">
        {futurePortalPermissionReadiness.map((permission) => (
          <span
            key={permission}
            className="inline-flex rounded-[4px] border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900"
          >
            {permission}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {[
        { label: "View estimates", enabled: storedPortalPermission.canViewEstimates },
        { label: "Approve estimates", enabled: storedPortalPermission.canApproveEstimates },
        { label: "Sign contracts", enabled: storedPortalPermission.canSignContracts },
        {
          label: "Approve change orders",
          enabled: storedPortalPermission.canApproveChangeOrders
        },
        { label: "View/pay invoices", enabled: storedPortalPermission.canViewPayInvoices },
        { label: "Request new quote", enabled: storedPortalPermission.canRequestQuotes }
      ].map((permission) => (
        <span
          key={permission.label}
          className={`inline-flex rounded-[4px] border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
            permission.enabled
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-slate-200 bg-slate-100 text-slate-700"
          }`}
        >
          {permission.enabled ? "Enabled" : "Disabled"}: {permission.label}
        </span>
      ))}
    </div>
  );
}

export function PeoplePortalAccessPanel({
  customerContacts,
  portalAccessGrants,
  portalProjectAccessByGrantId,
  portalPermissionsByCustomerContactId,
  projectsByCustomerId,
  canManageCustomerContacts,
  returnTo = "/people"
}: PeoplePortalAccessPanelProps) {
  const grantsByCustomerId = new Map<string, PortalAccessGrantListItem[]>();

  for (const grant of portalAccessGrants) {
    const existing = grantsByCustomerId.get(grant.customerId) ?? [];
    existing.push(grant);
    grantsByCustomerId.set(grant.customerId, existing);
  }

  const customerGroups = new Map<
    string,
    {
      customer: NonNullable<DirectoryCustomerContactListItem["customer"]>;
      contacts: DirectoryCustomerContactListItem[];
    }
  >();

  for (const customerContact of customerContacts) {
    if (!customerContact.customer) {
      continue;
    }

    const existing = customerGroups.get(customerContact.customerId) ?? {
      customer: customerContact.customer,
      contacts: []
    };
    existing.contacts.push(customerContact);
    customerGroups.set(customerContact.customerId, existing);
  }

  return (
    <section id="customer-access" className="border border-[#d6d6d6] bg-white">
      <div className="border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Customer identity and portal access
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              People-managed customer contacts
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Manage contact identity, invite state, linked customer relationship, stored
            permissions, and project visibility here. Estimate, contract, and invoice workflows
            should only trigger or verify this access when sending, signing, or paying.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6">
        {customerGroups.size > 0 ? (
          [...customerGroups.values()].map(({ customer, contacts }) => {
            const projects = projectsByCustomerId.get(customer.id) ?? [];
            const grants = grantsByCustomerId.get(customer.id) ?? [];
            const customerContactOptions = buildCustomerContactOptions(
              customerContacts,
              customer.id
            );

            return (
              <section
                key={customer.id}
                className="space-y-5 border border-slate-200 bg-slate-50/60 px-4 py-4 sm:px-5"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">
                      {customer.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {customer.companyName ?? customer.email ?? "Customer relationship"}
                    </p>
                  </div>
                  <Link
                    href={`/customers/${customer.id}`}
                    className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    View customer context
                  </Link>
                </div>

                {canManageCustomerContacts ? (
                  <div className="border border-slate-200 bg-white px-4 py-4">
                    <p className="text-sm font-medium text-slate-950">Add contact</p>
                    <div className="mt-4">
                      <CustomerContactForm
                        action={createCustomerContactAction}
                        customerId={customer.id}
                        returnTo={returnTo}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4">
                  {contacts.map((customerContact) => {
                    const storedPortalPermission =
                      portalPermissionsByCustomerContactId.get(customerContact.id) ?? null;

                    return (
                      <section
                        key={customerContact.id}
                        className="border border-slate-200 bg-white px-4 py-4"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-950">
                                {customerContact.contact?.displayName ?? "Linked contact"}
                              </p>
                              <span className="inline-flex rounded-[4px] border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                                {customerContact.isPrimary
                                  ? "Main contact"
                                  : formatLabel(customerContact.relationshipLabel, "Related")}
                              </span>
                            </div>
                            <div className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-2">
                              <p>
                                Email:{" "}
                                <span className="font-medium text-slate-950">
                                  {customerContact.contact?.email ?? "Missing"}
                                </span>
                              </p>
                              <p>
                                Phone:{" "}
                                <span className="font-medium text-slate-950">
                                  {customerContact.contact?.phone ?? "Missing"}
                                </span>
                              </p>
                            </div>
                          </div>
                          {!customerContact.isPrimary && canManageCustomerContacts ? (
                            <form action={makeCustomerContactPrimaryAction}>
                              <input type="hidden" name="customerId" value={customer.id} />
                              <input
                                type="hidden"
                                name="customerContactId"
                                value={customerContact.id}
                              />
                              <input type="hidden" name="returnTo" value={returnTo} />
                              <button
                                type="submit"
                                className="inline-flex items-center rounded-[4px] border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Make main contact
                              </button>
                            </form>
                          ) : null}
                        </div>

                        {canManageCustomerContacts ? (
                          <div className="mt-4 border border-slate-200 bg-slate-50/70 px-4 py-4">
                            <p className="text-sm font-medium text-slate-950">Edit contact</p>
                            <div className="mt-4">
                              <CustomerContactForm
                                action={updateCustomerContactAction}
                                customerId={customer.id}
                                customerContact={customerContact}
                                returnTo={returnTo}
                              />
                            </div>
                          </div>
                        ) : null}

                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-medium text-slate-950">
                            Portal permission profile
                          </p>
                          <PermissionBadges storedPortalPermission={storedPortalPermission} />
                          <p className="text-xs leading-5 text-slate-500">
                            {storedPortalPermission
                              ? `Stored state: ${formatManagementSourceLabel(storedPortalPermission.managementSource)}.`
                              : "Stored permissions will be created when this contact is linked to a portal grant."}
                          </p>
                        </div>
                      </section>
                    );
                  })}
                </div>

                <section className="border border-slate-200 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-slate-950">
                    Ensure portal access
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Use this when a workflow needs a customer contact to review, sign, or pay
                    through the portal. Existing active access is reused.
                  </p>
                  <div className="mt-4">
                    <PortalAccessGrantForm
                      action={createPortalAccessGrantAction}
                      customerId={customer.id}
                      defaultEmail={customer.email}
                      customerContacts={customerContactOptions}
                      projects={projects.map((project) => ({
                        id: project.id,
                        label: project.name,
                        status: project.status
                      }))}
                      returnTo={returnTo}
                    />
                  </div>
                </section>

                {grants.length > 0 ? (
                  <div className="grid gap-4">
                    {grants.map((grant) => {
                      const projectAccess = portalProjectAccessByGrantId.get(grant.id) ?? [];
                      const availableProjects = projects
                        .filter(
                          (project) =>
                            !projectAccess.some((access) => access.projectId === project.id)
                        )
                        .map((project) => ({
                          id: project.id,
                          label: project.name,
                          status: project.status
                        }));

                      return (
                        <section
                          key={grant.id}
                          className="border border-slate-200 bg-white px-4 py-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-slate-950">
                                  {grant.portalUser?.fullName ??
                                    grant.portalUser?.email ??
                                    grant.invitedEmail ??
                                    "Portal access"}
                                </p>
                                <span
                                  className={`inline-flex rounded-[4px] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getPortalAccessStatusClasses(
                                    grant.status
                                  )}`}
                                >
                                  {formatLabel(grant.status)}
                                </span>
                              </div>
                              <div className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                                <p>
                                  Portal email:{" "}
                                  <span className="font-medium text-slate-950">
                                    {grant.portalUser?.email ?? grant.invitedEmail ?? "Not captured"}
                                  </span>
                                </p>
                                <p>
                                  Linked contact:{" "}
                                  <span className="font-medium text-slate-950">
                                    {grant.customerContact?.contact?.displayName ??
                                      "Customer-level grant"}
                                  </span>
                                </p>
                                <p>
                                  Active project visibility:{" "}
                                  <span className="font-medium text-slate-950">
                                    {projectAccess.filter((access) => access.status === "active").length}
                                  </span>
                                </p>
                              </div>
                            </div>
                            {grant.status === "revoked" && !grant.userId ? (
                              <p className="rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                                Invite revoked
                              </p>
                            ) : (
                              <form action={updatePortalAccessGrantStatusAction}>
                                <input type="hidden" name="portalAccessGrantId" value={grant.id} />
                                <input type="hidden" name="customerId" value={customer.id} />
                                <input
                                  type="hidden"
                                  name="customerContactId"
                                  value={grant.customerContactId ?? ""}
                                />
                                <input type="hidden" name="userId" value={grant.userId ?? ""} />
                                <input
                                  type="hidden"
                                  name="invitedEmail"
                                  value={grant.invitedEmail ?? grant.portalUser?.email ?? ""}
                                />
                                <input
                                  type="hidden"
                                  name="status"
                                  value={grant.status === "revoked" ? "active" : "revoked"}
                                />
                                <input type="hidden" name="returnTo" value={returnTo} />
                                <button
                                  type="submit"
                                  className="inline-flex items-center rounded-[4px] border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                  {grant.status === "revoked" ? "Reactivate access" : "Revoke access"}
                                </button>
                              </form>
                            )}
                          </div>

                          {grant.userId ? (
                            <form
                              action={updatePortalAccessGrantLinkAction}
                              className="mt-4 grid gap-3 border border-slate-200 bg-slate-50/70 px-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
                            >
                              <input type="hidden" name="portalAccessGrantId" value={grant.id} />
                              <input type="hidden" name="customerId" value={customer.id} />
                              <input type="hidden" name="userId" value={grant.userId ?? ""} />
                              <input
                                type="hidden"
                                name="invitedEmail"
                                value={grant.invitedEmail ?? grant.portalUser?.email ?? ""}
                              />
                              <input type="hidden" name="status" value={grant.status} />
                              <input type="hidden" name="returnTo" value={returnTo} />
                              <label className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-800">
                                  Link to contact
                                </span>
                                <select
                                  name="customerContactId"
                                  defaultValue={grant.customerContactId ?? ""}
                                  className="w-full rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-700"
                                >
                                  <option value="">Customer-level grant</option>
                                  {customerContactOptions.map((customerContact) => (
                                    <option key={customerContact.id} value={customerContact.id}>
                                      {customerContact.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Update link
                              </button>
                            </form>
                          ) : null}

                          {grant.customerContact ? (
                            <form
                              action={updateCustomerContactPortalPermissionAction}
                              className="mt-4 space-y-4 border border-slate-200 bg-slate-50/70 px-4 py-4"
                            >
                              <input type="hidden" name="portalAccessGrantId" value={grant.id} />
                              <input type="hidden" name="customerId" value={customer.id} />
                              <input
                                type="hidden"
                                name="customerContactId"
                                value={grant.customerContact.id}
                              />
                              <input type="hidden" name="returnTo" value={returnTo} />
                              <p className="text-sm font-medium text-slate-950">
                                Stored permissions
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                  {
                                    name: "canViewEstimates",
                                    label: "View estimates",
                                    defaultChecked:
                                      portalPermissionsByCustomerContactId.get(
                                        grant.customerContact.id
                                      )?.canViewEstimates ?? true
                                  },
                                  {
                                    name: "canApproveEstimates",
                                    label: "Approve estimates",
                                    defaultChecked:
                                      portalPermissionsByCustomerContactId.get(
                                        grant.customerContact.id
                                      )?.canApproveEstimates ?? true
                                  },
                                  {
                                    name: "canSignContracts",
                                    label: "Sign contracts",
                                    defaultChecked:
                                      portalPermissionsByCustomerContactId.get(
                                        grant.customerContact.id
                                      )?.canSignContracts ?? true
                                  },
                                  {
                                    name: "canApproveChangeOrders",
                                    label: "Approve change orders",
                                    defaultChecked:
                                      portalPermissionsByCustomerContactId.get(
                                        grant.customerContact.id
                                      )?.canApproveChangeOrders ?? true
                                  },
                                  {
                                    name: "canViewPayInvoices",
                                    label: "View/pay invoices",
                                    defaultChecked:
                                      portalPermissionsByCustomerContactId.get(
                                        grant.customerContact.id
                                      )?.canViewPayInvoices ?? true
                                  },
                                  {
                                    name: "canRequestQuotes",
                                    label: "Request new quote",
                                    defaultChecked:
                                      portalPermissionsByCustomerContactId.get(
                                        grant.customerContact.id
                                      )?.canRequestQuotes ?? true
                                  }
                                ].map((permission) => (
                                  <label
                                    key={permission.name}
                                    className="flex items-center gap-3 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
                                  >
                                    <input
                                      type="checkbox"
                                      name={permission.name}
                                      defaultChecked={permission.defaultChecked}
                                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-200"
                                    />
                                    <span>{permission.label}</span>
                                  </label>
                                ))}
                              </div>
                              <button
                                type="submit"
                                className="inline-flex items-center rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Save stored permissions
                              </button>
                            </form>
                          ) : null}

                          <div className="mt-4 space-y-3">
                            <p className="text-sm font-medium text-slate-950">
                              Visible projects
                            </p>
                            {projectAccess.length > 0 ? (
                              <div className="grid gap-3">
                                {projectAccess.map((access) => (
                                  <div
                                    key={access.id}
                                    className="flex flex-col gap-3 border border-slate-200 bg-slate-50/70 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-slate-950">
                                        {access.project?.name ?? "Linked project"}
                                      </p>
                                      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                                        {formatLabel(access.status)}
                                      </p>
                                    </div>
                                    <form action={updatePortalProjectAccessStatusAction}>
                                      <input
                                        type="hidden"
                                        name="portalProjectAccessId"
                                        value={access.id}
                                      />
                                      <input type="hidden" name="customerId" value={customer.id} />
                                      <input
                                        type="hidden"
                                        name="portalAccessGrantId"
                                        value={access.portalAccessGrantId}
                                      />
                                      <input type="hidden" name="projectId" value={access.projectId} />
                                      <input
                                        type="hidden"
                                        name="status"
                                        value={access.status === "revoked" ? "active" : "revoked"}
                                      />
                                      <input type="hidden" name="returnTo" value={returnTo} />
                                      <button
                                        type="submit"
                                        className="inline-flex items-center rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                      >
                                        {access.status === "revoked"
                                          ? "Reactivate visibility"
                                          : "Revoke visibility"}
                                      </button>
                                    </form>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm leading-6 text-slate-500">
                                No project visibility has been granted yet.
                              </p>
                            )}
                            {availableProjects.length > 0 && grant.status !== "revoked" ? (
                              <PortalProjectAccessForm
                                action={createPortalProjectAccessAction}
                                customerId={customer.id}
                                portalAccessGrantId={grant.id}
                                projects={availableProjects}
                                returnTo={returnTo}
                              />
                            ) : null}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm leading-6 text-slate-500">
                    No portal access has been granted for this customer yet.
                  </p>
                )}
              </section>
            );
          })
        ) : (
          <AppEmptyState
            eyebrow="No customer contacts"
            title="Customer contacts will appear here"
            description="Create related customer contacts from a customer record first, then manage their portal access and project visibility from People."
          />
        )}
      </div>
    </section>
  );
}
