import { create } from "zustand";

/**
 * 認証ストアの状態定義
 *
 * @property isLoggedIn - undefined: 未確認 / true: ログイン済み / false: 未ログイン
 * @property isLoading - トークン検証中かどうか
 *
 * ログアウト処理は useAuth.logout に集約（サーバー sign_out + ローカルストア・
 * クエリキャッシュのクリア + ログイン画面への遷移を一括実行）。本ストアでは
 * 認証状態フラグの管理のみを担当する。
 */
interface AuthState {
  isLoggedIn: boolean | undefined;
  isLoading: boolean;
  setIsLoggedIn: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
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
}));
