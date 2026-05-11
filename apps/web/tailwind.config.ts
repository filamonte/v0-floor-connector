import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff4ec",
          100: "#ffe1cc",
          500: "#ef7d32",
          700: "#b94f13",
          900: "#5c260b"
        },
        graphite: {
          50: "#f9fafb",
          100: "#f3f4f6",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827"
        },
        copper: {
          600: "#B45309",
          500: "#D97706",
          400: "#F59E0B"
        }
      }
    }
  },
  plugins: []
};

export default config;
