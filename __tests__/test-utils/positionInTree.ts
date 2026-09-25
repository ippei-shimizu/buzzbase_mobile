import { screen } from "@testing-library/react-native";

// react-test-renderer の型定義が入っていないため、ツリーを辿るのに必要な形だけ定義する。
interface TestElement {
  children: (TestElement | string)[];
}

const flattenTree = (node: TestElement): TestElement[] => [
  node,
  ...node.children
    .filter((child): child is TestElement => typeof child !== "string")
    .flatMap(flattenTree),
];

/**
 * 描画ツリーを深さ優先で辿ったときの出現順を返す。要素同士の前後関係（配置順）の
 * 検証に使う。RNTL のクエリは2つの要素の前後を比較できないため、要素の同一性を
 * 保ったまま訪問順で代用する。
 *
 * @param element getByText / getByLabelText 等で取得した要素
 * @returns ツリー中の訪問順（0 始まり）
 */
export const positionInTree = (element: TestElement): number => {
  const position = flattenTree(screen.UNSAFE_root).indexOf(element);
  if (position === -1) {
    throw new Error("positionInTree: 要素が描画ツリーに存在しません");
  }
  return position;
};
