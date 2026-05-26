/**
 * 認証APIサービス
 *
 * devise_token_authのエンドポイントと通信する。
 * トークン保存は axiosInstance のレスポンスインターセプタで一元管理されるため、
 * 各サービスでは明示的に保存しない（トークンは取得→ヘッダー→インターセプタの経路で保管）。
 * Web版 front/app/services/authService.tsx に対応。
 */
import type { AuthResponse, SignInData, SignUpData } from "../types/auth";
import * as Sentry from "@sentry/react-native";
import { loginRevenueCat, logoutRevenueCat } from "@services/revenueCatService";
import { clearAllAuthTokens } from "@utils/authTokenStorage";
import axiosInstance from "@utils/axiosInstance";

// RevenueCat の alias 付け失敗で認証フローが落ちないよう、fire-and-forget で呼ぶ。
// SDK / ネットワーク失敗時は Sentry に飛ばし、状態は次回起動時の validateToken で再同期する。
const syncRevenueCatLogin = (userId: string): void => {
  loginRevenueCat(userId).catch((error: unknown) => {
    Sentry.captureException(error, {
      tags: { source: "revenue_cat_login" },
    });
  });
};

const syncRevenueCatLogout = (): void => {
  logoutRevenueCat().catch((error: unknown) => {
    Sentry.captureException(error, {
      tags: { source: "revenue_cat_logout" },
    });
  });
};

/** メールアドレスとパスワードでログイン */
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/auth/sign_in", {
    email: data.email,
    password: data.password,
  });
  const body = response.data as AuthResponse;
  if (body.data?.id) {
    Sentry.setUser({ id: String(body.data.id) });
    syncRevenueCatLogin(String(body.data.id));
  }
  return body;
};

/** ログアウトしSecureStoreからトークンを削除 */
export const signOut = async (): Promise<void> => {
  await axiosInstance.delete("/auth/sign_out");
  await clearAllAuthTokens();
  Sentry.setUser(null);
  syncRevenueCatLogout();
};

/** SecureStoreのトークンが有効か検証（アプリ起動時に使用） */
export const validateToken = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.get("/auth/validate_token");
  const body = response.data as AuthResponse;
  if (body.data?.id) {
    Sentry.setUser({ id: String(body.data.id) });
    syncRevenueCatLogin(String(body.data.id));
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
