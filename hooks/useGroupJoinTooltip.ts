import * as Sentry from "@sentry/react-native";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const TOOLTIP_SHOWN_KEY = "group_join_tooltip_shown";

/**
 * グループタブ初回表示時の招待コード参加ツールチップを1回だけ表示するためのフック。
 *
 * @return hasShown - 表示済み判定。読み込み完了まで null（確定前のちらつき防止）
 * @return markShown - 表示済みとして永続化する（in-memory 状態は変えず、次回起動以降の抑止に使う）
 */
export const useGroupJoinTooltip = () => {
  const [hasShown, setHasShown] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    SecureStore.getItemAsync(TOOLTIP_SHOWN_KEY)
      .then((value) => {
        if (isMounted) setHasShown(value === "1");
      })
      .catch((error) => {
        Sentry.captureException(error);
        if (isMounted) setHasShown(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const markShown = useCallback(async () => {
    try {
      await SecureStore.setItemAsync(TOOLTIP_SHOWN_KEY, "1");
    } catch (error) {
      Sentry.captureException(error);
    }
  }, []);

  return { hasShown, markShown };
};
