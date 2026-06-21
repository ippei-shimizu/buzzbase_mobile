import * as Sentry from "@sentry/react-native";
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
    SecureStore.getItemAsync(ONBOARDING_COMPLETED_KEY)
      .then((value) => {
        if (isMounted) setIsCompleted(value === "1");
      })
      .catch((error) => {
        // 読み込み失敗時はスピナーで固まらないよう未完了扱いにする（fail-open）
        Sentry.captureException(error);
        if (isMounted) setIsCompleted(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const complete = useCallback(async () => {
    // 書き込み失敗でもオンボーディングは進める（次回再表示は許容）。呼び出し側で
    // unhandled rejection にならないよう、このメソッドは reject しない。
    try {
      await SecureStore.setItemAsync(ONBOARDING_COMPLETED_KEY, "1");
    } catch (error) {
      Sentry.captureException(error);
    } finally {
      setIsCompleted(true);
    }
  }, []);

  return { isCompleted, complete };
};
