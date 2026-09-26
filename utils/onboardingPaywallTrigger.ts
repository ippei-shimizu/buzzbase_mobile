import type { ProTrigger } from "@utils/analytics";

/**
 * 登録直後 Paywall の訴求を、プロフィールで選んだポジションに合わせて出し分けるための
 * 擬似トリガー。`PaywallSlides` の `orderSlides` がこのキーに対応するスライドを先頭へ置く。
 *
 * 投手は球種別、それ以外は方向別を先頭にする。どちらも記録した打席・投球の延長線上にあり、
 * プロフィール直後の文脈から離れない項目を選んでいる。
 */
const PITCHER_POSITION_NAME = "ピッチャー";

const PITCHER_TRIGGER: ProTrigger = "pitch_type_average";
const BATTER_TRIGGER: ProTrigger = "hit_direction_average";

/**
 * ポジション名から登録直後 Paywall の訴求トリガーを決める。
 *
 * @param positionNames プロフィールで選択したポジション名。未選択なら空配列
 * @return 先頭に置くスライドに対応する擬似トリガー
 */
export const onboardingPaywallTrigger = (
  positionNames: readonly string[],
): ProTrigger =>
  positionNames.includes(PITCHER_POSITION_NAME)
    ? PITCHER_TRIGGER
    : BATTER_TRIGGER;
