import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_V1_URL } from "@constants/api";

/**
 * axios共通インスタンス
 *
 * devise_token_auth用のインターセプタを設定:
 * - リクエスト: SecureStoreから認証トークンをヘッダーに付与
 * - レスポンス: 新しいトークンがあればSecureStoreを更新、401時はトークンをクリア
 */
const axiosInstance = axios.create({
  baseURL: API_V1_URL,
});

/** リクエストインターセプタ: SecureStoreから認証ヘッダーを自動付与 */
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await SecureStore.getItemAsync("access-token");
  const client = await SecureStore.getItemAsync("client");
  const uid = await SecureStore.getItemAsync("uid");

  if (accessToken && client && uid) {
    config.headers["access-token"] = accessToken;
    config.headers["client"] = client;
    config.headers["uid"] = uid;
  }

  return config;
});

/** レスポンスインターセプタ: トークン自動更新・401時のトークンクリア */
axiosInstance.interceptors.response.use(
  (response) => {
    const newToken = response.headers["access-token"];
    if (newToken) {
      SecureStore.setItemAsync("access-token", newToken);
      SecureStore.setItemAsync("client", response.headers["client"]);
      SecureStore.setItemAsync("uid", response.headers["uid"]);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("access-token");
      await SecureStore.deleteItemAsync("client");
      await SecureStore.deleteItemAsync("uid");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
