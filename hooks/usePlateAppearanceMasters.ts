import { useQuery } from "@tanstack/react-query";
import {
  getContactQualities,
  getHitDepths,
  getPitchTypes,
  getTimings,
} from "@services/plateAppearanceMasterService";

/** 打席詳細マスタ（球質・球種・タイミング・深さ）はほぼ変化しないため、24 時間キャッシュする。 */
const PLATE_APPEARANCE_MASTER_STALE_TIME = 24 * 60 * 60 * 1000;

/**
 * 打球の質マスタを取得する。
 * Step3 の `MasterChipSelector` の options 源として使う。
 */
export const useContactQualities = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["contactQualities"],
    queryFn: getContactQualities,
    staleTime: PLATE_APPEARANCE_MASTER_STALE_TIME,
  });

  return {
    contactQualities: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

/**
 * 球種マスタを取得する。
 */
export const usePitchTypes = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["pitchTypes"],
    queryFn: getPitchTypes,
    staleTime: PLATE_APPEARANCE_MASTER_STALE_TIME,
  });

  return {
    pitchTypes: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

/**
 * タイミングマスタを取得する。
 */
export const useTimings = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["timings"],
    queryFn: getTimings,
    staleTime: PLATE_APPEARANCE_MASTER_STALE_TIME,
  });

  return {
    timings: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};

/**
 * 打球の深さマスタを取得する。
 */
export const useHitDepths = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ["hitDepths"],
    queryFn: getHitDepths,
    staleTime: PLATE_APPEARANCE_MASTER_STALE_TIME,
  });

  return {
    hitDepths: data ?? [],
    isLoading,
    isError,
    error,
    refetch,
    isRefreshing: isRefetching,
  };
};
