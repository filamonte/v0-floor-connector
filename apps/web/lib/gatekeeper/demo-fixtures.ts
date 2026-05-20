import type { GateKeeperManualSeedSuggestionDraft } from "./manual-seed";
import {
  buildGateKeeperManualSeedPlan,
  buildGateKeeperManualSeedPlanForOrganization,
  type GateKeeperManualSeedInput,
  type GateKeeperManualSeedPlan
} from "./manual-seed";

export type GateKeeperDemoFixtureKey =
  | "new_flooring_inquiry"
  | "existing_customer_scheduling_request"
  | "missed_call_voicemail_follow_up"
  | "internal_workflow_note";

export type GateKeeperDemoFixture = {
  key: GateKeeperDemoFixtureKey;
  title: string;
  description: string;
  input: GateKeeperManualSeedInput;
  extraSuggestions?: GateKeeperManualSeedSuggestionDraft[];
};

export const gateKeeperDemoFixtures: readonly GateKeeperDemoFixture[] = [
  {
    key: "new_flooring_inquiry",
    title: "New flooring inquiry",
    description:
      "Inbound garage epoxy inquiry with contact details, requested service, and site-visit timing.",
    input: {
      sourceType: "phone_call",
      body: "Demo call: Jordan Taylor called about installing a flake epoxy system in a two-car garage. They want a durable finish before moving into the home and asked whether someone could come out next Thursday afternoon.",
      customerName: "Jordan Taylor",
      customerPhone: "555-0142",
      customerEmail: "jordan.demo@example.com",
      requestedService: "Two-car garage flake epoxy system",
      requestedAppointment: "Next Thursday afternoon",
      notes:
        "Demo-only fixture. Caller asked about durability, prep timing, and approximate schedule."
    }
  },
  {
    key: "existing_customer_scheduling_request",
    title: "Existing customer scheduling request",
    description:
      "Customer asks to confirm or move an onsite visit without changing the real schedule.",
    input: {
      sourceType: "customer_conversation",
      body: "Demo conversation: Existing customer asked whether the onsite visit can move from Tuesday morning to Wednesday after lunch because the garage will be accessible then.",
      requestedAppointment: "Move onsite visit to Wednesday after lunch",
      notes:
        "Demo-only fixture. This should prepare a scheduling review suggestion only."
    }
  },
  {
    key: "missed_call_voicemail_follow_up",
    title: "Missed call / voicemail follow-up",
    description:
      "Voicemail asking for a callback, creating reviewable follow-up only.",
    input: {
      sourceType: "voicemail",
      body: "Demo voicemail: Caller said they missed our call and asked for a callback today after 3 PM. They did not leave enough detail to safely create a full opportunity.",
      notes:
        "Callback requested today after 3 PM. Demo-only fixture. The right next step is human follow-up review, not an outgoing message."
    },
    extraSuggestions: [
      {
        suggestionType: "send_followup_later",
        title: "Review voicemail callback request",
        rationale:
          "Demo voicemail requested a callback. Review before sending or logging any outbound follow-up.",
        proposedPayload: {
          requestedFollowUp: "Callback requested today after 3 PM",
          sourceType: "voicemail",
          reviewOnly: true,
          demoFixture: true
        }
      }
    ]
  },
  {
    key: "internal_workflow_note",
    title: "Internal workflow note",
    description:
      "Contractor note that flags estimate review without mutating the estimate.",
    input: {
      sourceType: "internal_note",
      body: "Demo internal note: Review the metallic system estimate before sending. Prep labor may be light for the substrate condition and moisture testing should be confirmed.",
      notes:
        "Demo-only fixture. Keep this as a workflow observation and review flag only."
    },
    extraSuggestions: [
      {
        suggestionType: "flag_estimate_review",
        title: "Review estimate before sending",
        rationale:
          "Demo internal note flagged possible prep-labor and moisture-testing review needs. This does not update the estimate.",
        proposedPayload: {
          reviewReason:
            "Prep labor may be light and moisture testing should be confirmed.",
          sourceType: "internal_note",
          reviewOnly: true,
          demoFixture: true
        }
      }
    ]
  }
];

export function getGateKeeperDemoFixture(key: string) {
  return gateKeeperDemoFixtures.find((fixture) => fixture.key === key) ?? null;
}

export function buildGateKeeperDemoFixturePlan(
  key: GateKeeperDemoFixtureKey,
  options: { organizationId?: string; occurredAt?: string } = {}
): GateKeeperManualSeedPlan {
  const fixture = getGateKeeperDemoFixture(key);

  if (!fixture) {
    throw new Error("GateKeeper demo fixture was not found.");
  }

  const plan = options.organizationId
    ? buildGateKeeperManualSeedPlanForOrganization(
        fixture.input,
        options.organizationId,
        { occurredAt: options.occurredAt }
      )
    : buildGateKeeperManualSeedPlan(fixture.input);
  const allSuggestions: GateKeeperManualSeedSuggestionDraft[] = [
    ...plan.suggestions,
    ...(fixture.extraSuggestions ?? [])
  ];

  return {
    ...plan,
    artifacts: plan.artifacts.map((artifact) => ({
      ...artifact,
      content: {
        ...artifact.content,
        demoFixture: fixture.key
      }
    })),
    suggestions: allSuggestions.map((suggestion) => ({
      ...suggestion,
      proposedPayload: {
        ...suggestion.proposedPayload,
        demoFixture: fixture.key,
        reviewOnly: true
      }
    }))
  };
}
