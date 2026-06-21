import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";

/**
 * アプリ初回起動時オンボーディングの完了状態を端末ローカル（SecureStore）で管理する。
 *
 * @return isCompleted - 完了判定。読み込み完了まで null（確定前のちらつき防止）
 * @return complete - 完了状態を永続化する
 */
export const useOnboarding = () => {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY).then((value) => {
      if (isMounted) setIsCompleted(value === "1");
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const complete = useCallback(async () => {
    setIsCompleted(true);
    await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, "1");
  }, []);

  return { isCompleted, complete };
};
