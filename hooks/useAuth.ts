import type { SignInData, SignUpData } from "../types/auth";
import * as Sentry from "@sentry/react-native";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { appleSignIn } from "@services/appleAuthService";
import {
  signIn,
  signOut,
  signUp as signUpService,
  resendConfirmation as resendConfirmationService,
  validateToken,
} from "@services/authService";
import { googleSignIn } from "@services/googleAuthService";
import { useAuthStore } from "@stores/authStore";
import { useGameRecordStore } from "@stores/gameRecordStore";
import { getAuthToken, clearAllAuthTokens } from "@utils/authTokenStorage";
import { posthog } from "@utils/posthog";

/**
 * 認証カスタムフック。マウント時に SecureStore のトークンを検証し
 * 認証状態を判定する。
 *
 * @returns isLoggedIn - 認証状態（undefined: 確認中）
 * @returns isLoading - トークン検証中フラグ
 * @returns login - ログイン関数
 * @returns logout - ログアウト関数（サーバー sign_out + ローカル状態リセット + 画面遷移）
 */
export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoggedIn, isLoading, setIsLoggedIn, setIsLoading } = useAuthStore();

  useEffect(() => {
    // 既に認証状態が確定している場合はスキップ
    if (isLoggedIn !== undefined) return;

    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const accessToken = await getAuthToken("access-token");
        if (!accessToken) {
          setIsLoggedIn(false);
          return;
        }
        await validateToken();
        setIsLoggedIn(true);
      } catch (error) {
        // ネットワーク到達不可は認証無効ではないためログイン継続。401 時は
        // axiosInstance のインターセプタ側で clearAllAuthTokens が走る。
        if (isAxiosError(error) && !error.response) {
          setIsLoggedIn(true);
          return;
        }
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [isLoggedIn, setIsLoggedIn, setIsLoading]);

  const login = async (data: SignInData) => {
    const response = await signIn(data);
    setIsLoggedIn(true);
    setIsLoading(false);
    return response;
  };

  /**
   * ログアウト処理（サーバー sign_out + ローカル状態リセット + 画面遷移）。
   * サーバーエラー時もローカルトークンは確実に削除する。
   */
  const logout = async () => {
    try {
      await signOut();
    } catch {
      // signOut 失敗時のトークン残留を防ぐため冪等に削除する。
      await clearAllAuthTokens();
      Sentry.setUser(null);
      posthog?.reset();
    }

    setIsLoggedIn(false);
    useGameRecordStore.getState().reset();
    queryClient.clear();

    // (tabs) 上に push されている画面（settings 等）を畳んでから replace する。
    // 畳まないと (tabs)/_layout の認証ガードが再評価されず、設定画面に留まる。
    if (router.canDismiss()) {
      router.dismissAll();
    }
    router.replace("/(auth)/sign-in");
  };

  const signUp = async (data: SignUpData) => {
    await signUpService(data);
  };

  const resendConfirmation = async (email: string) => {
    await resendConfirmationService(email);
  };

  const googleLogin = async () => {
    const response = await googleSignIn();
    setIsLoggedIn(true);
    setIsLoading(false);
    return response;
  };

  const appleLogin = async () => {
    const response = await appleSignIn();
    if (!response) return null; // ユーザーキャンセル
    setIsLoggedIn(true);
    setIsLoading(false);
    return response;
  };

  return {
    isLoggedIn,
    isLoading,
    login,
    logout,
    signUp,
    resendConfirmation,
    googleLogin,
    appleLogin,
  };
};
