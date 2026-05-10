/**
 * MSW v2 を Jest 環境で起動するセットアップ。
 *
 * 方針:
 * - 振る舞いテスト（Issue #299）の土台として、サービス関数を `jest.mock` する代わりに
 *   HTTP 層を MSW でモックする。これにより services/ や hooks/ のリファクタで
 *   テストが壊れにくくなる。
 * - jest-expo 環境では React Native の fetch / XHR 経路が走らないため、
 *   テスト時のみ axios の adapter を node の `http` に切り替える。これで
 *   `msw/node` の `setupServer` が intercept 可能になる。
 *
 * 使い方:
 * - 個別テストで `import { server } from "../../jest-setup-msw"` し、
 *   `server.use(http.post(...))` で個別ハンドラを上書きする。
 * - 既定ハンドラは `__tests__/test-utils/handlers.ts` で定義。
 *
 * 注意: axiosInstance は遅延 require する。setupFiles 段階の expo/winter
 * polyfill が完了する前に axios が読まれると `Object.defineProperty called on
 * non-object` で失敗するため。
 */
import { setupServer } from "msw/node";
import { defaultHandlers } from "./__tests__/test-utils/handlers";

export const server = setupServer(...defaultHandlers);

beforeAll(() => {
  // axiosInstance は遅延 require（expo/winter の URL/URLSearchParams polyfill が
  // 完了した後に axios を読み込むため）。
  // axios v1 の adapter 切替: 文字列 "http" 指定で node http adapter を選択。
  // これにより msw/node の interceptor が動く。
  //
  // 既存テストの一部は `jest.mock("axios", ...)` で axios を最小スタブに置き換えて
  // いるため、その場合は require/adapter 切替に失敗する。この場合は adapter 切替を
  // スキップする（HTTP リクエスト自体が発生しないため MSW intercept は不要）。
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const axiosInstance = require("@utils/axiosInstance").default;
    if (axiosInstance?.defaults) {
      axiosInstance.defaults.adapter = "http";
    }
  } catch {
    // axios がモック化されているテストでは require が失敗するため無視する
  }
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
