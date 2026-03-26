// Expo Router + React 19 の既知の互換性エラーを抑制
// Stackコンポーネントが内部的にFragmentにonLayoutを渡す問題
const orig = console.error.bind(console);
console.error = (...args) => {
  if (typeof args[0] === "string" && args[0].includes("React.Fragment")) {
    return;
  }
  orig(...args);
};

// expo-router のエントリーポイントを読み込み
require("expo-router/entry");
