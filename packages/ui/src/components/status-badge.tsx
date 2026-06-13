import type { ReactNode } from "react";

import {
  getReadinessBadgeClassName,
  getStatusBadgeClassName,
  normalizeStatusLabel
} from "../status";

type BadgeSize = "sm" | "md";

type StatusBadgeProps = {
  status: string;
  children?: ReactNode;
  className?: string;
  size?: BadgeSize;
};

type ReadinessBadgeProps = StatusBadgeProps;

const badgeSizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] tracking-[0.1em]",
  md: "px-3 py-1 text-xs tracking-[0.12em]"
};

function formatBadgeLabel(status: string) {
  return normalizeStatusLabel(status).replaceAll("_", " ");
}

function buildBadgeClassName(input: {
  className?: string;
  size: BadgeSize;
  toneClassName: string;
}) {
  return [
    "inline-flex shrink-0 items-center rounded-[4px] border font-semibold uppercase shadow-[inset_0_1px_0_rgba(255,255,255,0.56)]",
    badgeSizeClasses[input.size],
    input.toneClassName,
    input.className
  ]
    .filter(Boolean)
    .join(" ");
}

export function StatusBadge({
  status,
  children,
  className,
  size = "md"
}: StatusBadgeProps) {
  return (
    <span
      className={buildBadgeClassName({
        className,
        size,
        toneClassName: getStatusBadgeClassName(status)
      })}
    >
      {children ?? formatBadgeLabel(status)}
    </span>
  );
}

export function ReadinessBadge({
  status,
  children,
  className,
  size = "md"
}: ReadinessBadgeProps) {
  return (
    <span
      className={buildBadgeClassName({
        className,
        size,
        toneClassName: getReadinessBadgeClassName(status)
      })}
    >
      {children ?? formatBadgeLabel(status)}
    </span>
  );
}
