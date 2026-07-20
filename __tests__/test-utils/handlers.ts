import { http, HttpResponse } from "msw";
import { API_BASE_URL, API_V1_URL } from "@constants/api";

/**
 * MSW の既定ハンドラ集。
 *
 * 各テストで `server.use(...)` で個別にハンドラを定義する。
 * `onUnhandledRequest: "error"` を有効にしているため、ハンドラ未定義の
 * リクエストはエラーログを出す。テストロジックに直接関係しない
 * クエリ系（teams / positions / tournaments など、useGameRecord 等が
 * マウント時に走らせるもの）はデフォルトで空配列を返してノイズを抑える。
 */
export const defaultHandlers = [
  http.get(`${API_V1_URL}/teams`, () => HttpResponse.json([])),
  http.get(`${API_V1_URL}/positions`, () => HttpResponse.json([])),
  http.get(`${API_V1_URL}/tournaments`, () => HttpResponse.json([])),
  // 上達ループ機能のフックが各画面のマウント時に走らせる GET。個別テストで
  // 必要なら server.use(...) で上書きする。既定は空を返してノイズを抑える。
  http.get(`${API_BASE_URL}/api/v2/improvement_themes`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${API_BASE_URL}/api/v2/reflection_templates`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${API_BASE_URL}/api/v2/periodic_reviews`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${API_BASE_URL}/api/v2/baseball_notes`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${API_V1_URL}/match_results/available_months`, () =>
    HttpResponse.json([]),
  ),
];

/**
 * URL ヘルパー: バックエンドのフルパスを構築する。
 * v1 系は `API_V1_URL`、devise_token_auth 等は `API_BASE_URL` 配下に存在する。
 */
export const apiUrl = (path: string): string => {
  if (path.startsWith("/")) {
    return `${API_V1_URL}${path}`;
  }
  return `${API_V1_URL}/${path}`;
};

export const baseUrl = (path: string): string => {
  if (path.startsWith("/")) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
};

/**
 * devise_token_auth 形式の認証成功レスポンスヘッダーを生成する。
 */
export const authSuccessHeaders = (
  overrides?: Partial<Record<"access-token" | "client" | "uid", string>>,
): Record<string, string> => ({
  "access-token": "test-access-token",
  client: "test-client",
  uid: "test-uid",
  "content-type": "application/json",
  ...overrides,
});

export { http, HttpResponse };
