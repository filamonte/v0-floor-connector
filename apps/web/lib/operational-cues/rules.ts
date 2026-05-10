import "server-only";

import type {
  OperationalCueKey,
  OperationalCueOwnerStrategy,
  OperationalCueSubjectType,
  OperationalCueUrgency
} from "@floorconnector/types";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  isOperationalCueUrgency,
  isSupportedOperationalCueKey,
  operationalCueRuleDefinitions
} from "./rule-definitions";
import type { OperationalCueRule } from "./types";

type OperationalCueRuleRow = {
  id: string;
  organization_id: string;
  cue_key: OperationalCueKey;
  subject_type: OperationalCueSubjectType;
  enabled: boolean;
  threshold_days: number | null;
  urgency: OperationalCueUrgency;
  owner_strategy: OperationalCueOwnerStrategy;
  escalation_days: number | null;
  created_at: string;
  updated_at: string;
};

type DefaultOperationalCueRule = {
  cueKey: OperationalCueKey;
  subjectType: OperationalCueSubjectType;
  enabled: boolean;
  thresholdDays: number;
  urgency: OperationalCueUrgency;
  ownerStrategy: OperationalCueOwnerStrategy;
  escalationDays: number | null;
};

export const DEFAULT_OPERATIONAL_CUE_RULES: DefaultOperationalCueRule[] = [
  {
    cueKey: "estimate_sent_followup",
    subjectType: "estimate",
    enabled: true,
    thresholdDays: 3,
    urgency: "high",
    ownerStrategy: "estimator",
    escalationDays: null
  },
  {
    cueKey: "contract_sent_unsigned",
    subjectType: "contract",
    enabled: true,
    thresholdDays: 3,
    urgency: "normal",
    ownerStrategy: "project_manager",
    escalationDays: null
  },
  {
    cueKey: "contract_viewed_unsigned",
    subjectType: "contract",
    enabled: true,
    thresholdDays: 2,
    urgency: "high",
    ownerStrategy: "project_manager",
    escalationDays: null
  },
  {
    cueKey: "invoice_overdue",
    subjectType: "invoice",
    enabled: true,
    thresholdDays: 1,
    urgency: "high",
    ownerStrategy: "billing_owner",
    escalationDays: null
  },
  {
    cueKey: "deposit_invoice_unpaid",
    subjectType: "invoice",
    enabled: true,
    thresholdDays: 3,
    urgency: "high",
    ownerStrategy: "billing_owner",
    escalationDays: null
  },
  {
    cueKey: "job_ready_unscheduled",
    subjectType: "job",
    enabled: true,
    thresholdDays: 1,
    urgency: "high",
    ownerStrategy: "scheduler",
    escalationDays: null
  },
  {
    cueKey: "job_scheduled_missing_crew",
    subjectType: "job",
    enabled: true,
    thresholdDays: 2,
    urgency: "high",
    ownerStrategy: "scheduler",
    escalationDays: null
  }
];

function isOperationalCueRuleRow(value: unknown): value is OperationalCueRuleRow {
  if (!value || typeof value !== "object") {
    return false;
  }

  const row = value as Partial<OperationalCueRuleRow>;

  return (
    typeof row.id === "string" &&
    typeof row.organization_id === "string" &&
    typeof row.cue_key === "string" &&
    typeof row.subject_type === "string" &&
    typeof row.enabled === "boolean" &&
    (row.threshold_days === null || typeof row.threshold_days === "number") &&
    typeof row.urgency === "string" &&
    typeof row.owner_strategy === "string" &&
    (row.escalation_days === null || typeof row.escalation_days === "number") &&
    typeof row.created_at === "string" &&
    typeof row.updated_at === "string"
  );
}

function isOperationalCueRuleRowArray(value: unknown): value is OperationalCueRuleRow[] {
  return Array.isArray(value) && value.every((row) => isOperationalCueRuleRow(row));
}

function mapOperationalCueRule(row: OperationalCueRuleRow): OperationalCueRule {
  return {
    id: row.id,
    organizationId: row.organization_id,
    cueKey: row.cue_key,
    subjectType: row.subject_type,
    enabled: row.enabled,
    thresholdDays: row.threshold_days,
    urgency: row.urgency,
    ownerStrategy: row.owner_strategy,
    escalationDays: row.escalation_days,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function ensureDefaultOperationalCueRules(input: {
  organizationId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const response = await supabase
    .from("organization_operational_cue_rules")
    .upsert(
      DEFAULT_OPERATIONAL_CUE_RULES.map((rule) => ({
        organization_id: input.organizationId,
        cue_key: rule.cueKey,
        subject_type: rule.subjectType,
        enabled: rule.enabled,
        threshold_days: rule.thresholdDays,
        urgency: rule.urgency,
        owner_strategy: rule.ownerStrategy,
        escalation_days: rule.escalationDays
      })),
      {
        onConflict: "organization_id,cue_key",
        ignoreDuplicates: true
      }
    )
    .select(
      "id, organization_id, cue_key, subject_type, enabled, threshold_days, urgency, owner_strategy, escalation_days, created_at, updated_at"
    );
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(
      `Unable to ensure operational cue rules: ${response.error.message}`
    );
  }

  if (!isOperationalCueRuleRowArray(data)) {
    return [];
  }

  return data.map(mapOperationalCueRule);
}

export async function listOperationalCueRules(organizationId: string) {
  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("organization_operational_cue_rules")
    .select(
      "id, organization_id, cue_key, subject_type, enabled, threshold_days, urgency, owner_strategy, escalation_days, created_at, updated_at"
    )
    .eq("organization_id", organizationId)
    .order("cue_key", { ascending: true });
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to load operational cue rules: ${response.error.message}`);
  }

  if (!isOperationalCueRuleRowArray(data)) {
    return [];
  }

  return data.map(mapOperationalCueRule);
}

export async function listOperationalCueRulesForSettings(organizationId: string) {
  await ensureDefaultOperationalCueRules({ organizationId });

  const rules = await listOperationalCueRules(organizationId);
  const rulesByKey = new Map(rules.map((rule) => [rule.cueKey, rule]));

  return operationalCueRuleDefinitions
    .map((definition) => rulesByKey.get(definition.cueKey))
    .filter((rule): rule is OperationalCueRule => Boolean(rule));
}

export async function updateOperationalCueRule(input: {
  organizationId: string;
  cueKey: string;
  enabled: boolean;
  thresholdDays: number | null;
  urgency: string;
}) {
  if (!isSupportedOperationalCueKey(input.cueKey)) {
    throw new Error("Unsupported operational cue rule.");
  }

  if (!isOperationalCueUrgency(input.urgency)) {
    throw new Error("Unsupported operational cue urgency.");
  }

  await ensureDefaultOperationalCueRules({ organizationId: input.organizationId });

  const supabase = await getSupabaseServerClient();
  const response = await supabase
    .from("organization_operational_cue_rules")
    .update({
      enabled: input.enabled,
      threshold_days: input.thresholdDays,
      urgency: input.urgency,
      updated_at: new Date().toISOString()
    })
    .eq("organization_id", input.organizationId)
    .eq("cue_key", input.cueKey)
    .select(
      "id, organization_id, cue_key, subject_type, enabled, threshold_days, urgency, owner_strategy, escalation_days, created_at, updated_at"
    )
    .single();
  const data: unknown = response.data;

  if (response.error) {
    throw new Error(`Unable to update operational cue rule: ${response.error.message}`);
  }

  if (!isOperationalCueRuleRow(data)) {
    throw new Error("Operational cue rule update returned an unexpected response.");
  }

  return mapOperationalCueRule(data);
}
