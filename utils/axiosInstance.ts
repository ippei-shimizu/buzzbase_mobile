import * as Sentry from "@sentry/react-native";
import axios from "axios";
import { API_V1_URL } from "@constants/api";
import {
  clearAllAuthTokens,
  getAuthToken,
  saveAuthTokensFromHeaders,
} from "./authTokenStorage";

/**
 * axios共通インスタンス
 *
 * devise_token_auth用のインターセプタを設定:
 * - リクエスト: 認証トークンをSecureStore（`utils/authTokenStorage`）から読み出してヘッダーに付与
 * - レスポンス: 新しいトークンがあればSecureStoreを更新、401時はトークンをクリア
 *
 * SecureStoreの読み書きは `authTokenStorage` で `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY` を
 * 指定し、ロック中・バックグラウンド時にも例外を伝播させずSentryに記録する。
 */
const axiosInstance = axios.create({
  baseURL: API_V1_URL,
});

/** リクエストインターセプタ: 認証ヘッダーを並列に取得してまとめて付与 */
axiosInstance.interceptors.request.use(async (config) => {
  const [accessToken, client, uid] = await Promise.all([
    getAuthToken("access-token"),
    getAuthToken("client"),
    getAuthToken("uid"),
  ]);

  if (accessToken && client && uid) {
    config.headers["access-token"] = accessToken;
    config.headers["client"] = client;
    config.headers["uid"] = uid;
  }

  return config;
});

/** レスポンスインターセプタ: トークン自動更新・401時のトークンクリア */
axiosInstance.interceptors.response.use(
  async (response) => {
    const newToken = response.headers["access-token"];
    if (newToken) {
      await saveAuthTokensFromHeaders(
        response.headers as Record<string, string>,
      );
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await clearAllAuthTokens();
    } else if (!error.response || error.response.status >= 500) {
      Sentry.captureException(error, {
        tags: {
          source: "axios",
          status: String(error.response?.status ?? "network"),
        },
        extra: {
          url: error.config?.url,
          method: error.config?.method,
        },
      });
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
