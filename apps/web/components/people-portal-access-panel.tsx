import Link from "next/link";

import { AppEmptyState } from "@/components/app-empty-state";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { CustomerContactForm } from "@/components/customer-contact-form";
import { PortalAccessGrantForm } from "@/components/portal-access-grant-form";
import { PortalInviteEmailStatus } from "@/components/portal-invite-email-status";
import { PortalProjectAccessForm } from "@/components/portal-project-access-form";
import { TemporaryPortalCredentialForm } from "@/components/temporary-portal-credential-form";
import {
  createCustomerContactAction,
  makeCustomerContactPrimaryAction,
  updateCustomerContactAction
} from "@/lib/contacts/actions";
import type { DirectoryCustomerContactListItem } from "@/lib/contacts/data";
import {
  copyPortalProjectAccessFromPrimaryContactAction,
  createPortalAccessGrantAction,
  createPortalProjectAccessAction,
  sendPortalInviteEmailAction,
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

type AccessStatusFilter =
  | "all"
  | "active"
  | "invited"
  | "revoked"
  | "missing_grant"
  | "temp_required";

type AuthStatusFilter =
  | "all"
  | "linked"
  | "not_linked"
  | "email_missing"
  | "temp_required";

type AccessCustomerSummary = {
  id: string;
  name: string;
  companyName: string | null;
  email: string | null;
};

type PeoplePortalAccessPanelProps = {
  customerContacts: DirectoryCustomerContactListItem[];
  portalAccessGrants: PortalAccessGrantListItem[];
  portalProjectAccessByGrantId: Map<string, PortalProjectAccessListItem[]>;
  portalPermissionsByCustomerContactId: Map<string, CustomerContactPortalPermissionListItem>;
  projectsByCustomerId: Map<string, ProjectListItem[]>;
  canManageCustomerContacts: boolean;
  filters?: {
    query?: string;
    customerId?: string;
    accessStatus?: AccessStatusFilter;
    authStatus?: AuthStatusFilter;
    selectedContactId?: string;
    selectedGrantId?: string;
  };
  returnTo?: string;
};

type AccessConsoleRow = {
  key: string;
  kind: "contact" | "legacy_grant";
  customer: AccessCustomerSummary;
  customerContact: DirectoryCustomerContactListItem | null;
  grant: PortalAccessGrantListItem | null;
  storedPortalPermission: CustomerContactPortalPermissionListItem | null;
  projects: ProjectListItem[];
  projectAccess: PortalProjectAccessListItem[];
};

const futurePortalPermissionReadiness = [
  "View estimates",
  "Approve estimates",
  "Sign contracts",
  "Approve change orders",
  "View/pay invoices",
  "Request new quote"
];

const accessStatusFilters: Array<{ key: AccessStatusFilter; label: string }> = [
  { key: "all", label: "All access" },
  { key: "active", label: "Active" },
  { key: "invited", label: "Invited" },
  { key: "revoked", label: "Revoked" },
  { key: "missing_grant", label: "No portal grant" },
  { key: "temp_required", label: "Temp password required" }
];

const authStatusFilters: Array<{ key: AuthStatusFilter; label: string }> = [
  { key: "all", label: "All auth" },
  { key: "linked", label: "Auth linked" },
  { key: "not_linked", label: "Not linked" },
  { key: "email_missing", label: "Missing email" },
  { key: "temp_required", label: "Temp password required" }
];

function formatLabel(value: string | null | undefined, fallback = "Not provided") {
  return value?.replaceAll("_", " ") ?? fallback;
}

function formatDateTime(value: string | null | undefined) {
  return value ? new Date(value).toLocaleString() : null;
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

function getPortalAccessStatusClasses(status: string | null) {
  switch (status) {
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "revoked":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "invited":
      return "border-amber-200 bg-amber-50 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function buildPeopleAccessHref(input: {
  query?: string;
  customerId?: string;
  accessStatus?: string;
  authStatus?: string;
  selectedContactId?: string | null;
  selectedGrantId?: string | null;
}) {
  const searchParams = new URLSearchParams();

  if (input.query?.trim()) {
    searchParams.set("accessQ", input.query.trim());
  }

  if (input.customerId?.trim()) {
    searchParams.set("accessCustomerId", input.customerId.trim());
  }

  if (input.accessStatus && input.accessStatus !== "all") {
    searchParams.set("accessStatus", input.accessStatus);
  }

  if (input.authStatus && input.authStatus !== "all") {
    searchParams.set("authStatus", input.authStatus);
  }

  if (input.selectedContactId) {
    searchParams.set("accessContactId", input.selectedContactId);
  }

  if (input.selectedGrantId) {
    searchParams.set("accessGrantId", input.selectedGrantId);
  }

  const query = searchParams.toString();
  return `${query.length > 0 ? `/people?${query}` : "/people"}#customer-access`;
}

function getContactName(customerContact: DirectoryCustomerContactListItem | null) {
  return customerContact?.contact?.displayName ?? "Customer-level portal grant";
}

function getContactEmail(row: AccessConsoleRow) {
  return row.customerContact?.contact?.email ?? row.grant?.invitedEmail ?? row.grant?.portalUser?.email ?? null;
}

function getAccessLabel(row: AccessConsoleRow) {
  if (!row.grant) {
    return "No portal grant";
  }

  return formatLabel(row.grant.status);
}

function getAuthLabel(row: AccessConsoleRow) {
  if (!getContactEmail(row)) {
    return "Missing email";
  }

  if (!row.grant) {
    return "Not invited";
  }

  if (row.grant.temporaryCredentialRequiresPasswordChange) {
    return "Temp password required";
  }

  if (row.grant.userId) {
    return "Auth linked";
  }

  if (row.grant.status === "invited") {
    return "Invite pending";
  }

  if (row.grant.status === "revoked") {
    return "Access revoked";
  }

  return "Auth not linked";
}

function getProjectAccessCount(row: AccessConsoleRow) {
  return row.projectAccess.filter((access) => access.status === "active").length;
}

function getProjectAccessSummary(row: AccessConsoleRow) {
  return `${getProjectAccessCount(row)} of ${row.projects.length} visible`;
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
      const primaryLabel = customerContact.isPrimary
        ? "Main contact - recommended portal contact"
        : relationshipLabel;

      return {
        id: customerContact.id,
        email: contactEmail || null,
        label: contactEmail
          ? `${contactName} (${contactEmail}) - ${primaryLabel}`
          : `${contactName} - ${primaryLabel}`
      };
    });
}

function findProjectAccess(projectAccess: PortalProjectAccessListItem[], projectId: string) {
  return projectAccess.find((access) => access.projectId === projectId) ?? null;
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
            className="inline-flex rounded-[4px] border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-900"
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
        { label: "Approve change orders", enabled: storedPortalPermission.canApproveChangeOrders },
        { label: "View/pay invoices", enabled: storedPortalPermission.canViewPayInvoices },
        { label: "Request new quote", enabled: storedPortalPermission.canRequestQuotes }
      ].map((permission) => (
        <span
          key={permission.label}
          className={`inline-flex rounded-[4px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${
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

function ContactStatusReason({ row }: { row: AccessConsoleRow }) {
  const email = getContactEmail(row);

  if (!email) {
    return <p>Contact needs an email before portal access or temporary login can be managed.</p>;
  }

  if (!row.grant) {
    return <p>Create portal access for this contact before account help is available.</p>;
  }

  if (row.grant.status === "revoked") {
    return <p>Portal access is revoked. Reactivate access before issuing account help.</p>;
  }

  return <p>Temporary login help is available here when invite or password support is needed.</p>;
}

function buildAccessRows(input: {
  customerContacts: DirectoryCustomerContactListItem[];
  portalAccessGrants: PortalAccessGrantListItem[];
  portalProjectAccessByGrantId: Map<string, PortalProjectAccessListItem[]>;
  portalPermissionsByCustomerContactId: Map<string, CustomerContactPortalPermissionListItem>;
  projectsByCustomerId: Map<string, ProjectListItem[]>;
}) {
  const grantsByCustomerContactId = new Map<string, PortalAccessGrantListItem>();
  const grantsWithoutContact: PortalAccessGrantListItem[] = [];

  for (const grant of input.portalAccessGrants) {
    if (grant.customerContactId) {
      grantsByCustomerContactId.set(grant.customerContactId, grant);
    } else {
      grantsWithoutContact.push(grant);
    }
  }

  const rows: AccessConsoleRow[] = [];

  for (const customerContact of input.customerContacts) {
    if (!customerContact.customer) {
      continue;
    }

    const grant = grantsByCustomerContactId.get(customerContact.id) ?? null;
    const projectAccess = grant
      ? input.portalProjectAccessByGrantId.get(grant.id) ?? []
      : [];

    rows.push({
      key: `contact:${customerContact.id}`,
      kind: "contact",
      customer: customerContact.customer,
      customerContact,
      grant,
      storedPortalPermission:
        input.portalPermissionsByCustomerContactId.get(customerContact.id) ?? null,
      projects: input.projectsByCustomerId.get(customerContact.customerId) ?? [],
      projectAccess
    });
  }

  for (const grant of grantsWithoutContact) {
    if (!grant.customer) {
      continue;
    }

    rows.push({
      key: `grant:${grant.id}`,
      kind: "legacy_grant",
      customer: grant.customer,
      customerContact: null,
      grant,
      storedPortalPermission: null,
      projects: input.projectsByCustomerId.get(grant.customerId) ?? [],
      projectAccess: input.portalProjectAccessByGrantId.get(grant.id) ?? []
    });
  }

  return rows.sort((a, b) => {
    const customerCompare = a.customer.name.localeCompare(b.customer.name);

    if (customerCompare !== 0) {
      return customerCompare;
    }

    return getContactName(a.customerContact).localeCompare(getContactName(b.customerContact));
  });
}

function filterAccessRows(
  rows: AccessConsoleRow[],
  filters: NonNullable<PeoplePortalAccessPanelProps["filters"]>
) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const customerId = filters.customerId?.trim() ?? "";
  const accessStatus = filters.accessStatus ?? "all";
  const authStatus = filters.authStatus ?? "all";

  return rows.filter((row) => {
    const email = getContactEmail(row);
    const searchable = [
      row.customer.name,
      row.customer.companyName ?? "",
      row.customer.email ?? "",
      getContactName(row.customerContact),
      row.customerContact?.contact?.companyName ?? "",
      email ?? "",
      row.customerContact?.contact?.phone ?? "",
      row.grant?.status ?? "",
      row.grant?.portalUser?.email ?? "",
      row.projects.map((project) => project.name).join(" ")
    ]
      .join(" ")
      .toLowerCase();

    if (customerId && row.customer.id !== customerId) {
      return false;
    }

    if (query && !searchable.includes(query)) {
      return false;
    }

    if (accessStatus === "missing_grant" && row.grant) {
      return false;
    }

    if (accessStatus === "temp_required" && !row.grant?.temporaryCredentialRequiresPasswordChange) {
      return false;
    }

    if (
      accessStatus !== "all" &&
      accessStatus !== "missing_grant" &&
      accessStatus !== "temp_required" &&
      row.grant?.status !== accessStatus
    ) {
      return false;
    }

    if (authStatus === "linked" && !row.grant?.userId) {
      return false;
    }

    if (authStatus === "not_linked" && (!row.grant || row.grant.userId)) {
      return false;
    }

    if (authStatus === "email_missing" && email) {
      return false;
    }

    if (authStatus === "temp_required" && !row.grant?.temporaryCredentialRequiresPasswordChange) {
      return false;
    }

    return true;
  });
}

function AccessConsoleRowCard({
  row,
  filters,
  selected
}: {
  row: AccessConsoleRow;
  filters: NonNullable<PeoplePortalAccessPanelProps["filters"]>;
  selected: boolean;
}) {
  const email = getContactEmail(row);
  const manageHref = buildPeopleAccessHref({
    query: filters.query,
    customerId: filters.customerId,
    accessStatus: filters.accessStatus,
    authStatus: filters.authStatus,
    selectedContactId: row.customerContact?.id ?? null,
    selectedGrantId: row.customerContact ? null : row.grant?.id ?? null
  });

  return (
    <article
      className={[
        "grid gap-3 border px-4 py-3 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_120px_120px_auto] md:items-center",
        selected ? "border-[#171717] bg-[#f8f8f8]" : "border-slate-200 bg-white"
      ].join(" ")}
      data-testid="portal-access-console-row"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-950">
            {getContactName(row.customerContact)}
          </h3>
          {row.customerContact?.isPrimary ? (
            <span className="inline-flex rounded-[4px] border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
              Main contact · recommended invite
            </span>
          ) : row.kind === "legacy_grant" ? (
            <span className="inline-flex rounded-[4px] border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-900">
              Legacy grant
            </span>
          ) : null}
        </div>
        <p className="mt-1 break-words text-sm leading-5 text-slate-600">
          {email ?? "Email needed"}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
          Customer
        </p>
        <p className="break-words text-sm font-medium text-slate-800">{row.customer.name}</p>
        <p className="mt-1 break-words text-xs text-slate-500">
          {row.customer.companyName ?? row.customer.email ?? "Customer account"}
        </p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
          Portal
        </p>
        <span
          className={`inline-flex rounded-[4px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getPortalAccessStatusClasses(
            row.grant?.status ?? null
          )}`}
        >
          {getAccessLabel(row)}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
          Projects
        </p>
        <p className="text-sm font-semibold text-slate-950">{getProjectAccessSummary(row)}</p>
      </div>
      <Link
        href={manageHref}
        className={[
          "inline-flex items-center justify-center rounded-[4px] border px-3 py-2 text-sm font-medium transition",
          selected
            ? "border-[#171717] bg-[#171717] text-white"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        ].join(" ")}
      >
        {selected ? "Selected" : "Manage access"}
      </Link>
    </article>
  );
}

function SelectedAccessPanel({
  row,
  allCustomerContacts,
  canManageCustomerContacts,
  closeHref,
  returnTo
}: {
  row: AccessConsoleRow;
  allCustomerContacts: DirectoryCustomerContactListItem[];
  canManageCustomerContacts: boolean;
  closeHref: string;
  returnTo: string;
}) {
  const customerContactOptions = buildCustomerContactOptions(
    allCustomerContacts,
    row.customer.id
  );
  const availableProjects = row.projects
    .filter((project) => !row.projectAccess.some((access) => access.projectId === project.id))
    .map((project) => ({
      id: project.id,
      label: project.name,
      status: project.status
    }));
  const canUseTemporaryCredential =
    canManageCustomerContacts &&
    row.grant &&
    row.grant.status !== "revoked" &&
    row.grant.customerContact &&
    getContactEmail(row);

  return (
    <section
      className="border border-[#171717] bg-white"
      data-testid="portal-access-manage-panel"
    >
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Manage access
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-950">
              {getContactName(row.customerContact)}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {row.customer.name} · {getContactEmail(row) ?? "Email needed"}
            </p>
          </div>
          <Link
            href={closeHref}
            className="inline-flex w-fit items-center rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Close panel
          </Link>
        </div>
      </div>

      <div className="grid gap-5 px-4 py-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] sm:px-5">
        <div className="space-y-4">
          <section className="border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">Contact profile</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {row.customerContact
                    ? formatLabel(row.customerContact.relationshipLabel, "Related contact")
                    : "Legacy customer-level grant"}
                </p>
              </div>
              {row.customerContact && !row.customerContact.isPrimary && canManageCustomerContacts ? (
                <form action={makeCustomerContactPrimaryAction}>
                  <input type="hidden" name="customerId" value={row.customer.id} />
                  <input
                    type="hidden"
                    name="customerContactId"
                    value={row.customerContact.id}
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

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 break-words font-medium text-slate-950">
                  {getContactEmail(row) ?? "Missing"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Phone
                </dt>
                <dd className="mt-1 font-medium text-slate-950">
                  {row.customerContact?.contact?.phone ?? "Missing"}
                </dd>
              </div>
            </dl>

            {row.customerContact && canManageCustomerContacts ? (
              <details className="mt-4 border border-slate-200 bg-slate-50 px-3 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-950">Edit contact</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Expand
                  </span>
                </summary>
                <div className="mt-4">
                  <CustomerContactForm
                    action={updateCustomerContactAction}
                    customerId={row.customer.id}
                    customerContact={row.customerContact}
                    returnTo={returnTo}
                  />
                </div>
              </details>
            ) : null}
          </section>

          <section className="border border-slate-200 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">Account access</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-[4px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${getPortalAccessStatusClasses(
                  row.grant?.status ?? null
                )}`}
              >
                {getAccessLabel(row)}
              </span>
              <span className="inline-flex rounded-[4px] border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                {getAuthLabel(row)}
              </span>
            </div>

            {row.grant ? (
              <div className="mt-4 space-y-3">
                <div className="grid gap-2 text-sm leading-6 text-slate-600">
                  <p>
                    Portal email:{" "}
                    <span className="font-medium text-slate-950">
                      {row.grant.portalUser?.email ?? row.grant.invitedEmail ?? "Not captured"}
                    </span>
                  </p>
                  {row.grant.status === "invited" ? (
                    <p>
                      Customer next step:{" "}
                      <span className="font-medium text-slate-950">
                        Use the invite, then sign up or log in with the invited email.
                      </span>
                    </p>
                  ) : null}
                  {formatDateTime(row.grant.inviteExpiresAt) && row.grant.status === "invited" ? (
                    <p>
                      Invite expires:{" "}
                      <span className="font-medium text-slate-950">
                        {formatDateTime(row.grant.inviteExpiresAt)}
                      </span>
                    </p>
                  ) : null}
                  {formatDateTime(row.grant.inviteAcceptedAt) ? (
                    <p>
                      Invite accepted:{" "}
                      <span className="font-medium text-slate-950">
                        {formatDateTime(row.grant.inviteAcceptedAt)}
                      </span>
                    </p>
                  ) : null}
                  {formatDateTime(row.grant.revokedAt) ? (
                    <p>
                      Revoked:{" "}
                      <span className="font-medium text-slate-950">
                        {formatDateTime(row.grant.revokedAt)}
                      </span>
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {row.grant.status === "revoked" && !row.grant.userId ? (
                    <p className="rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
                      Invite revoked
                    </p>
                  ) : (
                    <form action={updatePortalAccessGrantStatusAction}>
                      <input type="hidden" name="portalAccessGrantId" value={row.grant.id} />
                      <input type="hidden" name="customerId" value={row.customer.id} />
                      <input
                        type="hidden"
                        name="customerContactId"
                        value={row.grant.customerContactId ?? ""}
                      />
                      <input type="hidden" name="userId" value={row.grant.userId ?? ""} />
                      <input
                        type="hidden"
                        name="invitedEmail"
                        value={row.grant.invitedEmail ?? row.grant.portalUser?.email ?? ""}
                      />
                      <input
                        type="hidden"
                        name="status"
                        value={row.grant.status === "revoked" ? "active" : "revoked"}
                      />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <ConfirmSubmitButton
                        message={
                          row.grant.status === "revoked"
                            ? "Reactivate this portal access grant?"
                            : "Revoke this portal access grant? The customer will lose access controlled by this grant until it is reactivated."
                        }
                        className="inline-flex items-center rounded-[4px] border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {row.grant.status === "revoked" ? "Reactivate access" : "Revoke access"}
                      </ConfirmSubmitButton>
                    </form>
                  )}
                </div>

                <PortalInviteEmailStatus
                  action={sendPortalInviteEmailAction}
                  customerId={row.customer.id}
                  portalAccessGrantId={row.grant.id}
                  status={row.grant.status}
                  delivery={row.grant.inviteEmailDelivery}
                  returnTo={returnTo}
                  compact
                />
              </div>
            ) : canManageCustomerContacts ? (
              <details className="mt-4 border border-slate-200 bg-slate-50 px-3 py-3" open>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-950">
                    Invite portal contact
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Required
                  </span>
                </summary>
                <div className="mt-4">
                  {row.customerContact?.isPrimary ? (
                    <p className="mb-4 border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm leading-6 text-emerald-900">
                      This main customer contact is preselected as the recommended portal
                      invite candidate. Access is still granted only when you submit this form.
                    </p>
                  ) : null}
                  <PortalAccessGrantForm
                    action={createPortalAccessGrantAction}
                    customerId={row.customer.id}
                    defaultEmail={getContactEmail(row)}
                    customerContacts={customerContactOptions}
                    defaultCustomerContactId={row.customerContact?.id}
                    projects={row.projects.map((project) => ({
                      id: project.id,
                      label: project.name,
                      status: project.status
                    }))}
                    returnTo={returnTo}
                  />
                </div>
              </details>
            ) : null}

            {row.grant?.userId ? (
              <form
                action={updatePortalAccessGrantLinkAction}
                className="mt-4 grid gap-3 border border-slate-200 bg-slate-50 px-3 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
              >
                <input type="hidden" name="portalAccessGrantId" value={row.grant.id} />
                <input type="hidden" name="customerId" value={row.customer.id} />
                <input type="hidden" name="userId" value={row.grant.userId ?? ""} />
                <input
                  type="hidden"
                  name="invitedEmail"
                  value={row.grant.invitedEmail ?? row.grant.portalUser?.email ?? ""}
                />
                <input type="hidden" name="status" value={row.grant.status} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <label className="block min-w-0">
                  <span className="mb-2 block text-sm font-medium text-slate-800">
                    Link to contact
                  </span>
                  <select
                    name="customerContactId"
                    defaultValue={row.grant.customerContactId ?? ""}
                    className="w-full min-w-0 rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-700"
                  >
                    {!row.grant.customerContactId ? (
                      <option value="">Legacy customer-level grant</option>
                    ) : null}
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
          </section>

          <section className="border border-slate-200 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-slate-950">Account help</p>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              <ContactStatusReason row={row} />
            </div>
            {canUseTemporaryCredential && row.grant ? (
              <div className="mt-3">
                <TemporaryPortalCredentialForm
                  customerId={row.customer.id}
                  portalAccessGrantId={row.grant.id}
                  returnTo={returnTo}
                  hasPortalUser={Boolean(row.grant.userId)}
                />
              </div>
            ) : null}
          </section>
        </div>

        <div className="space-y-4">
          <section className="border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Portal permission profile
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Stored capabilities for this contact.
                </p>
              </div>
              {row.storedPortalPermission ? (
                <p className="text-xs leading-5 text-slate-500">
                  {formatManagementSourceLabel(row.storedPortalPermission.managementSource)}
                </p>
              ) : null}
            </div>

            <div className="mt-3">
              <PermissionBadges storedPortalPermission={row.storedPortalPermission} />
            </div>

            {row.grant?.customerContact ? (
              <form
                action={updateCustomerContactPortalPermissionAction}
                className="mt-4 space-y-4 border border-slate-200 bg-slate-50 px-3 py-3"
              >
                <input type="hidden" name="portalAccessGrantId" value={row.grant.id} />
                <input type="hidden" name="customerId" value={row.customer.id} />
                <input
                  type="hidden"
                  name="customerContactId"
                  value={row.grant.customerContact.id}
                />
                <input type="hidden" name="returnTo" value={returnTo} />
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      name: "canViewEstimates",
                      label: "View estimates",
                      defaultChecked: row.storedPortalPermission?.canViewEstimates ?? true
                    },
                    {
                      name: "canApproveEstimates",
                      label: "Approve estimates",
                      defaultChecked: row.storedPortalPermission?.canApproveEstimates ?? true
                    },
                    {
                      name: "canSignContracts",
                      label: "Sign contracts",
                      defaultChecked: row.storedPortalPermission?.canSignContracts ?? true
                    },
                    {
                      name: "canApproveChangeOrders",
                      label: "Approve change orders",
                      defaultChecked:
                        row.storedPortalPermission?.canApproveChangeOrders ?? true
                    },
                    {
                      name: "canViewPayInvoices",
                      label: "View/pay invoices",
                      defaultChecked: row.storedPortalPermission?.canViewPayInvoices ?? true
                    },
                    {
                      name: "canRequestQuotes",
                      label: "Request new quote",
                      defaultChecked: row.storedPortalPermission?.canRequestQuotes ?? true
                    }
                  ].map((permission) => (
                    <label
                      key={permission.name}
                      className="flex min-w-0 items-center gap-3 border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
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
            ) : (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Stored permissions become editable after this contact is linked to a portal grant.
              </p>
            )}
          </section>

          <section className="border border-slate-200 bg-white px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">Project access</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Explicit project visibility for this customer contact.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-[4px] border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                {getProjectAccessSummary(row)}
              </span>
            </div>

            {row.grant ? (
              <div className="mt-4 space-y-3">
                <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto border border-slate-200">
                  {row.projects.length > 0 ? (
                    row.projects.map((project) => {
                      const access = findProjectAccess(row.projectAccess, project.id);
                      const active = access?.status === "active";

                      return (
                        <div
                          key={project.id}
                          className="grid gap-3 bg-white px-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center"
                        >
                          <div className="min-w-0">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-sm font-semibold text-slate-950 transition hover:text-brand-700"
                            >
                              {project.name}
                            </Link>
                            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                              {formatLabel(project.status)}
                            </p>
                          </div>
                          <span
                            className={[
                              "inline-flex w-fit rounded-[4px] border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                              active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : access?.status === "revoked"
                                  ? "border-slate-200 bg-slate-100 text-slate-700"
                                  : "border-amber-200 bg-amber-50 text-amber-900"
                            ].join(" ")}
                          >
                            {active ? "Granted" : access ? "Revoked" : "Not granted"}
                          </span>
                          {access ? (
                            <form action={updatePortalProjectAccessStatusAction}>
                              <input
                                type="hidden"
                                name="portalProjectAccessId"
                                value={access.id}
                              />
                              <input type="hidden" name="customerId" value={row.customer.id} />
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
                              <ConfirmSubmitButton
                                message={
                                  access.status === "revoked"
                                    ? "Reactivate this project visibility for the portal contact?"
                                    : "Revoke this project visibility? The portal contact will no longer see this project until visibility is reactivated."
                                }
                                className="inline-flex items-center rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                {access.status === "revoked"
                                  ? "Reactivate"
                                  : "Revoke visibility"}
                              </ConfirmSubmitButton>
                            </form>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="px-3 py-3 text-sm leading-6 text-slate-500">
                      No projects exist for this customer yet.
                    </p>
                  )}
                </div>

                {row.grant.customerContactId &&
                !row.grant.customerContact?.isPrimary &&
                row.grant.status !== "revoked" ? (
                  <form
                    action={copyPortalProjectAccessFromPrimaryContactAction}
                    className="flex flex-col gap-3 border border-amber-200 bg-amber-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <input type="hidden" name="customerId" value={row.customer.id} />
                    <input type="hidden" name="portalAccessGrantId" value={row.grant.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <p className="text-sm leading-6 text-amber-950">
                      Adds or reactivates only the projects currently visible to the primary contact.
                    </p>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-[4px] border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
                    >
                      Copy from primary contact
                    </button>
                  </form>
                ) : null}

                {availableProjects.length > 0 && row.grant.status !== "revoked" ? (
                  <details className="border border-slate-200 bg-slate-50 px-3 py-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-950">
                        Add project visibility
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Expand
                      </span>
                    </summary>
                    <div className="mt-4">
                      <PortalProjectAccessForm
                        action={createPortalProjectAccessAction}
                        customerId={row.customer.id}
                        portalAccessGrantId={row.grant.id}
                        projects={availableProjects}
                        returnTo={returnTo}
                      />
                    </div>
                  </details>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Create portal access before assigning project visibility.
              </p>
            )}
          </section>

          {canManageCustomerContacts ? (
            <details className="border border-slate-200 bg-white px-4 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-950">
                  Add another contact for {row.customer.name}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Expand
                </span>
              </summary>
              <div className="mt-4">
                <CustomerContactForm
                  action={createCustomerContactAction}
                  customerId={row.customer.id}
                  returnTo={returnTo}
                />
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function PeoplePortalAccessPanel({
  customerContacts,
  portalAccessGrants,
  portalProjectAccessByGrantId,
  portalPermissionsByCustomerContactId,
  projectsByCustomerId,
  canManageCustomerContacts,
  filters = {},
  returnTo = "/people"
}: PeoplePortalAccessPanelProps) {
  const normalizedFilters = {
    query: filters.query ?? "",
    customerId: filters.customerId ?? "",
    accessStatus: filters.accessStatus ?? "all",
    authStatus: filters.authStatus ?? "all",
    selectedContactId: filters.selectedContactId,
    selectedGrantId: filters.selectedGrantId
  };
  const rows = buildAccessRows({
    customerContacts,
    portalAccessGrants,
    portalProjectAccessByGrantId,
    portalPermissionsByCustomerContactId,
    projectsByCustomerId
  });
  const filteredRows = filterAccessRows(rows, normalizedFilters);
  const selectedRow =
    rows.find((row) =>
      normalizedFilters.selectedContactId
        ? row.customerContact?.id === normalizedFilters.selectedContactId
        : normalizedFilters.selectedGrantId
          ? row.grant?.id === normalizedFilters.selectedGrantId
          : false
    ) ?? null;
  const customers = [...new Map(rows.map((row) => [row.customer.id, row.customer])).values()].sort(
    (a, b) => a.name.localeCompare(b.name)
  );
  const activeGrantCount = rows.filter((row) => row.grant?.status === "active").length;
  const invitedGrantCount = rows.filter((row) => row.grant?.status === "invited").length;
  const tempCredentialCount = rows.filter(
    (row) => row.grant?.temporaryCredentialRequiresPasswordChange
  ).length;
  const missingGrantCount = rows.filter((row) => !row.grant).length;
  const selectedReturnTo = selectedRow
    ? buildPeopleAccessHref({
        query: normalizedFilters.query,
        customerId: normalizedFilters.customerId,
        accessStatus: normalizedFilters.accessStatus,
        authStatus: normalizedFilters.authStatus,
        selectedContactId: selectedRow.customerContact?.id ?? null,
        selectedGrantId: selectedRow.customerContact ? null : selectedRow.grant?.id ?? null
      })
    : returnTo;
  const closePanelHref = buildPeopleAccessHref({
    query: normalizedFilters.query,
    customerId: normalizedFilters.customerId,
    accessStatus: normalizedFilters.accessStatus,
    authStatus: normalizedFilters.authStatus
  });

  return (
    <section id="customer-access" className="border border-[#d6d6d6] bg-white">
      <div className="border-b border-[#e5e5e5] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Portal access console
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              Customer contact access
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Find a customer contact, check portal status, and manage invite, temporary login,
            permissions, and project visibility in one focused panel.
          </p>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Contacts", value: rows.length },
            { label: "Active access", value: activeGrantCount },
            { label: "Invited", value: invitedGrantCount },
            { label: "Needs temp password", value: tempCredentialCount },
            { label: "No portal grant", value: missingGrantCount }
          ].map((metric) => (
            <div key={metric.label} className="border border-slate-200 bg-slate-50 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {metric.label}
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
          {[
            { href: "/people", label: "All records" },
            { href: "/people#customer-access", label: "Portal access" },
            { href: "/directory", label: "Directory index" }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={[
                "inline-flex rounded-[4px] px-3 py-2 text-sm font-medium transition",
                item.label === "Portal access"
                  ? "bg-[#171717] text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <form
          action="/people"
          className="grid gap-3 border border-slate-200 bg-slate-50 px-4 py-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(180px,0.75fr)_minmax(180px,0.75fr)_minmax(180px,0.75fr)_auto]"
          data-testid="portal-access-console-filters"
        >
          <input
            type="search"
            name="accessQ"
            defaultValue={normalizedFilters.query}
            placeholder="Search contact, customer, email, or project"
            className="min-w-0 rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-700"
          />
          <select
            name="accessCustomerId"
            defaultValue={normalizedFilters.customerId}
            className="min-w-0 rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-700"
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <select
            name="accessStatus"
            defaultValue={normalizedFilters.accessStatus}
            className="min-w-0 rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-700"
          >
            {accessStatusFilters.map((statusFilter) => (
              <option key={statusFilter.key} value={statusFilter.key}>
                {statusFilter.label}
              </option>
            ))}
          </select>
          <select
            name="authStatus"
            defaultValue={normalizedFilters.authStatus}
            className="min-w-0 rounded-[4px] border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-700"
          >
            {authStatusFilters.map((statusFilter) => (
              <option key={statusFilter.key} value={statusFilter.key}>
                {statusFilter.label}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[4px] border border-[#171717] bg-[#171717] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2a2a2a]"
            >
              Apply
            </button>
            <Link
              href="/people#customer-access"
              className="inline-flex items-center justify-center rounded-[4px] border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </Link>
          </div>
        </form>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-950">
                {filteredRows.length} contacts and grants visible
              </p>
              <p className="text-sm leading-6 text-slate-500">
                Management opens one contact at a time.
              </p>
            </div>

            {filteredRows.length > 0 ? (
              <div className="grid gap-2">
                {filteredRows.map((row) => (
                  <AccessConsoleRowCard
                    key={row.key}
                    row={row}
                    filters={normalizedFilters}
                    selected={selectedRow?.key === row.key}
                  />
                ))}
              </div>
            ) : (
              <AppEmptyState
                eyebrow="No matching contacts"
                title="Adjust the access filters"
                description="Search by customer, contact, email, status, or project to find the contact you need to manage."
              />
            )}
          </section>

          {selectedRow ? (
            <SelectedAccessPanel
              row={selectedRow}
              allCustomerContacts={customerContacts}
              canManageCustomerContacts={canManageCustomerContacts}
              closeHref={closePanelHref}
              returnTo={selectedReturnTo}
            />
          ) : (
            <AppEmptyState
              eyebrow={rows.length > 0 ? "No contact selected" : "No customer contacts"}
              title={rows.length > 0 ? "Choose a contact to manage" : "Customer contacts will appear here"}
              description={
                rows.length > 0
                  ? "Use Manage access on a row to open invite, temporary login, permissions, and project visibility controls for one contact."
                  : "Create related customer contacts from a customer record first, then manage portal access and project visibility from People."
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
