import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier/flat";
import globals from "globals";

export default defineConfig([globalIgnores(["**/eslint.config.mjs", "**/build", "**/bin", "**/coverage"]), {
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylisticTypeChecked,
    // eslint-plugin-react does not support ESLint 10 yet; the fixup restores
    // the context methods it still calls. Remove once it does:
    // https://github.com/jsx-eslint/eslint-plugin-react/issues/3977
    fixupConfigRules([react.configs.flat.recommended, react.configs.flat["jsx-runtime"]]),
    prettier,
    reactHooks.configs.flat.recommended,
  ],

  settings: {
    react: { version: "detect" },
  },

  languageOptions: {
    globals: globals.browser,

    parserOptions: {
      project: ["./tsconfig.json", "./tsconfig.node.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },

  rules: {
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off", // requires Typescript `strictNullChecks`

    // Existing violations; switch each back to "error" once fixed.
    "react-hooks/globals": "warn",
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/static-components": "warn",

    "@typescript-eslint/no-unused-vars": ["error", {
      vars: "all",
      args: "none",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    }],
  },
}]);
