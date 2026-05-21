"use client";

import type { ReactNode } from "react";

type IconContainerProps = {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "active" | "copper" | "success" | "error";
  className?: string;
};

const sizeMap = {
  xs: "w-6 h-6",
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-9 h-9",
  xl: "w-12 h-12"
} as const;

const variantMap = {
  default: "bg-[var(--highlight)] text-[var(--text-secondary)]",
  active: "bg-[var(--graphite)] text-white",
  copper: "bg-[var(--copper)] text-white",
  success: "bg-[var(--color-success)] text-white",
  error: "bg-[var(--color-error)] text-white"
} as const;

export function IconContainer({
  children,
  size = "md",
  variant = "default",
  className
}: IconContainerProps) {
  return (
    <div
      className={`rounded-full flex items-center justify-center ${sizeMap[size]} ${variantMap[variant]} ${className || ""}`}
    >
      {children}
    </div>
  );
}
