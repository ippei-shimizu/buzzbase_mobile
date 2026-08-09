import axios from "axios";

/**
 * axiosの404エラーかどうかを判定する。
 *
 * 用途: DELETE系API呼び出しで「既にサーバ側に該当リソースが無い」ケースを
 * 「成功扱い」にするための判定。クライアント側のキャッシュやナビゲーション
 * パラメータに古いidが残った場合の404連打ループを断つために使用する。
 *
 * @param error - try/catchで受けた error 値（unknown）
 * @returns AxiosErrorかつ status が 404 の場合のみ true
 */
export const isAxios404 = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 404;
};

/**
 * axiosの403エラーかどうかを判定する。
 *
 * 用途: Pro プランの上限に達したときにバックエンドが返す 403 を、
 * 汎用エラー表示ではなく Paywall 誘導に振り分けるための判定。
 *
 * @param error - try/catchで受けた error 値（unknown）
 * @returns AxiosErrorかつ status が 403 の場合のみ true
 */
export const isAxios403 = (error: unknown): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 403;
};

/**
 * APIが返した日本語エラーメッセージを取り出す。
 *
 * バックエンドはバリデーション失敗を `{ errors: [...] }`、権限エラーを `{ error: "..." }` で
 * 返すため、どちらの形でも1つの文字列に畳んで返す。
 *
 * @param error - try/catchで受けた error 値（unknown）
 * @returns 表示可能なメッセージ。API由来のメッセージが無ければ undefined
 */
export const serverErrorMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined;

  const data = error.response?.data as
    | { errors?: string[]; error?: string }
    | undefined;
  if (data?.errors?.length) return data.errors.join("\n");
  return data?.error;
};
