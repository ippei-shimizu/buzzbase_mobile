import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const DISMISSED_KEY = "trial_expiring_banner_dismissed";

/**
 * トライアル予告バナーの「閉じた」状態を端末ローカルで管理する。
 * 保存値は subscription.expires_at にひもづける。再加入して新しいトライアルが
 * 始まると expires_at が変わるため、前回閉じた状態が引き継がれず再び表示される。
 *
 * @param expiresAt - 現在のトライアルの終了日時（subscription.expires_at）
 * @return dismissed - 閉じた判定。読み込み完了まで null（確定前のちらつき防止）
 * @return dismiss - 閉じた状態にして永続化する
 */
export const useTrialBannerDismissed = (expiresAt: string | null) => {
  const [storedExpiresAt, setStoredExpiresAt] = useState<
    string | null | undefined
  >(undefined);

  useEffect(() => {
    let isMounted = true;
    SecureStore.getItemAsync(DISMISSED_KEY)
      .then((value) => {
        if (isMounted) setStoredExpiresAt(value);
      })
      .catch((error) => {
        Sentry.captureException(error);
        // 最終日の課金開始の念押しを優先し、読み込み失敗時は表示側に倒す
        if (isMounted) setStoredExpiresAt(null);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const dismiss = useCallback(async () => {
    if (expiresAt === null) return;
    setStoredExpiresAt(expiresAt);
    try {
      await SecureStore.setItemAsync(DISMISSED_KEY, expiresAt);
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [expiresAt]);

  const dismissed =
    storedExpiresAt === undefined
      ? null
      : expiresAt !== null && storedExpiresAt === expiresAt;

  return { dismissed, dismiss };
};
