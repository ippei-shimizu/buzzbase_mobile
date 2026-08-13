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
 * サーバー側が RevenueCat REST API から subscriber 状態を取得して Subscription に反映する。
 * Webhook の取りこぼし・配信遅延時のリカバリとして購入直後や同期ボタンから呼ぶ。
 */
export const syncProStatus = async (): Promise<ProStatus> => {
  const response = await axiosInstance.post<ProStatus>("/pro/sync");
  return response.data;
};

/**
 * Web(Stripe)加入者向けの解約申請。cancel_at_period_end で期限まで利用継続する。
 * iOS/Android の IAP 加入には Stripe サブスクリプションが存在せず使えないため、
 * subscription.platform === "web" のときのみ呼び出すこと。
 */
export const cancelWebSubscription = async (): Promise<void> => {
  await axiosInstance.delete("/pro/subscription");
};
