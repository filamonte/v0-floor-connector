export type UniversalCaptureIntentType =
  | "site_visit"
  | "follow_up"
  | "estimate"
  | "contract"
  | "unknown";

export type UniversalCaptureDateTimeCandidate = {
  localDate: string | null;
  localTime: string | null;
  sourceText: string;
  precision: "date_time" | "date_only" | "time_only";
  needsConfirmation: boolean;
  reason: string;
};

export type UniversalCaptureIntentCandidate = {
  intentType: UniversalCaptureIntentType;
  label: string;
  confidence: "high" | "medium" | "low";
  matchReason: string;
  rawText: string;
  dateTime: UniversalCaptureDateTimeCandidate | null;
  requiredMissingFields: string[];
  recommendedDestination:
    | "appointment_quick_create"
    | "work_item"
    | "estimate"
    | "contract";
  safeAction: "prefill_route" | "create_internal_work_item" | "route_only";
};

const siteVisitPattern =
  /\b(site\s*visit|onsite|on-site|appointment|assessment appointment|inspection)\b/i;
const followUpPattern =
  /\b(follow[-\s]?up|follow up|callback|call back|remind|reminder)\b/i;
const estimatePattern =
  /\b(create|start|draft|prepare|need|needed|needs)\b.*\bestimate\b|\bestimate\s+(needed|needs|request|handoff)\b/i;
const contractPattern =
  /\b(customer\s+approved|approved\s+estimate|estimate\s+approved|create\s+contract|prepare\s+contract|contract)\b/i;

const explicitMonthDayPattern =
  /\b(?<month>0?[1-9]|1[0-2])\/(?<day>0?[1-9]|[12]\d|3[01])(?:\/(?<year>\d{2,4}))?\b/i;
const isoDatePattern =
  /\b(?<year>\d{4})-(?<month>0[1-9]|1[0-2])-(?<day>0[1-9]|[12]\d|3[01])\b/i;
const timePattern =
  /\b(?:at\s*)?(?<hour>0?[1-9]|1[0-2])(?::(?<minute>[0-5]\d))?\s*(?<meridiem>a\.?m\.?|p\.?m\.?)\b/i;
const relativeDayPattern = /\b(?<relative>today|tomorrow)\b/i;
const nextWeekdayPattern =
  /\bnext\s+(?<weekday>monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i;

const weekdayIndexes: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${padNumber(month)}-${padNumber(day)}`;
}

function isValidDateParts(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function chooseUpcomingYear(input: {
  referenceDate: Date;
  month: number;
  day: number;
}) {
  const referenceYear = input.referenceDate.getFullYear();
  const candidate = new Date(referenceYear, input.month - 1, input.day);
  const referenceDay = new Date(
    referenceYear,
    input.referenceDate.getMonth(),
    input.referenceDate.getDate()
  );

  return candidate < referenceDay ? referenceYear + 1 : referenceYear;
}

function parseTime(rawText: string) {
  const match = rawText.match(timePattern);

  if (!match?.groups) {
    return null;
  }

  const meridiem = match.groups.meridiem.toLowerCase().startsWith("p")
    ? "pm"
    : "am";
  let hour = Number(match.groups.hour);
  const minute = Number(match.groups.minute ?? "0");

  if (meridiem === "pm" && hour < 12) {
    hour += 12;
  }

  if (meridiem === "am" && hour === 12) {
    hour = 0;
  }

  return {
    localTime: `${padNumber(hour)}:${padNumber(minute)}`,
    sourceText: match[0].trim()
  };
}

function addDays(referenceDate: Date, days: number) {
  const date = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  date.setDate(date.getDate() + days);

  return date;
}

function parseDate(rawText: string, referenceDate: Date) {
  const isoMatch = rawText.match(isoDatePattern);
  if (isoMatch?.groups) {
    const year = Number(isoMatch.groups.year);
    const month = Number(isoMatch.groups.month);
    const day = Number(isoMatch.groups.day);

    if (isValidDateParts(year, month, day)) {
      return {
        localDate: toDateKey(year, month, day),
        sourceText: isoMatch[0].trim(),
        needsConfirmation: false,
        reason: "Explicit ISO date found."
      };
    }
  }

  const monthDayMatch = rawText.match(explicitMonthDayPattern);
  if (monthDayMatch?.groups) {
    const month = Number(monthDayMatch.groups.month);
    const day = Number(monthDayMatch.groups.day);
    const rawYear = monthDayMatch.groups.year;
    const year = rawYear
      ? Number(rawYear.length === 2 ? `20${rawYear}` : rawYear)
      : chooseUpcomingYear({ referenceDate, month, day });

    if (isValidDateParts(year, month, day)) {
      return {
        localDate: toDateKey(year, month, day),
        sourceText: monthDayMatch[0].trim(),
        needsConfirmation: !rawYear,
        reason: rawYear
          ? "Explicit numeric date found."
          : "Numeric date did not include a year; confirm the inferred year."
      };
    }
  }

  const relativeMatch = rawText.match(relativeDayPattern);
  if (relativeMatch?.groups) {
    const days =
      relativeMatch.groups.relative.toLowerCase() === "tomorrow" ? 1 : 0;
    const date = addDays(referenceDate, days);

    return {
      localDate: toDateKey(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      ),
      sourceText: relativeMatch[0].trim(),
      needsConfirmation: true,
      reason: "Relative date found; confirm before creating records."
    };
  }

  const weekdayMatch = rawText.match(nextWeekdayPattern);
  if (weekdayMatch?.groups) {
    const weekday = weekdayMatch.groups.weekday.toLowerCase();
    const targetIndex = weekdayIndexes[weekday];
    const currentIndex = referenceDate.getDay();
    const daysUntil = (targetIndex - currentIndex + 7) % 7 || 7;
    const date = addDays(referenceDate, daysUntil);

    return {
      localDate: toDateKey(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
      ),
      sourceText: weekdayMatch[0].trim(),
      needsConfirmation: true,
      reason: "Relative weekday found; confirm before creating records."
    };
  }

  return null;
}

function parseDateTime(
  rawText: string,
  referenceDate: Date
): UniversalCaptureDateTimeCandidate | null {
  const date = parseDate(rawText, referenceDate);
  const time = parseTime(rawText);

  if (!date && !time) {
    return null;
  }

  return {
    localDate: date?.localDate ?? null,
    localTime: time?.localTime ?? null,
    sourceText: [date?.sourceText, time?.sourceText].filter(Boolean).join(" "),
    precision: date && time ? "date_time" : date ? "date_only" : "time_only",
    needsConfirmation: Boolean(date?.needsConfirmation) || !date || !time,
    reason:
      date && time
        ? date.reason
        : date
          ? `${date.reason} Time still needs confirmation.`
          : "Time found without a date; choose the date before creating records."
  };
}

function classifyIntent(
  rawText: string
): Pick<
  UniversalCaptureIntentCandidate,
  | "intentType"
  | "label"
  | "confidence"
  | "matchReason"
  | "recommendedDestination"
  | "safeAction"
> {
  if (siteVisitPattern.test(rawText)) {
    return {
      intentType: "site_visit",
      label: "Site visit intent",
      confidence: "high",
      matchReason:
        "Matched site visit, onsite, appointment, assessment, or inspection wording.",
      recommendedDestination: "appointment_quick_create",
      safeAction: "prefill_route"
    };
  }

  if (followUpPattern.test(rawText)) {
    return {
      intentType: "follow_up",
      label: "Follow-up task intent",
      confidence: "high",
      matchReason: "Matched follow-up, callback, or reminder wording.",
      recommendedDestination: "work_item",
      safeAction: "create_internal_work_item"
    };
  }

  if (estimatePattern.test(rawText)) {
    return {
      intentType: "estimate",
      label: "Estimate intent",
      confidence: "medium",
      matchReason: "Matched estimate creation or estimate-needed wording.",
      recommendedDestination: "estimate",
      safeAction: "route_only"
    };
  }

  if (contractPattern.test(rawText)) {
    return {
      intentType: "contract",
      label: "Contract intent",
      confidence: "medium",
      matchReason: "Matched approved-estimate or contract wording.",
      recommendedDestination: "contract",
      safeAction: "route_only"
    };
  }

  return {
    intentType: "unknown",
    label: "Internal work item",
    confidence: "low",
    matchReason: "No supported V1 intent phrase matched.",
    recommendedDestination: "work_item",
    safeAction: "create_internal_work_item"
  };
}

export function parseUniversalCaptureIntent(
  rawText: string,
  options: { referenceDate?: Date; hasContext?: boolean } = {}
): UniversalCaptureIntentCandidate {
  const normalizedText = rawText.trim();
  const referenceDate = options.referenceDate ?? new Date();
  const classified = classifyIntent(normalizedText);
  const dateTime = parseDateTime(normalizedText, referenceDate);
  const requiredMissingFields: string[] = [];

  if (classified.intentType === "site_visit") {
    if (!options.hasContext) {
      requiredMissingFields.push(
        "Select a Sales Opportunity, customer, or project."
      );
    }

    if (!dateTime?.localDate) {
      requiredMissingFields.push("Choose the site visit date.");
    }

    if (!dateTime?.localTime) {
      requiredMissingFields.push("Choose the site visit time.");
    }
  }

  if (classified.intentType === "follow_up" && !dateTime?.localDate) {
    requiredMissingFields.push(
      "Choose a follow-up due date if timing matters."
    );
  }

  if (classified.intentType === "contract") {
    requiredMissingFields.push(
      "Open an approved estimate before creating a contract."
    );
  }

  return {
    ...classified,
    rawText: normalizedText,
    dateTime,
    requiredMissingFields
  };
}

export function formatCaptureDateTimeForInput(
  candidate: UniversalCaptureDateTimeCandidate | null
) {
  if (!candidate?.localDate || !candidate.localTime) {
    return "";
  }

  return `${candidate.localDate}T${candidate.localTime}`;
}
