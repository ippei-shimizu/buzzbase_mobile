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
 * グループの作成・参加が無料枠の上限で拒否された403かどうかを判定する。
 *
 * 対象エンドポイントに将来別理由の403が増えても誤判定しないよう、
 * status だけでなく back が返す安定コード（`group_limit_exceeded`）まで見る。
 *
 * @param error - try/catchで受けた error 値（unknown）
 * @returns AxiosErrorかつグループ上限到達による403の場合のみ true
 */
export const isGroupLimitError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error) || error.response?.status !== 403)
    return false;

  const data = error.response.data as { error?: string } | undefined;
  return data?.error === "group_limit_exceeded";
};

/**
 * グループ上限エラー（403 group_limit_exceeded）のサーバー文言を取り出す。
 *
 * @param error - try/catchで受けた error 値（unknown）
 * @returns サーバーが返した表示用メッセージ。無ければ undefined
 */
export const groupLimitErrorMessage = (error: unknown): string | undefined => {
  if (!axios.isAxiosError(error)) return undefined;

  const data = error.response?.data as { message?: string } | undefined;
  return data?.message;
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

export const RATE_LIMIT_FALLBACK_MESSAGE =
  "試行回数が上限に達しました。しばらく時間をおいてからお試しください";

/**
 * back の rack-attack によるレート制限（429）かどうかを判定する。
 *
 * 他の429と取り違えないよう、status だけでなく安定コード（`rate_limit_exceeded`）まで見る。
 *
 * @param error - try/catchで受けた error 値（unknown）
 * @returns AxiosErrorかつレート制限による429の場合のみ true
 */
export const isRateLimitError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error) || error.response?.status !== 429)
    return false;

  const data = error.response.data as { error?: string } | undefined;
  return data?.error === "rate_limit_exceeded";
};

/**
 * レート制限エラーの表示文言を返す。文言は back に一元化しているため message を優先する。
 *
 * @param error - try/catchで受けた error 値（unknown）
 * @returns 表示用メッセージ
 */
export const rateLimitErrorMessage = (error: unknown): string => {
  if (!axios.isAxiosError(error)) return RATE_LIMIT_FALLBACK_MESSAGE;

  const data = error.response?.data as { message?: string } | undefined;
  return data?.message || RATE_LIMIT_FALLBACK_MESSAGE;
};
