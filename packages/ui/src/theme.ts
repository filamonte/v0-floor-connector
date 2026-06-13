export const floorConnectorTheme = {
  color: {
    primary: "#005EB8",
    primaryHover: "#0B74D1",
    success: "#16a34a",
    warning: "#D97706",
    danger: "#dc2626",
    info: "#005EB8",
    background: "#F4F4F5",
    card: "#ffffff",
    border: "#D1D5DB",
    ink: "#09090B",
    muted: "#3F3F46",
    chrome: "#18181B"
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
