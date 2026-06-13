import {
  industrialCommandInsetClassName,
  industrialCommandSurfaceClassName,
  industrialPanelClassName,
  industrialPanelHeaderClassName,
  industrialSecondaryActionClassName
} from "@/components/industrial-os-primitives";

export const dashboardPanelClassName = industrialPanelClassName;

export const dashboardPanelHeaderClassName = industrialPanelHeaderClassName;

export const dashboardPanelActionClassName = [
  industrialSecondaryActionClassName,
  "min-h-0 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em]"
].join(" ");

export const dashboardGridDividerClassName = "grid gap-px bg-[#d1d5db]";

export const dashboardCommandSurfaceClassName =
  industrialCommandSurfaceClassName;

export const dashboardCommandStatClassName = [
  industrialCommandInsetClassName,
  "px-3 py-2.5"
].join(" ");

export const dashboardMetricCardClassName =
  "group bg-white px-3 py-2.5 transition hover:bg-[#f7fbff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-inset";
