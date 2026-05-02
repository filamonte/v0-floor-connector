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
        }
      }
    }
  },
  plugins: []
};

export default config;
