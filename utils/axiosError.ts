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
