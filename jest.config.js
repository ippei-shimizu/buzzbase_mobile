/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest-setup-files.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@types/(.*)$": "<rootDir>/types/$1",
    "^@constants/(.*)$": "<rootDir>/constants/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
    "^@stores/(.*)$": "<rootDir>/stores/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.expo/"],
};
