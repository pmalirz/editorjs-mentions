/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
