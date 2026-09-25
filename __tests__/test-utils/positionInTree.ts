import { screen } from "@testing-library/react-native";

/**
 * 描画ツリー上の出現位置を返す。要素同士の前後関係（配置順）の検証に使う。
 * RNTL のクエリは2つの要素の前後を比較できないため、シリアライズした
 * ツリー文字列での出現位置で代用する。
 *
 * @param text 表示テキストまたは accessibilityLabel
 * @returns ツリー文字列中の最初の出現位置
 */
export const positionInTree = (text: string): number => {
  const position = JSON.stringify(screen.toJSON()).indexOf(text);
  if (position === -1) {
    throw new Error(`positionInTree: "${text}" が描画されていません`);
  }
  return position;
};
