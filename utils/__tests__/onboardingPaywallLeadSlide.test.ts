import { onboardingLeadSlide } from "@utils/onboardingPaywallLeadSlide";

/**
 * ポジションマスタの表示名に依存しているため、名前が変わったときに静かに退行しないよう固定する。
 * 壊れても打者向けにフォールバックするだけでユーザーには見えないため、テストが唯一の検知手段になる。
 */
describe("onboardingLeadSlide", () => {
  it("ピッチャーを含むときは球種別を先頭にする", () => {
    expect(onboardingLeadSlide(["ピッチャー"])).toBe("pitch_type");
  });

  it("他のポジションと併せて選んでいても球種別を先頭にする", () => {
    expect(onboardingLeadSlide(["ファースト", "ピッチャー"])).toBe(
      "pitch_type",
    );
  });

  it("野手だけのときは方向別を先頭にする", () => {
    expect(onboardingLeadSlide(["キャッチャー", "ショート"])).toBe(
      "hit_direction",
    );
  });

  it("未選択のときは方向別を先頭にする", () => {
    expect(onboardingLeadSlide([])).toBe("hit_direction");
  });
});
