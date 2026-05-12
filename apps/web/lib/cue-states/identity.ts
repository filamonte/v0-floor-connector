import { createHash } from "node:crypto";

import type { OperationalCue } from "../operational-cues/types";
import type { ProjectCue } from "../projects/cues";
import type { WorkflowCueIdentity } from "./types";

const defaultCueVersion = 1;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const record = value as Record<string, unknown>;

  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function fingerprint(value: Record<string, unknown>) {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

export function buildOperationalCueIdentity(
  cue: OperationalCue,
  options?: { cueVersion?: number }
): WorkflowCueIdentity {
  const cueVersion = options?.cueVersion ?? defaultCueVersion;

  return {
    companyId: cue.organizationId,
    cueFamily: "operational",
    cueKey: cue.cueKey,
    cueVersion,
    cueFingerprint: fingerprint({
      cueFamily: "operational",
      cueKey: cue.cueKey,
      cueVersion,
      subjectType: cue.subjectType,
      subjectId: cue.subjectId,
      urgency: cue.urgency,
      ageDays: cue.ageDays,
      reason: cue.reason,
      sourceLabel: cue.sourceLabel,
      sourceValue: cue.sourceValue,
      thresholdLabel: cue.thresholdLabel,
      triggeredAtLabel: cue.triggeredAtLabel,
      actionHref: cue.actionHref
    }),
    subjectType: cue.subjectType,
    subjectId: cue.subjectId,
    projectId: cue.projectId
  };
}

function getProjectCueKey(cue: ProjectCue) {
  const [, key] = cue.id.split(":");

  return key ?? cue.id;
}

export function buildProjectCueIdentity(
  companyId: string,
  cue: ProjectCue,
  options?: { cueVersion?: number }
): WorkflowCueIdentity {
  const cueVersion = options?.cueVersion ?? defaultCueVersion;
  const cueKey = getProjectCueKey(cue);
  const subjectType = "project";
  const subjectId = cue.projectId;

  return {
    companyId,
    cueFamily: "project_guidance",
    cueKey,
    cueVersion,
    cueFingerprint: fingerprint({
      cueFamily: "project_guidance",
      cueKey,
      cueVersion,
      subjectType,
      subjectId,
      projectId: cue.projectId,
      href: cue.href,
      actionLabel: cue.actionLabel,
      priority: cue.priority,
      reason: cue.reason,
      bridgeCue: cue.workItemBridge?.cue ?? null,
      bridgeContext: cue.workItemBridge?.context ?? null
    }),
    subjectType,
    subjectId,
    projectId: cue.projectId
  };
}
