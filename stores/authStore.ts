import { create } from "zustand";

/**
 * 認証ストアの状態定義。ログアウト処理は useAuth.logout に集約しているため、
 * 本ストアは状態フラグの管理のみを担う。
 *
 * @property isLoggedIn - undefined: 未確認 / true: ログイン済み / false: 未ログイン
 * @property isLoading - トークン検証中かどうか
 */
interface AuthState {
  isLoggedIn: boolean | undefined;
  isLoading: boolean;
  setIsLoggedIn: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}

/** Zustand 認証ストア（Web 版の useAuthContext 相当）。 */
export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: undefined,
  isLoading: true,
  setIsLoggedIn: (value: boolean) => set({ isLoggedIn: value }),
  setIsLoading: (value: boolean) => set({ isLoading: value }),
}));
