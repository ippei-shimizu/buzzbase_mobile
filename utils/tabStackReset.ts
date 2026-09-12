/** タブ配下のネスト Stack の状態（React Navigation の NavigationState の必要部分）。 */
export interface NestedStackState {
  index?: number;
  routes?: { name: string }[];
}

/**
 * タブを再タップしたときに、そのタブのスタックを先頭(index)へ戻すべきか判定する。
 *
 * 「積まれた枚数」ではなく「今表示している画面が index かどうか」で見る。
 * 設定画面や Paywall の規約リンクのようにルートStackから直接 push された画面は、
 * そのタブのスタックに index を挟まず1枚目として載るため、枚数で判定すると
 * リセットされず、タブを押しても何も起きない行き止まりになる。
 *
 * @param nested タブ route が持つネスト Stack の状態（未生成なら undefined）
 * @returns index へ戻す必要があれば true
 */
export const shouldResetTabStack = (nested?: NestedStackState): boolean => {
  const routes = nested?.routes;
  if (!routes?.length) return false;
  const currentIndex = nested?.index ?? routes.length - 1;
  return routes[currentIndex]?.name !== "index";
};
