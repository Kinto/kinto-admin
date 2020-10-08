module.exports = {
  setupFilesAfterEnv: ["./test/setup-jsdom.js"],
  testRegex: ".*_test.js",
  moduleNameMapper: {
    "\\.(css|less)$": "<rootDir>/test/__mocks__/styleMock.js",
    "\\.svg": "<rootDir>/test/__mocks__/svgrMock.js",
  },
};
