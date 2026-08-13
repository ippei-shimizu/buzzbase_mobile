import { useQuery } from "@tanstack/react-query";
import {
  fetchFeatureFlags,
  type FeatureFlagKey,
} from "@services/featureFlagsService";

const FEATURE_FLAG_STALE_TIME_MS = 5 * 60 * 1000;

export interface FeatureFlagResult {
  enabled: boolean;
  isLoading: boolean;
}

/**
 * 指定キーの Feature Flag を取得する。
 * 取得失敗 / 未定義 / 明示的に false は全て enabled=false 扱い（安全側）。
 * 初回ロード中は isLoading=true を返すので、呼び出し元で early redirect する場合は
 * ローディング表示を入れて「未ロードを false 扱いで誤判定」しないようにすること。
 */
export const useFeatureFlag = (key: FeatureFlagKey): FeatureFlagResult => {
  const { data, isLoading } = useQuery({
    queryKey: ["featureFlags", key],
    queryFn: () => fetchFeatureFlags([key]),
    staleTime: FEATURE_FLAG_STALE_TIME_MS,
  });
  return { enabled: data?.[key] === true, isLoading };
};
