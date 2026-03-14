import { useEffect } from "react";
import { useAuthStore } from "@stores/authStore";
import {
  signIn,
  signOut,
  signUp as signUpService,
  resendConfirmation as resendConfirmationService,
  validateToken,
} from "@services/authService";
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
  const { isLoggedIn, isLoading, setIsLoggedIn, setIsLoading } =
    useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        await validateToken();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [setIsLoggedIn, setIsLoading]);

  const login = async (data: SignInData) => {
    const response = await signIn(data);
    setIsLoggedIn(true);
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

  return { isLoggedIn, isLoading, login, logout, signUp, resendConfirmation };
};
