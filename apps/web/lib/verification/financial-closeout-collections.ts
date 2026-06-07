export type FinancialCloseoutBoundaryInput = {
  canonicalSources: string[];
  addedTables?: string[];
  migrationFiles?: string[];
  providerChanges?: string[];
  accountingReplacementModules?: string[];
};

export type FinancialCloseoutBoundaryFinding = {
  id: string;
  status: "pass" | "fail";
  message: string;
};

export type FinancialCloseoutBoundarySummary = {
  status: "verified" | "blocked";
  findings: FinancialCloseoutBoundaryFinding[];
};

const requiredCanonicalSources = [
  "invoices",
  "payments",
  "payment_events"
] as const;

const duplicateFinancialModels = [
  "collections",
  "collection_tasks",
  "accounts_receivable",
  "ar_items",
  "payment_states",
  "payment_attempts",
  "invoice_payments",
  "billing_events"
];

const accountingReplacementNames = [
  "general_ledger",
  "ledger_entries",
  "chart_of_accounts",
  "journal_entries",
  "accounting_exports"
];

function includesSource(values: string[], source: string) {
  return values.some((value) => value.toLowerCase() === source);
}

function matchingForbidden(values: string[], forbidden: string[]) {
  const normalized = values.map((value) => value.toLowerCase());

  return forbidden.filter((name) => normalized.includes(name));
}

export function verifyFinancialCloseoutCollectionsBoundary(
  input: FinancialCloseoutBoundaryInput
): FinancialCloseoutBoundarySummary {
  const findings: FinancialCloseoutBoundaryFinding[] = [];
  const canonicalSources = input.canonicalSources.map((source) =>
    source.toLowerCase()
  );
  const missingSources = requiredCanonicalSources.filter(
    (source) => !includesSource(canonicalSources, source)
  );
  const duplicateModels = matchingForbidden(
    input.addedTables ?? [],
    duplicateFinancialModels
  );
  const accountingReplacements = matchingForbidden(
    input.accountingReplacementModules ?? [],
    accountingReplacementNames
  );

  findings.push({
    id: "canonical-financial-sources",
    status: missingSources.length === 0 ? "pass" : "fail",
    message:
      missingSources.length === 0
        ? "Financial closeout reads canonical invoices, payments, and payment events."
        : `Missing canonical source coverage: ${missingSources.join(", ")}.`
  });
  findings.push({
    id: "no-duplicate-financial-models",
    status: duplicateModels.length === 0 ? "pass" : "fail",
    message:
      duplicateModels.length === 0
        ? "No duplicate invoice, payment, AR, or collection tables are introduced."
        : `Duplicate financial model detected: ${duplicateModels.join(", ")}.`
  });
  findings.push({
    id: "no-accounting-replacement",
    status: accountingReplacements.length === 0 ? "pass" : "fail",
    message:
      accountingReplacements.length === 0
        ? "No general-ledger or accounting replacement module is introduced."
        : `Accounting replacement surface detected: ${accountingReplacements.join(", ")}.`
  });
  findings.push({
    id: "no-financial-schema-drift",
    status: (input.migrationFiles ?? []).length === 0 ? "pass" : "fail",
    message:
      (input.migrationFiles ?? []).length === 0
        ? "No migrations are required for the approved visibility-only wave."
        : `Unexpected migration file detected: ${(input.migrationFiles ?? []).join(", ")}.`
  });
  findings.push({
    id: "no-provider-changes",
    status: (input.providerChanges ?? []).length === 0 ? "pass" : "fail",
    message:
      (input.providerChanges ?? []).length === 0
        ? "Payment provider behavior remains unchanged."
        : `Unexpected payment provider change detected: ${(input.providerChanges ?? []).join(", ")}.`
  });

  return {
    status: findings.some((finding) => finding.status === "fail")
      ? "blocked"
      : "verified",
    findings
  };
}
