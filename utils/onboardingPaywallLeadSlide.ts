import type { PaywallSlideKey } from "@components/pro/paywall/PaywallSlides";

/**
 * 登録直後 Paywall で先頭に置くスライドを、プロフィールで選んだポジションから決める。
 *
 * 投手は球種別、それ以外は方向別。どちらも記録した打席・投球の延長線上にあり、
 * プロフィール入力直後の文脈から離れない項目を選んでいる。
 *
 * `trigger` ではなくスライドのキーを返すのは、`trigger` が「どの機能をタップして
 * Paywall に来たか」を表す次元で、機能起点でないこの配置で使うと既存の集計が濁るため。
 */
// ポジションマスタの表示名に依存する。名前が変われば打者向けにフォールバックするだけで
// ユーザーに見える不具合にはならないが、静かに退行するため onboardingLeadSlide のテストで固定する。
const PITCHER_POSITION_NAME = "ピッチャー";

const PITCHER_LEAD_SLIDE: PaywallSlideKey = "pitch_type";
const BATTER_LEAD_SLIDE: PaywallSlideKey = "hit_direction";

/**
 * @param positionNames プロフィールで選択したポジション名。未選択なら空配列
 * @return 先頭に固定するスライドのキー
 */
export const onboardingLeadSlide = (
  positionNames: readonly string[],
): PaywallSlideKey =>
  positionNames.includes(PITCHER_POSITION_NAME)
    ? PITCHER_LEAD_SLIDE
    : BATTER_LEAD_SLIDE;
