import { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useAuthStore } from "@stores/authStore";
import {
  signIn,
  signOut,
  signUp as signUpService,
  resendConfirmation as resendConfirmationService,
  validateToken,
} from "@services/authService";
import { googleSignIn } from "@services/googleAuthService";
import { appleSignIn } from "@services/appleAuthService";
import type { SignInData, SignUpData } from "../types/auth";

/**
 * 認証カスタムフック
 *
 * TanStack Query + Zustandを組み合わせた認証操作を提供。
 * マウント時にSecureStoreのトークンを検証し、認証状態を自動判定する。
 *
 * @returns isLoggedIn - 認証状態（undefined: 確認中）
 * @returns isLoading - トークン検証中フラグ
 * @returns login - ログイン関数
 * @returns logout - ログアウト関数
 */
export const useAuth = () => {
  const { isLoggedIn, isLoading, setIsLoggedIn, setIsLoading } = useAuthStore();

  useEffect(() => {
    // 既に認証状態が確定している場合はスキップ
    if (isLoggedIn !== undefined) return;

    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const accessToken = await SecureStore.getItemAsync("access-token");
        if (!accessToken) {
          setIsLoggedIn(false);
          return;
        }
        await validateToken();
        setIsLoggedIn(true);
      } catch {
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

  const logout = async () => {
    await signOut();
    setIsLoggedIn(false);
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
