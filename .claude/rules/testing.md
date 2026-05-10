# テストルール

mobile アプリのテスト方針。**「リファクタしても壊れにくいテスト」を最優先**とする。

テストはコードの内部構造（関数の分割、状態管理の選択、useEffect の挙動など）ではなく、
**ユーザーから見た振る舞い**（操作 → API リクエスト → 表示の変化）を担保する。
内部構造に依存したテストは、関数名やファイル分割を変えただけで壊れ、
「リファクタを止めるための足かせ」になってしまうため避ける。

## 基本方針: Testing Trophy

| 層              | 比重     | 用途                                    |
| --------------- | -------- | --------------------------------------- |
| Static          | 既存     | TypeScript / ESLint                     |
| **Integration** | **最大** | 画面〜API までの結合テスト（中核）      |
| Unit            | 中       | 純粋関数 / 複雑ロジックのフック・ストア |
| E2E             | 最小     | 任意                                    |

**テストの信頼性は、本番でユーザーがソフトウェアを使う流れにテストがどれだけ近いかに比例する**。
内部実装に近づくほどテストは脆くなり、ユーザー操作に近づくほどリグレッションを正しく検出できる。

- やる: ユーザー操作 → API リクエスト発火 → 表示更新 を 1 本でテスト
- やらない: 内部 state、useEffect の発火、特定関数の呼び出しのアサーション
- やらない: Snapshot テスト（原則）

## HTTP モック: MSW v2

サービス関数を `jest.mock` する旧方式は採用しない。代わりに **MSW v2 で HTTP 層を intercept** する。
これにより `services/`・`hooks/` のリファクタでテストが壊れにくくなる。

```ts
import { server } from "@/jest-setup-msw";
import { apiUrl, http, HttpResponse } from "@/__tests__/test-utils/handlers";

server.use(
  http.post(apiUrl("/auth/sign_in"), () =>
    HttpResponse.json({ data: { id: 1 } }, { headers: authSuccessHeaders() }),
  ),
);
```

### MSW セットアップの仕組み

- `jest-setup-msw.ts` が `setupFilesAfterEnv` で `setupServer(...)` を起動。
- axios v1 は jest-expo 環境で `react-native` 条件の browser build に解決されるため、
  `jest.config.js` の `moduleNameMapper` で **node build に強制マップ**し、
  `axiosInstance.defaults.adapter = "http"` で node http adapter を選択する。
  これにより `msw/node` の interceptor が axios リクエストを補足できる。
- `onUnhandledRequest: "error"` でハンドラ未定義リクエストはエラー扱い。

### 既定ハンドラ

`__tests__/test-utils/handlers.ts` に共通ハンドラ（teams / positions / tournaments など、
試合記録ウィザードのマウント時に走るクエリ）を定義済み。テスト固有の挙動が必要なら
`server.use(...)` で個別上書きする。

## クエリの優先順位

`@testing-library/react-native` のクエリは以下の優先順で使う:

1. **`getByRole`** / **`getByLabelText`** — アクセシビリティ寄り、最優先
2. `getByPlaceholderText` / `getByText` — UI ラベル経由
3. `getByTestId` — **最後の手段**。testID は実装詳細なので増やさない

## 許容するモック / 禁止するモック

| 対象                                                                                         | 方針                                    |
| -------------------------------------------------------------------------------------------- | --------------------------------------- |
| `services/*`、`@utils/axiosInstance`                                                         | **jest.mock しない** — MSW で intercept |
| `expo-router` (`useRouter` / `useLocalSearchParams`)                                         | jest.mock OK — 環境境界                 |
| `expo-secure-store` / `@sentry/react-native` / `react-native-reanimated`                     | グローバルモック済 (`jest-setup.ts`)    |
| `@react-native-google-signin/google-signin` / `expo-apple-authentication` / `expo-constants` | jest.mock OK — Native Module 境界       |
| `react-native` 標準 API（`Share` 等）                                                        | `jest.spyOn` で局所モック OK            |

新規テストで `jest.mock("@services/...")` を書いてはならない。レビューで指摘する。

## テストユーティリティ

- `__tests__/test-utils/renderWithProviders.tsx` — QueryClient（retry: false）を自動でラップする render
- `__tests__/test-utils/mockExpoRouter.ts` — `buildExpoRouterMock()` で expo-router のモック生成
- `__tests__/test-utils/handlers.ts` — `apiUrl`、`authSuccessHeaders`、共通ハンドラ
- `__tests__/test-utils/factories/` — テストデータビルダー（`buildGameResult`、`buildAuthUser` など）

`jest.mock` の factory は外部スコープを参照できないため、factory 内で `require` する:

```ts
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

const getRouterSpies = () => {
  const m = require("expo-router") as { __routerSpies: RouterSpies };
  return m.__routerSpies;
};
```

## アンチパターン

| やらない                        | 理由                                                  |
| ------------------------------- | ----------------------------------------------------- |
| サービス関数を `jest.mock` する | 関数分割を変えた瞬間に壊れる → MSW で HTTP 層をモック |
| Snapshot テストを多用           | レイアウト調整で全部壊れる                            |
| `getByTestId` を多用            | testId は実装詳細                                     |
| 内部 state を直接 assert        | 状態管理を変えると壊れる → 公開 UI / 公開 action 経由 |
| `useEffect` の発火を assert     | 実装詳細の極み                                        |
| カバレッジ 100% を目標化        | 価値の低いテストが量産される                          |
| リファクタ後にテストを書く      | 壊れた振る舞いを「正常」として固定化する              |

## カバレッジ目標（参考値）

- `utils/`: 90%+
- `services/`（MSW で間接的に）: 70%+
- `hooks/`（複雑なものに限る）: 70%+
- `stores/`: 80%+
- 画面（クリティカルパス）: 主要シナリオが結合テストで通っている
