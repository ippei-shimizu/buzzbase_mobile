import {
  DEFAULT_RESULT_COLOR,
  getBattingResultColor,
  HIT_RESULT_COLOR,
  SACRIFICE_RESULT_COLOR,
} from "../battingResultColor";

describe("getBattingResultColor", () => {
  it.each(["中安", "左二", "右三", "中本"])(
    "安打系の %s は安打色になる",
    (result) => {
      expect(getBattingResultColor(result)).toBe(HIT_RESULT_COLOR);
    },
  );

  it.each(["左走本", "中走本", "右中走本"])(
    "走本塁打の %s も安打色になる",
    (result) => {
      expect(getBattingResultColor(result)).toBe(HIT_RESULT_COLOR);
    },
  );

  it.each(["犠打", "犠飛"])("犠打系の %s は犠打色になる", (result) => {
    expect(getBattingResultColor(result)).toBe(SACRIFICE_RESULT_COLOR);
  });

  it.each(["三ゴロ", "空振り三振", "四球"])(
    "凡退・出塁系の %s は既定色になる",
    (result) => {
      expect(getBattingResultColor(result)).toBe(DEFAULT_RESULT_COLOR);
    },
  );
});
