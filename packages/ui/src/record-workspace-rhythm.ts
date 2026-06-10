export const recordWorkspaceRhythmStepIds = [
  "identity",
  "state-next-action",
  "primary-work",
  "context",
  "history"
] as const;

export type RecordWorkspaceRhythmStepId =
  (typeof recordWorkspaceRhythmStepIds)[number];

export type RecordWorkspaceRhythmStep = {
  id: RecordWorkspaceRhythmStepId;
  label: string;
  description: string;
};

export const recordWorkspaceRhythmSteps: RecordWorkspaceRhythmStep[] = [
  {
    id: "identity",
    label: "Record identity",
    description:
      "Show the canonical record, customer/project context, and status."
  },
  {
    id: "state-next-action",
    label: "State and next action",
    description:
      "Place the truthful current state and one primary next action before supporting details."
  },
  {
    id: "primary-work",
    label: "Primary work",
    description:
      "Put the record-owned review, editing, or execution surface ahead of secondary context."
  },
  {
    id: "context",
    label: "Linked context",
    description:
      "Link to adjacent canonical workspaces without recreating their ownership or state."
  },
  {
    id: "history",
    label: "Details and history",
    description:
      "Keep metadata, activity, files, notes, and proof trails below the decision surface."
  }
];

export function getRecordWorkspaceRhythmStep(id: RecordWorkspaceRhythmStepId) {
  return recordWorkspaceRhythmSteps.find((step) => step.id === id);
}
