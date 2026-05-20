import type { GateKeeperActionSuggestion } from "@floorconnector/types";

import {
  buildGateKeeperCreateOpportunityConfirmationModel,
  type GateKeeperCreateOpportunityConfirmationDraft
} from "./create-opportunity-confirmation";

export type GateKeeperCreateOpportunityDuplicateMatchType =
  | "opportunity"
  | "customer"
  | "contact"
  | "execution_attempt";

export type GateKeeperCreateOpportunityDuplicateConfidence =
  | "high"
  | "medium"
  | "low";

export type GateKeeperCreateOpportunityDuplicateRecommendation =
  | "insufficient_input"
  | "no_match_found"
  | "review_possible_duplicate"
  | "high_confidence_duplicate_review_required";

export type GateKeeperCreateOpportunityDuplicateCandidate = {
  id: string;
  matchType: GateKeeperCreateOpportunityDuplicateMatchType;
  displayLabel: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  service?: string | null;
  locationText?: string | null;
  status?: string | null;
  href?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  reasonHints?: string[];
};

export type GateKeeperCreateOpportunityDuplicateMatch = {
  id: string;
  matchType: GateKeeperCreateOpportunityDuplicateMatchType;
  confidence: GateKeeperCreateOpportunityDuplicateConfidence;
  reasonLabels: string[];
  href: string | null;
  displayLabel: string;
  status: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type GateKeeperCreateOpportunityDuplicatePreview = {
  matches: GateKeeperCreateOpportunityDuplicateMatch[];
  recommendation: GateKeeperCreateOpportunityDuplicateRecommendation;
  warningSummary: string;
  checkedSignals: string[];
  isReadOnly: true;
};

export function normalizeGateKeeperDuplicateEmail(
  value: string | null | undefined
) {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeGateKeeperDuplicateName(
  value: string | null | undefined
) {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeGateKeeperDuplicatePhone(
  value: string | null | undefined
) {
  const digits = (value ?? "").replace(/\D/g, "");

  if (digits.length >= 10) {
    return digits.slice(-10);
  }

  return digits.length >= 7 ? digits : "";
}

function hasUsableInput(draft: GateKeeperCreateOpportunityConfirmationDraft) {
  return Boolean(
    normalizeGateKeeperDuplicateEmail(draft.email) ||
    normalizeGateKeeperDuplicatePhone(draft.phone) ||
    normalizeGateKeeperDuplicateName(draft.contactName)
  );
}

function hasSupportingContext(input: {
  candidate: GateKeeperCreateOpportunityDuplicateCandidate;
  draft: GateKeeperCreateOpportunityConfirmationDraft;
}) {
  const service = normalizeGateKeeperDuplicateName(
    input.draft.requestedService
  );
  const location = normalizeGateKeeperDuplicateName(input.draft.locationText);
  const candidateService = normalizeGateKeeperDuplicateName(
    input.candidate.service
  );
  const candidateLocation = normalizeGateKeeperDuplicateName(
    input.candidate.locationText
  );

  return Boolean(
    (service && candidateService && candidateService.includes(service)) ||
    (service && candidateService && service.includes(candidateService)) ||
    (location && candidateLocation && candidateLocation.includes(location)) ||
    (location && candidateLocation && location.includes(candidateLocation))
  );
}

function scoreDuplicateCandidate(input: {
  candidate: GateKeeperCreateOpportunityDuplicateCandidate;
  draft: GateKeeperCreateOpportunityConfirmationDraft;
}): {
  confidence: GateKeeperCreateOpportunityDuplicateConfidence;
  reasonLabels: string[];
} | null {
  const draftEmail = normalizeGateKeeperDuplicateEmail(input.draft.email);
  const candidateEmail = normalizeGateKeeperDuplicateEmail(
    input.candidate.email
  );
  const draftPhone = normalizeGateKeeperDuplicatePhone(input.draft.phone);
  const candidatePhone = normalizeGateKeeperDuplicatePhone(
    input.candidate.phone
  );
  const draftName = normalizeGateKeeperDuplicateName(input.draft.contactName);
  const candidateName = normalizeGateKeeperDuplicateName(input.candidate.name);
  const reasonLabels = [...(input.candidate.reasonHints ?? [])];

  if (draftEmail && candidateEmail && draftEmail === candidateEmail) {
    reasonLabels.push("Exact email match");
  }

  if (draftPhone && candidatePhone && draftPhone === candidatePhone) {
    reasonLabels.push("Exact normalized phone match");
  }

  if (draftName && candidateName && candidateName === draftName) {
    reasonLabels.push("Exact name match");
  } else if (
    draftName &&
    candidateName &&
    (candidateName.includes(draftName) || draftName.includes(candidateName))
  ) {
    reasonLabels.push("Name text match");
  }

  if (hasSupportingContext(input)) {
    reasonLabels.push("Service or location context overlaps");
  }

  const highConfidence = reasonLabels.some((reason) =>
    ["Exact email match", "Exact normalized phone match"].includes(reason)
  );
  const nameMatch = reasonLabels.some((reason) =>
    ["Exact name match", "Name text match"].includes(reason)
  );

  if (highConfidence) {
    return {
      confidence: "high",
      reasonLabels: Array.from(new Set(reasonLabels))
    };
  }

  if (nameMatch && hasSupportingContext(input)) {
    return {
      confidence: "medium",
      reasonLabels: Array.from(new Set(reasonLabels))
    };
  }

  if (nameMatch) {
    return {
      confidence: "low",
      reasonLabels: Array.from(new Set(reasonLabels))
    };
  }

  return null;
}

function rankConfidence(
  confidence: GateKeeperCreateOpportunityDuplicateConfidence
) {
  switch (confidence) {
    case "high":
      return 0;
    case "medium":
      return 1;
    default:
      return 2;
  }
}

function buildRecommendation(input: {
  hasInput: boolean;
  matches: GateKeeperCreateOpportunityDuplicateMatch[];
}): GateKeeperCreateOpportunityDuplicateRecommendation {
  if (!input.hasInput) {
    return "insufficient_input";
  }

  if (input.matches.some((match) => match.confidence === "high")) {
    return "high_confidence_duplicate_review_required";
  }

  if (input.matches.length > 0) {
    return "review_possible_duplicate";
  }

  return "no_match_found";
}

function buildWarningSummary(
  recommendation: GateKeeperCreateOpportunityDuplicateRecommendation
) {
  switch (recommendation) {
    case "high_confidence_duplicate_review_required":
      return "High-confidence existing records were found. Future execution should require review before creating a new opportunity.";
    case "review_possible_duplicate":
      return "Possible existing records were found. Treat these as warnings, not automated decisions.";
    case "insufficient_input":
      return "Add a contact name, email, or phone number before duplicate detection can be meaningful.";
    default:
      return "No possible duplicates were found in the bounded read-only preview.";
  }
}

export function buildGateKeeperCreateOpportunityDuplicatePreview(input: {
  candidates: GateKeeperCreateOpportunityDuplicateCandidate[];
  draft: GateKeeperCreateOpportunityConfirmationDraft;
}): GateKeeperCreateOpportunityDuplicatePreview {
  const matches = input.candidates
    .map((candidate) => {
      const score = scoreDuplicateCandidate({
        candidate,
        draft: input.draft
      });

      if (!score) {
        return null;
      }

      return {
        id: candidate.id,
        matchType: candidate.matchType,
        confidence: score.confidence,
        reasonLabels: score.reasonLabels,
        href: candidate.href ?? null,
        displayLabel: candidate.displayLabel,
        status: candidate.status ?? null,
        createdAt: candidate.createdAt ?? null,
        updatedAt: candidate.updatedAt ?? null
      } satisfies GateKeeperCreateOpportunityDuplicateMatch;
    })
    .filter(
      (match): match is GateKeeperCreateOpportunityDuplicateMatch =>
        match !== null
    )
    .sort((left, right) => {
      const confidence =
        rankConfidence(left.confidence) - rankConfidence(right.confidence);

      if (confidence !== 0) {
        return confidence;
      }

      return (right.updatedAt ?? right.createdAt ?? "").localeCompare(
        left.updatedAt ?? left.createdAt ?? ""
      );
    })
    .slice(0, 8);
  const recommendation = buildRecommendation({
    hasInput: hasUsableInput(input.draft),
    matches
  });

  return {
    matches,
    recommendation,
    warningSummary: buildWarningSummary(recommendation),
    checkedSignals: [
      "Exact email",
      "Normalized phone",
      "Contact/customer name",
      "Service/location context",
      "Prior GateKeeper execution ledger attempts"
    ],
    isReadOnly: true
  };
}

export function getGateKeeperCreateOpportunityDuplicateDraft(
  suggestion: Pick<GateKeeperActionSuggestion, "proposedPayload">
): GateKeeperCreateOpportunityConfirmationDraft {
  return buildGateKeeperCreateOpportunityConfirmationModel(
    suggestion.proposedPayload
  ).draft;
}
