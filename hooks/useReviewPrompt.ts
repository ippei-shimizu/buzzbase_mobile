import { useCallback } from "react";
import { useStoreReview } from "@hooks/useStoreReview";
import {
  trackStoreReviewRequested,
  type StoreReviewTrigger,
} from "@utils/analytics";

// JSモジュールスコープに保持することで、コンポーネントの再マウント
// （Expo Routerのタブ切り替え等）を跨いで「同セッション1回まで」を担保する。
// アプリのコールドスタートでJSコンテキストがリセットされ、自然と空になる。
const sessionTriggeredKeys = new Set<string>();

interface TriggerPositiveEventOptions {
  trigger: StoreReviewTrigger;
  /** 指定すると、同じキーでの発火をアプリのセッション中1回に抑える。 */
  sessionKey?: string;
}

/**
 * ポジティブイベントを記録し、条件を満たせば OS のストアレビューダイアログを要求する。
 * 独自の事前質問（「気に入っていますか？」等）は両ストアの規約で禁止されているため挟まない。
 */
export const useReviewPrompt = () => {
  const { incrementPositiveEvent, requestReviewIfEligible } = useStoreReview();

  /** @return OS のレビューダイアログを要求したら true */
  const triggerPositiveEvent = useCallback(
    async ({
      trigger,
      sessionKey,
    }: TriggerPositiveEventOptions): Promise<boolean> => {
      if (sessionKey && sessionTriggeredKeys.has(sessionKey)) return false;
      if (sessionKey) sessionTriggeredKeys.add(sessionKey);
      try {
        await incrementPositiveEvent();
        const requested = await requestReviewIfEligible();
        if (requested) trackStoreReviewRequested({ trigger });
        return requested;
      } catch {
        // 失敗時は静かに無視する（未消化のマイルストーンは次のイベントで再判定される）
        return false;
      }
    },
    [incrementPositiveEvent, requestReviewIfEligible],
  );

  return { triggerPositiveEvent };
};
