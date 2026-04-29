import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useStoreReview } from "@hooks/useStoreReview";

export const useReviewPromptModal = () => {
  const router = useRouter();
  const { incrementPositiveEvent, checkAndShowPrePrompt, requestNativeReview } =
    useStoreReview();
  const [visible, setVisible] = useState(false);

  const triggerPositiveEvent = useCallback(async () => {
    try {
      await incrementPositiveEvent();
      const shouldShow = await checkAndShowPrePrompt();
      if (shouldShow) setVisible(true);
    } catch {
      // 失敗時は静かに無視する（Pre-promptは将来のイベントで再判定される）
    }
  }, [incrementPositiveEvent, checkAndShowPrePrompt]);

  const handleYes = useCallback(async () => {
    setVisible(false);
    await requestNativeReview().catch(() => {});
  }, [requestNativeReview]);

  const handleNo = useCallback(() => {
    setVisible(false);
    router.push({
      pathname: "/(tabs)/(profile)/contact",
      params: { subject: "feedback" },
    });
  }, [router]);

  return {
    triggerPositiveEvent,
    modalProps: { visible, onYes: handleYes, onNo: handleNo },
  };
};
