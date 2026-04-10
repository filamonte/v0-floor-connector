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
          50: "#f2f7f7",
          100: "#d9e7e8",
          500: "#216869",
          700: "#164749",
          900: "#0e2d2f"
        }
      }
    }
  },
  plugins: []
};

export default config;
