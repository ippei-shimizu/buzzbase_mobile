import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import {
  clearAllAuthTokens,
  deleteAuthToken,
  getAuthToken,
  saveAuthTokensFromHeaders,
  setAuthToken,
} from "../authTokenStorage";

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockedSentry = Sentry as jest.Mocked<typeof Sentry>;

describe("authTokenStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAuthToken", () => {
    it("読み出しに成功した場合は値を返す", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValueOnce("token-value");
      const result = await getAuthToken("access-token");
      expect(result).toBe("token-value");
      expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith(
        "access-token",
      );
    });

    it("キーチェーンがロック中等で例外になっても null を返しSentryに記録する", async () => {
      const error = new Error("User interaction is not allowed.");
      mockedSecureStore.getItemAsync.mockRejectedValueOnce(error);

      const result = await getAuthToken("access-token");

      expect(result).toBeNull();
      expect(mockedSentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: expect.objectContaining({
            source: "authTokenStorage",
            op: "get",
            key: "access-token",
          }),
        }),
      );
    });
  });

  describe("setAuthToken", () => {
    it("AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY を指定して保存する", async () => {
      mockedSecureStore.setItemAsync.mockResolvedValueOnce(undefined);

      await setAuthToken("access-token", "new-token");

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "access-token",
        "new-token",
        {
          keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
        },
      );
    });

    it("保存に失敗しても例外を伝播させずSentryに記録する", async () => {
      const error = new Error("write failed");
      mockedSecureStore.setItemAsync.mockRejectedValueOnce(error);

      await expect(setAuthToken("client", "value")).resolves.toBeUndefined();
      expect(mockedSentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: expect.objectContaining({ op: "set", key: "client" }),
        }),
      );
    });
  });

  describe("deleteAuthToken", () => {
    it("削除を SecureStore.deleteItemAsync に委譲する", async () => {
      mockedSecureStore.deleteItemAsync.mockResolvedValueOnce(undefined);
      await deleteAuthToken("uid");
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("uid");
    });

    it("削除失敗時も例外を伝播させずSentryに記録する", async () => {
      const error = new Error("delete failed");
      mockedSecureStore.deleteItemAsync.mockRejectedValueOnce(error);

      await expect(deleteAuthToken("uid")).resolves.toBeUndefined();
      expect(mockedSentry.captureException).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          tags: expect.objectContaining({ op: "delete", key: "uid" }),
        }),
      );
    });
  });

  describe("clearAllAuthTokens", () => {
    it("3つのトークンをまとめて削除する", async () => {
      mockedSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await clearAllAuthTokens();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "access-token",
      );
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("client");
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith("uid");
    });
  });

  describe("saveAuthTokensFromHeaders", () => {
    it("3つのヘッダーが揃っていれば全部を保存する", async () => {
      mockedSecureStore.setItemAsync.mockResolvedValue(undefined);

      await saveAuthTokensFromHeaders({
        "access-token": "a",
        client: "c",
        uid: "u",
      });

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "access-token",
        "a",
        expect.any(Object),
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "client",
        "c",
        expect.any(Object),
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "uid",
        "u",
        expect.any(Object),
      );
    });

    it("いずれかのヘッダーが欠けていれば何も保存しない", async () => {
      await saveAuthTokensFromHeaders({
        "access-token": "a",
        client: "c",
      });
      expect(mockedSecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });
});
