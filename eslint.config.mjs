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
    "prefer-const": "off",
    "no-var": "off",
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    'react/prop-types': 'off',
    "no-unused-vars": "off",

    "@typescript-eslint/no-unused-vars": ["error", {
      vars: "all",
      args: "none",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    }],

    "no-console": "off",
  },
}]);
