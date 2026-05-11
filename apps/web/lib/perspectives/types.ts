export type PerspectiveView = "my" | "company";

export const perspectiveViews = ["my", "company"] as const satisfies readonly PerspectiveView[];

export const defaultPerspectiveView: PerspectiveView = "company";

export function parsePerspectiveView(value: string | null | undefined): PerspectiveView {
  return value === "my" || value === "company" ? value : defaultPerspectiveView;
}

export function getPerspectiveLabel(view: PerspectiveView) {
  return view === "my" ? "My Work" : "Company";
}
