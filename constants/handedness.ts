import type { ThrowHand } from "../types/pitcher";

// back の User#batting_side enum（right=0 / left=1 / both=2）と一致させる。
// 「打席」は利き手（batting_hand）と紛らわしいため batting_side と呼ぶ。
export type BattingSide = "right" | "left" | "both";

export const THROW_HANDS: readonly ThrowHand[] = ["right", "left"];

export const BATTING_SIDES: readonly BattingSide[] = ["right", "left", "both"];

export const BATTING_SIDE_LABELS: Record<BattingSide, string> = {
  right: "右打ち",
  left: "左打ち",
  both: "両打ち",
};
