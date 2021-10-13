module.exports = {
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/test/__mocks__/styleMock.js",
    "\\.svg": "<rootDir>/test/__mocks__/svgrMock.js",
  },
  setupFilesAfterEnv: ["./test/setup-tests.js"],
  testEnvironment: "jest-environment-jsdom",
  testRegex: [".*_test.js", ".*_test.tsx", ".*_test.ts"],
};
