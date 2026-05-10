/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest-setup-files.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/jest-setup.ts",
    "<rootDir>/jest-setup-msw.ts",
  ],
  moduleNameMapper: {
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@types/(.*)$": "<rootDir>/types/$1",
    "^@constants/(.*)$": "<rootDir>/constants/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
    "^@stores/(.*)$": "<rootDir>/stores/$1",
    // jest-expo は axios を react-native 条件で解決するため http adapter を含まない
    // browser build を返す。テスト中は MSW (msw/node) で intercept するために node
    // build を使う必要があるため、明示的に node build へマップする。
    "^axios$": "<rootDir>/node_modules/axios/dist/node/axios.cjs",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.expo/",
    "/__tests__/test-utils/",
  ],
  // MSW v2 とその依存（rettime / outvariant / @bundled-es-modules / strict-event-emitter / @mswjs/* / @open-draft/* / until-async / headers-polyfill / tough-cookie / set-cookie-parser）は
  // ESM (.mjs) で配布されているため、jest-expo の既定 transformIgnorePatterns に追加して transform 対象に含める。
  transformIgnorePatterns: [
    "/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|msw|@mswjs|@bundled-es-modules|@open-draft|rettime|outvariant|strict-event-emitter|until-async|headers-polyfill|cookie|set-cookie-parser|tough-cookie|tldts|tldts-core|path-to-regexp|statuses))",
    "/node_modules/react-native-reanimated/plugin/",
  ],
  // jest-expo の既定 transform は `\.[jt]sx?$` のみを対象にしているため、
  // `.mjs` ファイル（MSW v2 依存の ESM パッケージで多用）は babel-jest を介して
  // transform するパターンを追加する。
  transform: {
    "^.+\\.mjs$": ["babel-jest", { presets: ["babel-preset-expo"] }],
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "services/**/*.{ts,tsx}",
    "stores/**/*.{ts,tsx}",
    "utils/**/*.{ts,tsx}",
    "!**/__tests__/**",
    "!**/*.d.ts",
  ],
};
