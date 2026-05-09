import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";

/**
 * devise_token_auth用の認証トークン（access-token / client / uid）を
 * iOSキーチェーン・Android Keystore上に保管するためのラッパ。
 *
 * デフォルトの `kSecAttrAccessibleWhenUnlocked` ではデバイスがロックされている間に
 * キーチェーン項目を読み書きできず、`User interaction is not allowed.`
 * （expo-secure-store の `getValueWithKeyAsync` が失敗）が発生するため、
 * 一度ロック解除以降はバックグラウンドからもアクセス可能な
 * `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` を一律で指定する。
 *
 * また、ロック中・初回起動直後など読み取りが失敗するケースでも
 * 呼び出し元で例外が伝播しないよう、try/catchでハンドリングしSentryに記録する。
 */

/** devise_token_authが使用する3つのトークンキー */
export type AuthTokenKey = "access-token" | "client" | "uid";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

/**
 * トークンを取得する。
 *
 * キーチェーンがロックされている等の理由で読めない場合は例外を投げず `null` を返す。
 * これにより呼び出し側はトークン未設定と同じハンドリングが可能。
 *
 * @param key 取得するトークンのキー
 * @return トークン文字列。読み取り失敗または未保存の場合は `null`
 */
export const getAuthToken = async (
  key: AuthTokenKey,
): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: "authTokenStorage", op: "get", key },
    });
    return null;
  }
};

/**
 * トークンを保存する。失敗時はSentryに記録するのみで例外を伝播させない。
 *
 * @param key 保存するトークンのキー
 * @param value 保存する値
 */
export const setAuthToken = async (
  key: AuthTokenKey,
  value: string,
): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: "authTokenStorage", op: "set", key },
    });
  }
};

/**
 * トークンを削除する。失敗時はSentryに記録するのみで例外を伝播させない。
 *
 * @param key 削除するトークンのキー
 */
export const deleteAuthToken = async (key: AuthTokenKey): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { source: "authTokenStorage", op: "delete", key },
    });
  }
};

/**
 * 全認証トークン（access-token / client / uid）をまとめて削除する。
 * ログアウト時や401レスポンス受信時に使用。
 */
export const clearAllAuthTokens = async (): Promise<void> => {
  await Promise.all([
    deleteAuthToken("access-token"),
    deleteAuthToken("client"),
    deleteAuthToken("uid"),
  ]);
};

/**
 * devise_token_authのレスポンスヘッダーから認証トークンをまとめて保存する。
 * `access-token` `client` `uid` のいずれかが欠けている場合は何もしない。
 *
 * @param headers レスポンスヘッダー
 */
export const saveAuthTokensFromHeaders = async (
  headers: Record<string, string | undefined>,
): Promise<void> => {
  const accessToken = headers["access-token"];
  const client = headers["client"];
  const uid = headers["uid"];
  if (!accessToken || !client || !uid) return;
  await Promise.all([
    setAuthToken("access-token", accessToken),
    setAuthToken("client", client),
    setAuthToken("uid", uid),
  ]);
};
