export type CustomerPortalContactCandidate = {
  id: string;
  isPrimary?: boolean | null;
  contact?: {
    displayName?: string | null;
    email?: string | null;
  } | null;
};

export type CustomerPortalGrantSummaryInput = {
  id: string;
  customerContactId?: string | null;
  status: "active" | "invited" | "revoked";
  invitedEmail?: string | null;
  userId?: string | null;
};

export type CustomerPortalProjectAccessSummaryInput = {
  status: "active" | "revoked";
};

export type RecommendedPortalContact = {
  id: string;
  label: string;
  email: string;
  isPrimary: boolean;
};

export type CustomerPortalAccessSummary = {
  recommendedContact: RecommendedPortalContact | null;
  statusLabel: "No portal invite" | "Pending invite" | "Active access" | "Revoked access";
  statusDescription: string;
  activeGrantCount: number;
  invitedGrantCount: number;
  revokedGrantCount: number;
  activeSharedProjectCount: number;
  canInviteRecommendedContact: boolean;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase() ?? "";

  return email.length > 0 ? email : null;
}

function getContactDisplayName(contact: CustomerPortalContactCandidate) {
  return contact.contact?.displayName?.trim() || "Customer contact";
}

export function selectRecommendedPortalContact(
  contacts: CustomerPortalContactCandidate[]
): RecommendedPortalContact | null {
  const contactsWithEmail = contacts
    .map((contact) => ({
      contact,
      email: normalizeEmail(contact.contact?.email)
    }))
    .filter((candidate): candidate is { contact: CustomerPortalContactCandidate; email: string } =>
      Boolean(candidate.email)
    );

  const recommended =
    contactsWithEmail.find((candidate) => Boolean(candidate.contact.isPrimary)) ??
    contactsWithEmail[0] ??
    null;

  if (!recommended) {
    return null;
  }

  return {
    id: recommended.contact.id,
    label: getContactDisplayName(recommended.contact),
    email: recommended.email,
    isPrimary: Boolean(recommended.contact.isPrimary)
  };
}

export function buildCustomerPortalAccessSummary(input: {
  contacts: CustomerPortalContactCandidate[];
  grants: CustomerPortalGrantSummaryInput[];
  projectAccessByGrantId: Map<string, CustomerPortalProjectAccessSummaryInput[]>;
}): CustomerPortalAccessSummary {
  const activeGrantCount = input.grants.filter((grant) => grant.status === "active").length;
  const invitedGrantCount = input.grants.filter((grant) => grant.status === "invited").length;
  const revokedGrantCount = input.grants.filter((grant) => grant.status === "revoked").length;
  const activeSharedProjectCount = input.grants.reduce((count, grant) => {
    const projectAccess = input.projectAccessByGrantId.get(grant.id) ?? [];

    return count + projectAccess.filter((access) => access.status === "active").length;
  }, 0);

  const statusLabel =
    activeGrantCount > 0
      ? "Active access"
      : invitedGrantCount > 0
        ? "Pending invite"
        : revokedGrantCount > 0
          ? "Revoked access"
          : "No portal invite";

  const statusDescription =
    activeGrantCount + invitedGrantCount + revokedGrantCount > 0
      ? [
          pluralize(activeGrantCount, "active portal contact"),
          pluralize(invitedGrantCount, "pending invite"),
          pluralize(revokedGrantCount, "revoked grant")
        ].join(", ")
      : "No portal invite has been created for this customer yet";
  const recommendedContact = selectRecommendedPortalContact(input.contacts);

  return {
    recommendedContact,
    statusLabel,
    statusDescription,
    activeGrantCount,
    invitedGrantCount,
    revokedGrantCount,
    activeSharedProjectCount,
    canInviteRecommendedContact: Boolean(recommendedContact)
  };
}
