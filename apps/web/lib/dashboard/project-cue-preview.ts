import type { ProjectCue } from "../projects/cues";

export type DashboardProjectCuePreviewItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  actionLabel: "Review project cue";
  badge: ProjectCue["priority"];
  contextHref: string;
  contextLabel: string;
  searchText: string;
  bridgeHref?: never;
  bridgeLabel?: never;
  workItemId?: never;
};

function buildDashboardProjectCueSearchText(cue: ProjectCue) {
  return [
    cue.title,
    cue.projectName,
    cue.description,
    cue.reason,
    cue.priority
  ].filter(Boolean).join(" ");
}

export function mapProjectCueToDashboardPreviewItem(
  cue: ProjectCue
): DashboardProjectCuePreviewItem {
  return {
    id: cue.id,
    title: cue.title,
    subtitle: cue.projectName,
    meta: cue.reason,
    href: `/projects/${cue.projectId}#project-guidance-cues`,
    actionLabel: "Review project cue",
    badge: cue.priority,
    contextHref: cue.href,
    contextLabel: cue.actionLabel,
    searchText: buildDashboardProjectCueSearchText(cue)
  };
}

export function mapProjectCuesToDashboardPreviewItems(cues: ProjectCue[]) {
  return cues.map(mapProjectCueToDashboardPreviewItem);
}
