module.exports = {
  projects: [
    {
      displayName: 'plugin',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/editorjs-mentions/tests/**/*.test.ts'],
      moduleNameMapper: {
        "^@editorjs-mentions/plugin/(.*)$": "<rootDir>/packages/editorjs-mentions/src/$1"
      }
    }
  ]
};
