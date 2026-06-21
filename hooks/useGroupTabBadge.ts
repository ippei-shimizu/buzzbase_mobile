import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const BADGE_SEEN_KEY = "group_tab_badge_seen";

/**
 * グループタブの未参加バッジ（赤ポチ）の閲覧状態を端末ローカルで管理する。
 * グループタブを一度開いたらバッジを恒久的に消す。
 *
 * @return seen - 閲覧済み判定。読み込み完了まで null（確定前のちらつき防止）
 * @return markSeen - 閲覧済みにして永続化する
 */
export const useGroupTabBadge = () => {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    SecureStore.getItemAsync(BADGE_SEEN_KEY)
      .then((value) => {
        if (isMounted) setSeen(value === "1");
      })
      .catch((error) => {
        Sentry.captureException(error);
        if (isMounted) setSeen(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const markSeen = useCallback(async () => {
    // 既に閲覧済みなら不要な書き込みをしない
    if (seen) return;
    setSeen(true);
    try {
      await SecureStore.setItemAsync(BADGE_SEEN_KEY, "1");
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [seen]);

  return { seen, markSeen };
};
