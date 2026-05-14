export type PrimaryContactSource =
  | "customer_create"
  | "project_inline_customer"
  | "opportunity_conversion"
  | "estimate_customer_start"
  | "portal_fixture";

export type PrimaryContactInput = {
  organizationId: string;
  userId: string;
  customerId: string;
  contactId?: string | null;
  name?: string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  source: PrimaryContactSource;
};

export type PrimaryContactLookup = {
  contactId: string;
  customerContactId?: string | null;
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
  isPrimary?: boolean;
};

export type CustomerContactLinkResult = {
  id: string | null;
  isPrimary: boolean;
};

export type PrimaryCustomerContactRepository = {
  findCustomerContactByEmail(input: {
    organizationId: string;
    customerId: string;
    email: string;
  }): Promise<PrimaryContactLookup | null>;
  findOrganizationContactByEmail(input: {
    organizationId: string;
    email: string;
  }): Promise<PrimaryContactLookup | null>;
  createContact(input: {
    organizationId: string;
    userId: string;
    displayName: string;
    companyName: string | null;
    email: string | null;
    phone: string | null;
    notes: string | null;
  }): Promise<PrimaryContactLookup>;
  upsertCustomerContactLink(input: {
    organizationId: string;
    userId: string;
    customerId: string;
    contactId: string;
    relationshipLabel: string;
    isPrimary: boolean;
  }): Promise<CustomerContactLinkResult>;
};

export type PrimaryCustomerContactResult =
  | {
      outcome: "skipped";
      reason: "missing_person_details";
    }
  | {
      outcome: "created" | "linked" | "existing";
      contactId: string;
      customerContactId: string | null;
      displayName: string;
      companyName: string | null;
      email: string | null;
      phone: string | null;
      relationshipLabel: string;
    };

function trimOptional(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeEmail(value: string | null | undefined) {
  return trimOptional(value)?.toLowerCase() ?? null;
}

function relationshipLabelForSource(source: PrimaryContactSource) {
  switch (source) {
    case "opportunity_conversion":
      return "primary_opportunity_contact";
    case "project_inline_customer":
      return "primary_project_contact";
    case "estimate_customer_start":
      return "primary_estimate_contact";
    case "portal_fixture":
      return "primary_portal_fixture_contact";
    case "customer_create":
    default:
      return "primary_customer_contact";
  }
}

function buildDisplayName(input: PrimaryContactInput) {
  return (
    trimOptional(input.name) ??
    normalizeEmail(input.email) ??
    trimOptional(input.phone)
  );
}

async function linkPrimaryContact(input: {
  candidate: PrimaryContactLookup;
  normalized: NormalizedPrimaryContactInput;
  relationshipLabel: string;
  repository: PrimaryCustomerContactRepository;
  outcome: "linked" | "existing";
}): Promise<PrimaryCustomerContactResult> {
  const link = await input.repository.upsertCustomerContactLink({
    organizationId: input.normalized.organizationId,
    userId: input.normalized.userId,
    customerId: input.normalized.customerId,
    contactId: input.candidate.contactId,
    relationshipLabel: input.relationshipLabel,
    isPrimary: true
  });

  return {
    outcome: input.outcome,
    contactId: input.candidate.contactId,
    customerContactId: link.id ?? input.candidate.customerContactId ?? null,
    displayName: input.candidate.displayName,
    companyName: input.candidate.companyName,
    email: input.candidate.email,
    phone: input.candidate.phone,
    relationshipLabel: input.relationshipLabel
  };
}

type NormalizedPrimaryContactInput = PrimaryContactInput & {
  displayName: string;
  companyName: string | null;
  email: string | null;
  phone: string | null;
};

export async function ensurePrimaryCustomerContactWithRepository(
  input: PrimaryContactInput,
  repository: PrimaryCustomerContactRepository
): Promise<PrimaryCustomerContactResult> {
  const displayName = buildDisplayName(input);
  const email = normalizeEmail(input.email);
  const phone = trimOptional(input.phone);
  const companyName = trimOptional(input.companyName);

  if (!displayName && !email && !phone) {
    return {
      outcome: "skipped",
      reason: "missing_person_details"
    };
  }

  const normalized: NormalizedPrimaryContactInput = {
    ...input,
    displayName: displayName ?? "Customer contact",
    companyName,
    email,
    phone
  };
  const relationshipLabel = relationshipLabelForSource(input.source);

  if (input.contactId) {
    return linkPrimaryContact({
      candidate: {
        contactId: input.contactId,
        displayName: normalized.displayName,
        companyName: normalized.companyName,
        email: normalized.email,
        phone: normalized.phone
      },
      normalized,
      relationshipLabel,
      repository,
      outcome: "linked"
    });
  }

  if (email) {
    const customerContact = await repository.findCustomerContactByEmail({
      organizationId: normalized.organizationId,
      customerId: normalized.customerId,
      email
    });

    if (customerContact) {
      return linkPrimaryContact({
        candidate: customerContact,
        normalized,
        relationshipLabel,
        repository,
        outcome: "existing"
      });
    }

    const organizationContact = await repository.findOrganizationContactByEmail({
      organizationId: normalized.organizationId,
      email
    });

    if (organizationContact) {
      return linkPrimaryContact({
        candidate: organizationContact,
        normalized,
        relationshipLabel,
        repository,
        outcome: "linked"
      });
    }
  }

  const created = await repository.createContact({
    organizationId: normalized.organizationId,
    userId: normalized.userId,
    displayName: normalized.displayName,
    companyName: normalized.companyName,
    email: normalized.email,
    phone: normalized.phone,
    notes: null
  });

  const link = await repository.upsertCustomerContactLink({
    organizationId: normalized.organizationId,
    userId: normalized.userId,
    customerId: normalized.customerId,
    contactId: created.contactId,
    relationshipLabel,
    isPrimary: true
  });

  return {
    outcome: "created",
    contactId: created.contactId,
    customerContactId: link.id,
    displayName: created.displayName,
    companyName: created.companyName,
    email: created.email,
    phone: created.phone,
    relationshipLabel
  };
}
