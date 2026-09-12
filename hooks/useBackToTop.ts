import type {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
} from "react-native";
import { useCallback, useRef, useState } from "react";

/**
 * ScrollView 用の「トップに戻る」制御。
 * 一定量（threshold px）スクロールしたらボタン表示フラグを立て、押下で最上部へ戻す。
 */
export const useBackToTop = (threshold = 400) => {
  const scrollRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setShowBackToTop(event.nativeEvent.contentOffset.y > threshold);
    },
    [threshold],
  );

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  return { scrollRef, showBackToTop, handleScroll, scrollToTop };
};
