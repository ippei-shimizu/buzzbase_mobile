import type { PlateAppearanceV2 } from "../types/plateAppearance";
import { RUNNERS_STATE_OPTIONS } from "@constants/runnersState";
import { THROW_HAND_SHORT_LABELS } from "@constants/throwHand";

const RUNNERS_STATE_LABELS: Record<string, string> = Object.fromEntries(
  RUNNERS_STATE_OPTIONS.map((option) => [option.key, option.label]),
);

const formatCount = (
  balls: number | null,
  strikes: number | null,
  outs: number | null,
): string | null => {
  if (balls === null && strikes === null && outs === null) return null;
  const b = balls ?? "-";
  const s = strikes ?? "-";
  const o = outs ?? "-";
  return `B${b}-S${s}-O${o}`;
};

/**
 * 打席状況系のチップ（イニング / 最終カウント / ランナー状況 / 初球打ち）を
 * 入力済みの項目だけ文字列で返す。打席カードとサマリー画面で共通利用。
 */
export const buildSituationChips = (pa: PlateAppearanceV2): string[] => {
  const chips: string[] = [];
  if (pa.inning !== null) chips.push(`${pa.inning} 回`);
  const count = formatCount(pa.final_balls, pa.final_strikes, pa.final_outs);
  if (count) chips.push(count);
  if (pa.runners_state) {
    const label = RUNNERS_STATE_LABELS[pa.runners_state];
    if (label) chips.push(label);
  }
  if (pa.first_pitch_swing === true) chips.push("初球○");
  return chips;
};

/**
 * 打球・投手系のチップ（球質 / タイミング / 球種 / 投手名(利き手) / 登板状況）を
 * 入力済みの項目だけ文字列で返す。
 */
export const buildPitchAndPitcherChips = (pa: PlateAppearanceV2): string[] => {
  const chips: string[] = [];
  if (pa.contact_quality?.name) chips.push(pa.contact_quality.name);
  if (pa.timing?.name) chips.push(pa.timing.name);
  if (pa.pitch_type?.name) chips.push(pa.pitch_type.name);
  if (pa.pitcher) {
    const hand = pa.pitcher.throw_hand
      ? `(${THROW_HAND_SHORT_LABELS[pa.pitcher.throw_hand] ?? pa.pitcher.throw_hand})`
      : "";
    chips.push(`${pa.pitcher.name}${hand}`);
  }
  if (pa.appearance_situation?.name) chips.push(pa.appearance_situation.name);
  return chips;
};
