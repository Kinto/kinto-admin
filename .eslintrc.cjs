module.exports = {
  "root": true,
  "parser": "@typescript-eslint/parser",
  "ignorePatterns": ["dist", ".eslintrc.cjs"],
  "env": { "browser": true, "es2020": true },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint/eslint-plugin"],
  "rules": {
    // ***
    // TODO: turn these rules on progressively
    "prefer-const": "off",
    "no-var": "off",
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    // ***
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { "vars": "all", "args": "none", "varsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }
    ],
    "no-console": "off"
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": ["./tsconfig.json", "./tsconfig.node.json"],
    "tsconfigRootDir": __dirname,
  }
}
