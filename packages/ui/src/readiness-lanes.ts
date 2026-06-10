export type ReadinessLaneId =
  | "financial-readiness"
  | "schedule-readiness"
  | "production-readiness";

export type ReadinessLaneCopy = {
  id: ReadinessLaneId;
  label: string;
  shortLabel: string;
  owner: string;
  actionSurface: string;
  description: string;
  boundary: string;
};

export const readinessLaneOrder: ReadinessLaneId[] = [
  "financial-readiness",
  "schedule-readiness",
  "production-readiness"
];

export const readinessLaneCopyById: Record<ReadinessLaneId, ReadinessLaneCopy> =
  {
    "financial-readiness": {
      id: "financial-readiness",
      label: "Financial Readiness",
      shortLabel: "Financial",
      owner: "Financials",
      actionSurface: "Financials / Invoice Workspace",
      description:
        "Contract terms, invoices, payments, and AR evidence decide whether money is blocking the next operational move.",
      boundary:
        "Project can summarize financial blockers, but Financials and invoice records remain the owner."
    },
    "schedule-readiness": {
      id: "schedule-readiness",
      label: "Schedule Readiness",
      shortLabel: "Schedule",
      owner: "Jobs / Schedule",
      actionSurface: "Job Workspace / Schedule",
      description:
        "Ready projects move into canonical jobs, calendar placement, crew timing, and dispatch context.",
      boundary:
        "Project can route the handoff, but jobs and schedule fields remain the source of schedule truth."
    },
    "production-readiness": {
      id: "production-readiness",
      label: "Production Readiness",
      shortLabel: "Production",
      owner: "Field / Production",
      actionSurface: "Job Workspace / Field",
      description:
        "Crew, equipment, daily log, field evidence, blockers, and closeout context decide whether work is ready to execute.",
      boundary:
        "Project can expose production context, but field and job records remain the owner."
    }
  };

export function getReadinessLaneCopy(id: ReadinessLaneId) {
  return readinessLaneCopyById[id];
}

export function getReadinessLaneCopies(ids = readinessLaneOrder) {
  return ids.map((id) => readinessLaneCopyById[id]);
}
