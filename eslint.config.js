const js = require("@eslint/js");
const nextPlugin = require("@next/eslint-plugin-next");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config(
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "**/next-env.d.ts"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
        allowDefaultProject: [
          "*.js",
          "*.mjs",
          "*.cjs",
          "apps/web/postcss.config.js"
        ]
      }
    },
    plugins: {
      "@next/next": nextPlugin
    },
    rules: {
      "@next/next/no-html-link-for-pages": "off"
    }
  },
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules
    }
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...tseslint.configs.disableTypeChecked
  }
);
