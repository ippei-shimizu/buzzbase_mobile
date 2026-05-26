import { useQuery } from "@tanstack/react-query";
import {
  fetchFeatureFlags,
  type FeatureFlagKey,
} from "@services/featureFlagsService";

const FEATURE_FLAG_STALE_TIME_MS = 5 * 60 * 1000;

/**
 * 指定キーの Feature Flag を取得する。
 * API 失敗 / 未定義 / 明示的に false は全て **false 扱い** に倒す（安全側）。
 * Pro 機能のような「明示的 enable のときだけ露出する」用途を想定。
 */
export const useFeatureFlag = (key: FeatureFlagKey): boolean => {
  const { data } = useQuery({
    queryKey: ["featureFlags", key],
    queryFn: () => fetchFeatureFlags([key]),
    staleTime: FEATURE_FLAG_STALE_TIME_MS,
  });
  return data?.[key] === true;
};
