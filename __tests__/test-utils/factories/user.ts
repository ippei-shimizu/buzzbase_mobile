/**
 * 認証 API のレスポンスボディに使うユーザー情報のテストデータビルダー。
 * devise_token_auth の `data` 配下の構造を模倣する。
 */
export interface TestAuthUser {
  id: number;
  email: string;
  name: string;
  user_id: string;
}

export const buildAuthUser = (
  overrides: Partial<TestAuthUser> = {},
): TestAuthUser => ({
  id: 1,
  email: "test@example.com",
  name: "テストユーザー",
  user_id: "test_user",
  ...overrides,
});
