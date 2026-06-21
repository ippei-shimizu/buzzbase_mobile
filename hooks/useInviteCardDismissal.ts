import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "dashboard_invite_card_dismissed";

/**
 * ダッシュボードのグループ招待ウェルカムカードを、ユーザー自身で恒久的に
 * 非表示にできるようにする dismiss 状態を端末ローカル（SecureStore）で管理する。
 *
 * @return isDismissed - 非表示判定。読み込み完了まで null（確定前のちらつき防止）
 * @return dismiss - 非表示にして状態を永続化する
 */
export const useInviteCardDismissal = () => {
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    SecureStore.getItemAsync(DISMISS_KEY).then((value) => {
      if (isMounted) setIsDismissed(value === "1");
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const dismiss = useCallback(async () => {
    setIsDismissed(true);
    await SecureStore.setItemAsync(DISMISS_KEY, "1");
  }, []);

  return { isDismissed, dismiss };
};
