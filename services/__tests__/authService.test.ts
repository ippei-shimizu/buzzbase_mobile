/**
 * completeEmailConfirmation の受け入れ条件のテスト。
 *
 * `buzzbase://` は誰でも発火できるため、この端末でサインアップしたメールアドレスと
 * uid が一致する場合だけトークンを受け入れる。ここが崩れるとログイン CSRF になる。
 */
import * as SecureStore from "expo-secure-store";
import { completeEmailConfirmation } from "@services/authService";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../__tests__/test-utils/handlers";
import { server } from "../../jest-setup-msw";

const PENDING_KEY = "pending_confirmation_uid";

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const givenPendingUid = (uid: string | null) => {
  mockedSecureStore.getItemAsync.mockImplementation(async (key: string) =>
    key === PENDING_KEY ? uid : null,
  );
};

const validateTokenSucceeds = () => {
  server.use(
    http.get(apiUrl("/auth/validate_token"), () =>
      HttpResponse.json({
        data: { id: 1, email: "user@example.com", name: "" },
      }),
    ),
  );
};

const deepLinkParams = {
  "access-token": "token-value",
  client: "client-value",
  uid: "user@example.com",
};

const savedAccessToken = () =>
  mockedSecureStore.setItemAsync.mock.calls.find(
    ([key]) => key === "access-token",
  );

describe("completeEmailConfirmation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("確認待ちのメールアドレスと一致するときトークンを保存して認証レスポンスを返す", async () => {
    givenPendingUid("user@example.com");
    validateTokenSucceeds();

    const result = await completeEmailConfirmation(deepLinkParams);

    expect(result?.data.id).toBe(1);
    expect(savedAccessToken()).toEqual([
      "access-token",
      "token-value",
      expect.anything(),
    ]);
  });

  it("大文字小文字の違いは一致として扱う", async () => {
    givenPendingUid("User@Example.com");
    validateTokenSucceeds();

    const result = await completeEmailConfirmation(deepLinkParams);

    expect(result?.data.id).toBe(1);
  });

  it("確認待ちのメールアドレスが無いときは受け入れない", async () => {
    givenPendingUid(null);

    const result = await completeEmailConfirmation(deepLinkParams);

    expect(result).toBeNull();
    expect(savedAccessToken()).toBeUndefined();
  });

  it("確認待ちのメールアドレスと uid が違うときは受け入れない", async () => {
    givenPendingUid("owner@example.com");

    const result = await completeEmailConfirmation({
      ...deepLinkParams,
      uid: "attacker@example.com",
    });

    expect(result).toBeNull();
    expect(savedAccessToken()).toBeUndefined();
  });

  it("トークンが欠けているときは受け入れない", async () => {
    givenPendingUid("user@example.com");

    const result = await completeEmailConfirmation({
      "access-token": "token-value",
      uid: "user@example.com",
    });

    expect(result).toBeNull();
    expect(savedAccessToken()).toBeUndefined();
  });

  it("クエリが配列で渡ったときは受け入れない", async () => {
    givenPendingUid("user@example.com");

    const result = await completeEmailConfirmation({
      ...deepLinkParams,
      "access-token": ["token-value", "other"],
    });

    expect(result).toBeNull();
    expect(savedAccessToken()).toBeUndefined();
  });
});
