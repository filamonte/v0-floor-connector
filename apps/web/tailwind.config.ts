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
          50: "#e6f0fb",
          100: "#cfe4f8",
          500: "#005eb8",
          700: "#004f9e",
          900: "#003b74"
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
          600: "#005EB8",
          500: "#0B74D1",
          400: "#3B91E2"
        }
      }
    }
  },
  plugins: []
};

export default config;
