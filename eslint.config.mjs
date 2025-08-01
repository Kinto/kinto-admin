import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/dist", "**/eslint.config.mjs", "**/build", "**/bin"]), {
  extends: fixupConfigRules(compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:react/jsx-runtime",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier",
  )),

  plugins: {
    "@typescript-eslint": fixupPluginRules(typescriptEslintEslintPlugin),
  },

  languageOptions: {
    globals: {
      ...globals.browser,
    },

    parser: tsParser,
    ecmaVersion: "latest",
    sourceType: "module",

    parserOptions: {
      project: ["./tsconfig.json", "./tsconfig.node.json"],
      tsconfigRootDir: __dirname,
    },
  },

  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off", // requires Typescript `strictNullChecks`

    "@typescript-eslint/no-unused-vars": ["error", {
      vars: "all",
      args: "none",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    }],
  },
}]);
