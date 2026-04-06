/**
 * 認証APIサービス
 *
 * devise_token_authのエンドポイントと通信し、
 * レスポンスヘッダーからトークンをSecureStoreに保存する。
 * Web版 front/app/services/authService.tsx に対応。
 */
import * as SecureStore from "expo-secure-store";
import type { AuthResponse, SignInData, SignUpData } from "../types/auth";
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
  return response.data;
};

/** ログアウトしSecureStoreからトークンを削除 */
export const signOut = async (): Promise<void> => {
  await axiosInstance.delete("/auth/sign_out");
  await SecureStore.deleteItemAsync("access-token");
  await SecureStore.deleteItemAsync("client");
  await SecureStore.deleteItemAsync("uid");
};

/** SecureStoreのトークンが有効か検証（アプリ起動時に使用） */
export const validateToken = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.get("/auth/validate_token");
  return response.data;
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
