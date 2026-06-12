import type { ThrowHand } from "../types/pitcher";

/**
 * 投手の利き手表示ラベル。
 * - `FULL`: 投手選択リストなど、スペースに余裕がある場所で使うフル表記
 * - `SHORT`: 打席カードのチップなど、括弧内で短く表示する場所で使う略記
 *
 * 同じ概念だが用途で文字数が異なるため、それぞれ用の定数として区別する。
 */
export const THROW_HAND_FULL_LABELS: Record<ThrowHand, string> = {
  right: "右投げ",
  left: "左投げ",
};

export const THROW_HAND_SHORT_LABELS: Record<ThrowHand, string> = {
  right: "右",
  left: "左",
};
