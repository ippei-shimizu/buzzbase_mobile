/** ログインリクエストのデータ */
export interface SignInData {
  email: string;
  password: string;
}

/** サインアップリクエストのデータ */
export interface SignUpData {
  email: string;
  password: string;
  passwordConfirmation: string;
}

/** ユーザー情報 */
export interface User {
  id: number;
  email: string;
  name: string;
}

/** 認証APIのレスポンス */
export interface AuthResponse {
  data: User;
}
