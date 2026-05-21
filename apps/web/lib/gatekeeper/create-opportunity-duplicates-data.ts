import "server-only";

import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import { requireAuthenticatedUser } from "@/lib/auth/session";
import { getActiveOrganizationContext } from "@/lib/organizations/active-context";
import { getSupabaseServerClient } from "@/lib/supabase/server";

import { buildGateKeeperExecutionIdempotencyKey } from "./execution-ledger";
import {
  buildGateKeeperCreateOpportunityDuplicatePreview,
  getGateKeeperCreateOpportunityDuplicateDraft,
  normalizeGateKeeperDuplicateEmail,
  normalizeGateKeeperDuplicateName,
  normalizeGateKeeperDuplicatePhone,
  type GateKeeperCreateOpportunityDuplicateCandidate,
  type GateKeeperCreateOpportunityDuplicatePreview
} from "./create-opportunity-duplicates";
import type { GateKeeperCreateOpportunityConfirmationDraft } from "./create-opportunity-confirmation";

type OpportunityCandidateRow = {
  id: string;
  title: string;
  status: string;
  prospect_name: string;
  email: string | null;
  phone: string | null;
  service_type: string | null;
  job_type: string | null;
  site_name: string | null;
  address_line_1: string | null;
  created_at: string;
  updated_at: string;
};

type CustomerCandidateRow = {
  id: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  created_at: string;
  updated_at: string;
};

type ContactCandidateRow = {
  id: string;
  display_name: string;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  contact_kind: string;
  created_at: string;
  updated_at: string;
};

type ExecutionAttemptCandidateRow = {
  id: string;
  action_type: string;
  status: string;
  idempotency_key: string;
  proposed_payload_snapshot: Record<string, unknown> | null;
  result_subject_type: string | null;
  result_subject_id: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseQuery<T> = PromiseLike<{
  data: T[] | null;
  error: { message: string } | null;
}>;

const OPEN_OPPORTUNITY_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "site_assessment_scheduled",
  "site_assessment_complete",
  "estimating",
  "proposal_sent"
] as const;

function sanitizeLikeTerm(value: string) {
  return value.replace(/[%_\\]/g, "").trim();
}

function valueFromPayload(
  payload: Record<string, unknown> | null,
  keys: string[]
) {
  for (const key of keys) {
    const value = payload?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function uniqueCandidates(
  candidates: GateKeeperCreateOpportunityDuplicateCandidate[]
) {
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    const key = `${candidate.matchType}:${candidate.id}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function mapOpportunityCandidate(
  row: OpportunityCandidateRow
): GateKeeperCreateOpportunityDuplicateCandidate {
  return {
    id: row.id,
    matchType: "opportunity",
    displayLabel: row.title || row.prospect_name,
    email: row.email,
    phone: row.phone,
    name: row.prospect_name,
    service: row.service_type ?? row.job_type,
    locationText: row.site_name ?? row.address_line_1,
    status: row.status,
    href: `/leads/${row.id}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reasonHints: OPEN_OPPORTUNITY_STATUSES.includes(
      row.status as (typeof OPEN_OPPORTUNITY_STATUSES)[number]
    )
      ? ["Open opportunity candidate"]
      : []
  };
}

function mapCustomerCandidate(
  row: CustomerCandidateRow
): GateKeeperCreateOpportunityDuplicateCandidate {
  return {
    id: row.id,
    matchType: "customer",
    displayLabel: row.company_name
      ? `${row.name} (${row.company_name})`
      : row.name,
    email: row.email,
    phone: row.phone,
    name: row.name,
    locationText: row.address_line_1,
    status: "customer",
    href: `/customers/${row.id}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapContactCandidate(
  row: ContactCandidateRow
): GateKeeperCreateOpportunityDuplicateCandidate {
  return {
    id: row.id,
    matchType: "contact",
    displayLabel: row.company_name
      ? `${row.display_name} (${row.company_name})`
      : row.display_name,
    email: row.email,
    phone: row.phone,
    name: row.display_name,
    status: row.contact_kind,
    href: `/people?personId=${row.id}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapExecutionAttemptCandidate(
  row: ExecutionAttemptCandidateRow
): GateKeeperCreateOpportunityDuplicateCandidate {
  const payload = row.proposed_payload_snapshot;

  return {
    id: row.id,
    matchType: "execution_attempt",
    displayLabel:
      row.result_subject_type && row.result_subject_id
        ? `${row.status} ${row.result_subject_type} ${row.result_subject_id.slice(0, 8)}`
        : `${row.status} GateKeeper execution attempt`,
    email: valueFromPayload(payload, [
      "customerEmail",
      "email",
      "contactEmail"
    ]),
    phone: valueFromPayload(payload, [
      "customerPhone",
      "contactPhone",
      "phone",
      "phoneNumber"
    ]),
    name: valueFromPayload(payload, ["customerName", "contactName", "name"]),
    service: valueFromPayload(payload, ["requestedService", "serviceType"]),
    locationText: valueFromPayload(payload, [
      "address",
      "addressText",
      "location"
    ]),
    status: row.status,
    href:
      row.result_subject_type === "opportunity" && row.result_subject_id
        ? `/leads/${row.result_subject_id}`
        : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reasonHints: ["GateKeeper execution ledger candidate"]
  };
}

async function requireDuplicatePreviewScope() {
  const user = await requireAuthenticatedUser("/gatekeeper");
  const organizationContext = await getActiveOrganizationContext(user.id);

  if (!organizationContext) {
    throw new Error(
      "No active organization is available for GateKeeper duplicate detection."
    );
  }

  return {
    organizationId: organizationContext.organization.id
  };
}

export async function getGateKeeperCreateOpportunityDuplicatePreview(input: {
  suggestion: Pick<
    GateKeeperActionSuggestion,
    "id" | "proposedPayload" | "suggestionType"
  >;
}): Promise<GateKeeperCreateOpportunityDuplicatePreview> {
  const draft = getGateKeeperCreateOpportunityDuplicateDraft(input.suggestion);

  if (input.suggestion.suggestionType !== "create_opportunity") {
    return buildGateKeeperCreateOpportunityDuplicatePreview({
      candidates: [],
      draft
    });
  }

  return getGateKeeperCreateOpportunityDuplicatePreviewForDraft({
    draft,
    suggestionId: input.suggestion.id
  });
}

export async function getGateKeeperCreateOpportunityDuplicatePreviewForDraft(input: {
  draft: GateKeeperCreateOpportunityConfirmationDraft;
  excludeExecutionAttemptId?: string;
  suggestionId: string;
}): Promise<GateKeeperCreateOpportunityDuplicatePreview> {
  const draft = input.draft;
  const email = normalizeGateKeeperDuplicateEmail(draft.email);
  const phone = normalizeGateKeeperDuplicatePhone(draft.phone);
  const name = sanitizeLikeTerm(
    normalizeGateKeeperDuplicateName(draft.contactName)
  );
  const scope = await requireDuplicatePreviewScope();
  const supabase = await getSupabaseServerClient();
  const opportunityQueries: SupabaseQuery<OpportunityCandidateRow>[] = [];
  const customerQueries: SupabaseQuery<CustomerCandidateRow>[] = [];
  const contactQueries: SupabaseQuery<ContactCandidateRow>[] = [];

  if (email) {
    opportunityQueries.push(
      supabase
        .from("opportunities")
        .select(
          "id, title, status, prospect_name, email, phone, service_type, job_type, site_name, address_line_1, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .ilike("email", email)
        .limit(8)
    );
    customerQueries.push(
      supabase
        .from("customers")
        .select(
          "id, name, company_name, email, phone, address_line_1, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .ilike("email", email)
        .limit(8)
    );
    contactQueries.push(
      supabase
        .from("contacts")
        .select(
          "id, display_name, company_name, email, phone, contact_kind, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .ilike("email", email)
        .limit(8)
    );
  }

  if (name) {
    opportunityQueries.push(
      supabase
        .from("opportunities")
        .select(
          "id, title, status, prospect_name, email, phone, service_type, job_type, site_name, address_line_1, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .ilike("prospect_name", `%${name}%`)
        .limit(8)
    );
    customerQueries.push(
      supabase
        .from("customers")
        .select(
          "id, name, company_name, email, phone, address_line_1, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .ilike("name", `%${name}%`)
        .limit(8)
    );
    contactQueries.push(
      supabase
        .from("contacts")
        .select(
          "id, display_name, company_name, email, phone, contact_kind, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .ilike("display_name", `%${name}%`)
        .limit(8)
    );
  }

  if (phone) {
    opportunityQueries.push(
      supabase
        .from("opportunities")
        .select(
          "id, title, status, prospect_name, email, phone, service_type, job_type, site_name, address_line_1, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .not("phone", "is", null)
        .order("updated_at", { ascending: false })
        .limit(120)
    );
    customerQueries.push(
      supabase
        .from("customers")
        .select(
          "id, name, company_name, email, phone, address_line_1, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .not("phone", "is", null)
        .order("updated_at", { ascending: false })
        .limit(120)
    );
    contactQueries.push(
      supabase
        .from("contacts")
        .select(
          "id, display_name, company_name, email, phone, contact_kind, created_at, updated_at"
        )
        .eq("company_id", scope.organizationId)
        .not("phone", "is", null)
        .order("updated_at", { ascending: false })
        .limit(120)
    );
  }

  const idempotencyKeys = [
    buildGateKeeperExecutionIdempotencyKey({
      actionType: "create_opportunity",
      suggestionId: input.suggestionId
    }),
    buildGateKeeperExecutionIdempotencyKey({
      actionType: "create_opportunity",
      purpose: "create_opportunity_confirmation_draft",
      suggestionId: input.suggestionId
    })
  ];
  let executionAttemptsQuery = supabase
    .from("gatekeeper_execution_attempts")
    .select(
      "id, action_type, status, idempotency_key, proposed_payload_snapshot, result_subject_type, result_subject_id, created_at, updated_at"
    )
    .eq("company_id", scope.organizationId)
    .eq("action_type", "create_opportunity")
    .in("idempotency_key", idempotencyKeys)
    .limit(5);

  if (input.excludeExecutionAttemptId) {
    executionAttemptsQuery = executionAttemptsQuery.neq(
      "id",
      input.excludeExecutionAttemptId
    );
  }

  const [
    opportunityResponses,
    customerResponses,
    contactResponses,
    executionAttemptsResponse
  ] = await Promise.all([
    Promise.all(opportunityQueries),
    Promise.all(customerQueries),
    Promise.all(contactQueries),
    executionAttemptsQuery
  ]);
  const responses = [
    ...opportunityResponses,
    ...customerResponses,
    ...contactResponses,
    executionAttemptsResponse
  ];
  const error = responses.find((response) => response.error)?.error;

  if (error) {
    throw new Error(
      `Unable to load GateKeeper duplicate preview: ${error.message}`
    );
  }

  const opportunityCandidates = opportunityResponses
    .flatMap((response) => response.data ?? [])
    .map(mapOpportunityCandidate);
  const customerCandidates = customerResponses
    .flatMap((response) => response.data ?? [])
    .map(mapCustomerCandidate);
  const contactCandidates = contactResponses
    .flatMap((response) => response.data ?? [])
    .map(mapContactCandidate);
  const executionCandidates = (
    (executionAttemptsResponse.data as ExecutionAttemptCandidateRow[] | null) ??
    []
  ).map(mapExecutionAttemptCandidate);

  return buildGateKeeperCreateOpportunityDuplicatePreview({
    candidates: uniqueCandidates([
      ...opportunityCandidates,
      ...customerCandidates,
      ...contactCandidates,
      ...executionCandidates
    ]),
    draft
  });
}

export async function getGateKeeperCreateOpportunityDuplicatePreviews(input: {
  suggestions: GateKeeperActionSuggestion[];
}) {
  const entries = await Promise.all(
    input.suggestions
      .filter(
        (suggestion) => suggestion.suggestionType === "create_opportunity"
      )
      .map(
        async (suggestion) =>
          [
            suggestion.id,
            await getGateKeeperCreateOpportunityDuplicatePreview({ suggestion })
          ] as const
      )
  );

  return new Map(entries);
}
