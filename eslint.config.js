const js = require("@eslint/js");
const tseslintParser = require("@typescript-eslint/parser");
const tseslintPlugin = require("@typescript-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
      },
      globals: {
        document: "readonly",
        window: "readonly",
        HTMLElement: "readonly",
        HTMLAnchorElement: "readonly",
        HTMLDivElement: "readonly",
        Node: "readonly",
        Text: "readonly",
        MouseEvent: "readonly",
        KeyboardEvent: "readonly",
        ClipboardEvent: "readonly",
        DOMRect: "readonly",
        fetch: "readonly",
        RequestInit: "readonly",
        URL: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly"
      }
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  prettierConfig,
  {
    ignores: ["**/dist/**", "**/node_modules/**", "examples/**", "**/coverage/**"],
  },
];
