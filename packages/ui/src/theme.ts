export const floorConnectorTheme = {
  color: {
    primary: "#B45309",
    primaryHover: "#D97706",
    success: "#16a34a",
    warning: "#EA8C55",
    danger: "#dc2626",
    info: "#2563eb",
    background: "#FAFAF8",
    card: "#ffffff",
    border: "#E8E6E1",
    ink: "#111827",
    muted: "#6B7280",
    chrome: "#374151"
  },
  spacing: {
    cardPadding: "16px",
    cardPaddingLg: "20px",
    gridGap: "16px",
    sectionGap: "24px"
  },
  typography: {
    title: "22px",
    sectionHeader: "16px",
    body: "14px",
    secondary: "12px"
  },
  radius: {
    card: "8px"
  }
} as const;

export type FloorConnectorTheme = typeof floorConnectorTheme;
