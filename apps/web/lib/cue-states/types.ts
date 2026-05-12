import type { CanonicalRecordSubjectType } from "@floorconnector/types";

export type CueFamily = "operational" | "project_guidance";
export type CueStateScope = "user" | "company";
export type CueStateValue = "dismissed" | "snoozed" | "resolved";
export type WorkflowCueSubjectType = CanonicalRecordSubjectType | "job";

export type WorkflowCueIdentity = {
  companyId: string;
  cueFamily: CueFamily;
  cueKey: string;
  cueVersion: number;
  cueFingerprint: string;
  subjectType: WorkflowCueSubjectType;
  subjectId: string;
  projectId: string | null;
};

export type WorkflowCueStateRecord = WorkflowCueIdentity & {
  id: string;
  scope: CueStateScope;
  userId: string | null;
  state: CueStateValue;
  snoozedUntil: string | null;
  dismissedAt: string | null;
  resolvedAt: string | null;
};

export type CueStateActionSupport = {
  dismiss: boolean;
  snooze: boolean;
  resolve: boolean;
};
