/**
 * 認証APIサービス
 *
 * devise_token_authのエンドポイントと通信し、
 * レスポンスヘッダーからトークンをSecureStoreに保存する。
 * Web版 front/app/services/authService.tsx に対応。
 */
import type { AuthResponse, SignInData, SignUpData } from "../types/auth";
import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import axiosInstance from "@utils/axiosInstance";

/** レスポンスヘッダーから認証トークンをSecureStoreに保存 */
const saveTokens = async (headers: Record<string, string>) => {
  const accessToken = headers["access-token"];
  if (accessToken) {
    await SecureStore.setItemAsync("access-token", accessToken);
    await SecureStore.setItemAsync("client", headers["client"]);
    await SecureStore.setItemAsync("uid", headers["uid"]);
  }
};

/** メールアドレスとパスワードでログイン */
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/sign_in", {
    email: data.email,
    password: data.password,
  });
  await saveTokens(response.headers as Record<string, string>);
  const body = response.data as AuthResponse;
  if (body.data?.id) {
    Sentry.setUser({ id: String(body.data.id) });
  }
  return body;
};

/** ログアウトしSecureStoreからトークンを削除 */
export const signOut = async (): Promise<void> => {
  await axiosInstance.delete("/auth/sign_out");
  await SecureStore.deleteItemAsync("access-token");
  await SecureStore.deleteItemAsync("client");
  await SecureStore.deleteItemAsync("uid");
  Sentry.setUser(null);
};

/** SecureStoreのトークンが有効か検証（アプリ起動時に使用） */
export const validateToken = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.get("/auth/validate_token");
  const body = response.data as AuthResponse;
  if (body.data?.id) {
    Sentry.setUser({ id: String(body.data.id) });
  }
  return body;
};

/** メールアドレスとパスワードでサインアップ（トークンは保存しない。メール確認が先） */
export const signUp = async (data: SignUpData): Promise<void> => {
  await axiosInstance.post("/auth", {
    email: data.email,
    password: data.password,
    password_confirmation: data.passwordConfirmation,
    confirm_success_url:
      process.env.EXPO_PUBLIC_CONFIRM_SUCCESS_URL ||
      "buzzbase://confirmation-success",
  });
};

/** 確認メールを再送信 */
export const resendConfirmation = async (email: string): Promise<void> => {
  await axiosInstance.post("/auth/confirmation", {
    email,
    redirect_url:
      process.env.EXPO_PUBLIC_CONFIRM_SUCCESS_URL ||
      "buzzbase://confirmation-success",
  });
};
