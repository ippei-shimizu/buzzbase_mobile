import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

/**
 * グローバルハンバーガーメニューの開閉状態とフェードアニメーションを集約するフック。
 *
 * @returns
 *   - `menuVisible`: メニューが表示されているか（描画判定に使う）
 *   - `menuOpacity`: フェード用 `Animated.Value`（0〜1）。`Animated.View` の opacity に渡す
 *   - `openMenu`: メニューを開く（150ms フェードイン）
 *   - `closeMenu`: メニューを閉じる（120ms フェードアウト後にアンマウント）
 *
 * アンマウント時に進行中のアニメーションを停止し、メモリリークを防ぐ。
 */
export const useGlobalMenu = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuOpacity = useRef(new Animated.Value(0)).current;

  const openMenu = useCallback(() => {
    setMenuVisible(true);
    Animated.timing(menuOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [menuOpacity]);

  const closeMenu = useCallback(() => {
    Animated.timing(menuOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  }, [menuOpacity]);

  useEffect(() => {
    return () => {
      menuOpacity.stopAnimation();
    };
  }, [menuOpacity]);

  return { menuVisible, menuOpacity, openMenu, closeMenu };
};
