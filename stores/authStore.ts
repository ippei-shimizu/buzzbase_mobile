import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

/**
 * 認証ストアの状態定義
 *
 * @property isLoggedIn - undefined: 未確認 / true: ログイン済み / false: 未ログイン
 * @property isLoading - トークン検証中かどうか
 */
interface AuthState {
  isLoggedIn: boolean | undefined;
  isLoading: boolean;
  setIsLoggedIn: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
  logout: () => Promise<void>;
}

/**
 * Zustand認証ストア
 *
 * Web版のuseAuthContext（React Context）に相当する状態管理。
 * Zustandにより不要な再レンダリングを抑制。
 */
export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: undefined,
  isLoading: true,
  setIsLoggedIn: (value: boolean) => set({ isLoggedIn: value }),
  setIsLoading: (value: boolean) => set({ isLoading: value }),
  logout: async () => {
    await SecureStore.deleteItemAsync("access-token");
    await SecureStore.deleteItemAsync("client");
    await SecureStore.deleteItemAsync("uid");
    set({ isLoggedIn: false });
  },
}));
