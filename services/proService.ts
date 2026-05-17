import type { EntitlementsResponse, ProStatus } from "../types/pro";
import axiosInstance from "@utils/axiosInstance";

/**
 * 現在ユーザーの Pro 加入状態と保有 entitlement を取得する。
 * /api/v1/pro/status から { subscription, entitlements } を返す。
 */
export const fetchProStatus = async (): Promise<ProStatus> => {
  const response = await axiosInstance.get<ProStatus>("/pro/status");
  return response.data;
};

/**
 * 全 entitlement キーごとの granted フラグを取得する。
 * 個別画面で「この機能が利用可能か」のチェックリスト的に使う。
 */
export const fetchEntitlements = async (): Promise<EntitlementsResponse> => {
  const response =
    await axiosInstance.get<EntitlementsResponse>("/pro/entitlements");
  return response.data;
};

/**
 * RevenueCat と Rails の Pro 状態を再同期する。
 * 本Issueはスタブで last_synced_at の更新のみ。実同期ロジックは #318 で実装する。
 */
export const syncProStatus = async (): Promise<ProStatus> => {
  const response = await axiosInstance.post<ProStatus>("/pro/sync");
  return response.data;
};
