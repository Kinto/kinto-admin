module.exports = {
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/test/__mocks__/styleMock.js",
    "\\.svg": "<rootDir>/test/__mocks__/svgrMock.js",
    "^nanoid$": "@rjsf/core/node_modules/nanoid/index.browser.cjs", // to avoid jest/es6 issue with @rjsf dependency
  },
  setupFilesAfterEnv: ["./test/setup-tests.js"],
  testEnvironment: "jest-environment-jsdom",
  testRegex: [".*_test.js", ".*_test.tsx", ".*_test.ts"],
};
