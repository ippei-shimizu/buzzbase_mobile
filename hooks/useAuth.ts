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

/**
 * 認証カスタムフック
 *
 * TanStack Query + Zustandを組み合わせた認証操作を提供。
 * マウント時にSecureStoreのトークンを検証し、認証状態を自動判定する。
 *
 * @returns isLoggedIn - 認証状態（undefined: 確認中）
 * @returns isLoading - トークン検証中フラグ
 * @returns login - ログイン関数
 * @returns logout - ログアウト関数（サーバー sign_out + ローカルストア・クエリキャッシュクリア + 画面遷移）
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
        // ネットワーク到達不可は「認証無効」ではないため、トークンを保持したまま
        // 楽観的にログイン継続。後続APIで401が返った場合は axiosInstance の
        // レスポンスインターセプタが clearAllAuthTokens を実行する。
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
   * ログアウト処理。
   * - サーバー側 sign_out API を呼ぶ
   * - サーバーが unreachable / エラー時もローカルトークンは確実に削除する
   * - Zustand ストア（authStore / gameRecordStore）をリセット
   * - TanStack Query のキャッシュをクリア
   * - Sentry のユーザー識別をクリア
   * - ログイン画面に置き換え遷移する
   */
  const logout = async () => {
    try {
      await signOut();
    } catch {
      // サーバーへのリクエストが失敗してもローカルログアウトは続行する。
      // signOut 内で clearAllAuthTokens が呼ばれる前に失敗した可能性もあるため、
      // ここで冪等に呼び直しトークン残留を防ぐ。
      await clearAllAuthTokens();
      Sentry.setUser(null);
    }

    // 画面・データのキャッシュをクリア
    setIsLoggedIn(false);
    useGameRecordStore.getState().reset();
    queryClient.clear();

    // ログイン画面に置き換え遷移（戻る操作で元の画面に戻れないようにする）
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
