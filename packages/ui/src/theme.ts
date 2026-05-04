export const floorConnectorTheme = {
  color: {
    primary: "#f97316",
    primaryHover: "#ea580c",
    success: "#16a34a",
    warning: "#f59e0b",
    danger: "#dc2626",
    info: "#2563eb",
    background: "#f4f5f7",
    card: "#ffffff",
    border: "#e2e5e9",
    ink: "#221a14",
    muted: "#665446",
    chrome: "#171717"
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
