import type {
  RecordRevision,
  RecordRevisionKind,
  RecordRevisionSubjectType
} from "@floorconnector/types";

export const recordRevisionSubjectTypes = [
  "estimate",
  "invoice",
  "contract",
  "change_order"
] as const satisfies readonly RecordRevisionSubjectType[];

export const recordRevisionKinds = [
  "created",
  "edited",
  "sent",
  "status_change",
  "system_snapshot",
  "pre_signature",
  "pre_payment",
  "manual"
] as const satisfies readonly RecordRevisionKind[];

export type RecordRevisionSnapshotSummary = {
  label: string;
  value: string;
};

export type RecordRevisionSnapshot = {
  subjectType: RecordRevisionSubjectType;
  subjectId: string;
  capturedAt: string;
  title: string;
  status: string;
  summary: RecordRevisionSnapshotSummary[];
  header: Record<string, unknown>;
  lineItems?: Array<Record<string, unknown>>;
  signers?: Array<Record<string, unknown>>;
  timestamps: Record<string, string | null>;
};

export type RecordRevisionListItem = RecordRevision & {
  displayKind: string;
  displaySummary: RecordRevisionSnapshotSummary[];
};

export function parseRecordRevisionSubjectType(
  value: string
): RecordRevisionSubjectType | null {
  return recordRevisionSubjectTypes.includes(value as RecordRevisionSubjectType)
    ? (value as RecordRevisionSubjectType)
    : null;
}

export function parseRecordRevisionKind(value: string): RecordRevisionKind | null {
  return recordRevisionKinds.includes(value as RecordRevisionKind)
    ? (value as RecordRevisionKind)
    : null;
}

export function getNextRevisionNumber(existingRevisionNumbers: number[]) {
  return existingRevisionNumbers.length === 0
    ? 1
    : Math.max(...existingRevisionNumbers) + 1;
}

export function formatRecordRevisionKind(kind: RecordRevisionKind) {
  return kind.replaceAll("_", " ");
}

export function getRecordRevisionDisplayMetadata(
  revision: RecordRevision
): RecordRevisionListItem {
  const snapshot = revision.snapshot as Partial<RecordRevisionSnapshot>;

  return {
    ...revision,
    displayKind: formatRecordRevisionKind(revision.revisionKind),
    displaySummary: Array.isArray(snapshot.summary) ? snapshot.summary.slice(0, 4) : []
  };
}
