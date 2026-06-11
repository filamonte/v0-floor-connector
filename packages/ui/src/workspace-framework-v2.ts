export const workspaceFrameworkV2ViewIds = [
  "overview",
  "qualification",
  "site-visit",
  "assessment-package",
  "estimate-plan",
  "work-items",
  "communication",
  "activity"
] as const;

export type WorkspaceFrameworkV2ViewId =
  (typeof workspaceFrameworkV2ViewIds)[number];

export type WorkspaceFrameworkV2View = {
  id: WorkspaceFrameworkV2ViewId;
  label: string;
  description: string;
};

export const projectWorkspaceFrameworkV2ViewIds = [
  "overview",
  "readiness",
  "scope",
  "commercial",
  "production",
  "financial",
  "activity"
] as const;

export type ProjectWorkspaceFrameworkV2ViewId =
  (typeof projectWorkspaceFrameworkV2ViewIds)[number];

export type ProjectWorkspaceFrameworkV2View = {
  id: ProjectWorkspaceFrameworkV2ViewId;
  label: string;
  description: string;
};

export const workspaceFrameworkV2Views: WorkspaceFrameworkV2View[] = [
  {
    id: "overview",
    label: "Overview",
    description:
      "Show record identity, primary context, and the current operating state."
  },
  {
    id: "qualification",
    label: "Qualification",
    description:
      "Keep sales qualification, ownership, contact, and role context together."
  },
  {
    id: "site-visit",
    label: "Site Visit",
    description:
      "Focus inspection timing, requirements, and structured intake work."
  },
  {
    id: "assessment-package",
    label: "Assessment Package",
    description:
      "Reference opportunity-owned pre-estimate capture without forking project truth."
  },
  {
    id: "estimate-plan",
    label: "Estimate Plan",
    description:
      "Route the commercial handoff into estimating and linked work ownership."
  },
  {
    id: "work-items",
    label: "Work Items",
    description:
      "Show internal-only follow-up and estimate handoff actions tied to this record."
  },
  {
    id: "communication",
    label: "Communication",
    description:
      "Summarize communication and follow-up context without creating provider behavior."
  },
  {
    id: "activity",
    label: "Activity",
    description:
      "Keep supporting measurements, observations, files, and history out of the primary decision surface."
  }
];

export const projectWorkspaceFrameworkV2Views: ProjectWorkspaceFrameworkV2View[] =
  [
    {
      id: "overview",
      label: "Overview",
      description:
        "Show project identity, current next action, readiness summary, and linked-record continuity."
    },
    {
      id: "readiness",
      label: "Readiness",
      description:
        "Focus blockers, readiness gates, workflow cues, and the record that owns the next fix."
    },
    {
      id: "scope",
      label: "Scope / Context",
      description:
        "Keep assessment package, appointments, documents, and editable project facts together."
    },
    {
      id: "commercial",
      label: "Estimates / Contracts",
      description:
        "Summarize commercial records while routing estimate and contract work to their owning workspaces."
    },
    {
      id: "production",
      label: "Jobs / Schedule",
      description:
        "Show job, schedule, field, crew, and closeout continuity without replacing CrewBoard or Job Workspace."
    },
    {
      id: "financial",
      label: "Invoices / Payments",
      description:
        "Summarize project financial continuity while keeping billing and collection actions in invoice and financial workspaces."
    },
    {
      id: "activity",
      label: "Activity / Notes",
      description:
        "Collect work items, communication, proof, evidence, service, warranty, and lower-frequency history."
    }
  ];

export function normalizeWorkspaceFrameworkV2ViewId(
  value: string | null | undefined,
  fallback: WorkspaceFrameworkV2ViewId = "overview"
): WorkspaceFrameworkV2ViewId {
  return workspaceFrameworkV2ViewIds.includes(
    value as WorkspaceFrameworkV2ViewId
  )
    ? (value as WorkspaceFrameworkV2ViewId)
    : fallback;
}

export function normalizeProjectWorkspaceFrameworkV2ViewId(
  value: string | null | undefined,
  fallback: ProjectWorkspaceFrameworkV2ViewId = "overview"
): ProjectWorkspaceFrameworkV2ViewId {
  return projectWorkspaceFrameworkV2ViewIds.includes(
    value as ProjectWorkspaceFrameworkV2ViewId
  )
    ? (value as ProjectWorkspaceFrameworkV2ViewId)
    : fallback;
}
