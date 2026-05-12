import type { OperationalCue } from "../operational-cues/types";
import type { ProjectCue } from "../projects/cues";
import {
  buildOperationalCueIdentity,
  buildProjectCueIdentity
} from "./identity";
import type {
  CueStateActionSupport,
  WorkflowCueIdentity,
  WorkflowCueStateRecord
} from "./types";

type WorkflowCue = OperationalCue | ProjectCue;

const operationalDismissibleCueKeys = new Set([
  "estimate_sent_followup",
  "contract_sent_unsigned",
  "contract_viewed_unsigned"
]);

const operationalSnoozableCueKeys = new Set([
  "estimate_sent_followup",
  "contract_sent_unsigned",
  "contract_viewed_unsigned",
  "invoice_overdue",
  "deposit_invoice_unpaid",
  "job_ready_unscheduled",
  "job_scheduled_missing_crew"
]);

const projectDismissibleCueKeys = new Set(["open-blocker-field-notes"]);

const projectSnoozableCueKeys = new Set([
  "approved-estimate-missing-contract",
  "deposit-invoice-unpaid",
  "signed-contract-no-job",
  "ready-unscheduled-jobs",
  "open-blocker-field-notes"
]);

export function getCueStateActionSupportForIdentity(input: {
  cueFamily: string;
  cueKey: string;
}): CueStateActionSupport {
  if (input.cueFamily === "operational") {
    return {
      dismiss: operationalDismissibleCueKeys.has(input.cueKey),
      snooze: operationalSnoozableCueKeys.has(input.cueKey),
      resolve: false
    };
  }

  if (input.cueFamily === "project_guidance") {
    return {
      dismiss: projectDismissibleCueKeys.has(input.cueKey),
      snooze: projectSnoozableCueKeys.has(input.cueKey),
      resolve: false
    };
  }

  return {
    dismiss: false,
    snooze: false,
    resolve: false
  };
}

function isOperationalCue(cue: WorkflowCue): cue is OperationalCue {
  return "cueKey" in cue;
}

function getProjectCueKey(cue: ProjectCue) {
  const [, key] = cue.id.split(":");

  return key ?? cue.id;
}

export function getCueStateActionSupport(cue: WorkflowCue): CueStateActionSupport {
  if (isOperationalCue(cue)) {
    return getCueStateActionSupportForIdentity({
      cueFamily: "operational",
      cueKey: cue.cueKey
    });
  }

  return getCueStateActionSupportForIdentity({
    cueFamily: "project_guidance",
    cueKey: getProjectCueKey(cue)
  });
}

export function getCueIdentity(
  cue: WorkflowCue,
  input?: { companyId?: string }
): WorkflowCueIdentity {
  if (isOperationalCue(cue)) {
    return buildOperationalCueIdentity(cue);
  }

  if (!input?.companyId) {
    throw new Error("Project guidance cue identity requires company id.");
  }

  return buildProjectCueIdentity(input.companyId, cue);
}

function stateMatchesIdentity(
  state: WorkflowCueStateRecord,
  identity: WorkflowCueIdentity
) {
  return (
    state.companyId === identity.companyId &&
    state.cueFamily === identity.cueFamily &&
    state.cueKey === identity.cueKey &&
    state.cueVersion === identity.cueVersion &&
    state.cueFingerprint === identity.cueFingerprint &&
    state.subjectType === identity.subjectType &&
    state.subjectId === identity.subjectId
  );
}

function suppressesCue(input: {
  state: WorkflowCueStateRecord;
  currentUserId: string;
  now: Date;
}) {
  const { state } = input;

  if (state.scope === "user" && state.userId !== input.currentUserId) {
    return false;
  }

  if (state.state === "dismissed") {
    return true;
  }

  if (state.state === "snoozed") {
    return Boolean(
      state.snoozedUntil &&
        new Date(state.snoozedUntil).getTime() > input.now.getTime()
    );
  }

  return state.state === "resolved" && state.scope === "company";
}

export function applyCueStates<TCue extends WorkflowCue>(input: {
  cues: TCue[];
  states: WorkflowCueStateRecord[];
  currentUserId: string;
  now: Date;
  companyId?: string;
}) {
  const visibleCues: TCue[] = [];
  const suppressedCues: TCue[] = [];

  for (const cue of input.cues) {
    const identity = getCueIdentity(cue, { companyId: input.companyId });
    const suppressingState = input.states.find(
      (state) =>
        stateMatchesIdentity(state, identity) &&
        suppressesCue({
          state,
          currentUserId: input.currentUserId,
          now: input.now
        })
    );

    if (suppressingState) {
      suppressedCues.push(cue);
    } else {
      visibleCues.push(cue);
    }
  }

  return { visibleCues, suppressedCues };
}
