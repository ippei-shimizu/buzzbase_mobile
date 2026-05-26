import axiosInstance from "@utils/axiosInstance";

// back の PUBLIC_KEYS と一致させる。新規キー追加時は back と type 両方を同期更新する。
export type FeatureFlagKey = "pro_features" | "cancellation_survey";

export type FeatureFlagsResponse = Partial<Record<FeatureFlagKey, boolean>>;

/**
 * 指定したフラグキーの有効状態をまとめて取得する。
 * back はフラット形式 `{ pro_features: true, ... }` を返し、未知 key は含めずに返却する。
 */
export const fetchFeatureFlags = async (
  keys: readonly FeatureFlagKey[],
): Promise<FeatureFlagsResponse> => {
  const response = await axiosInstance.get<FeatureFlagsResponse>(
    "/feature_flags",
    {
      params: { keys: keys as string[] },
    },
  );
  return response.data;
};
