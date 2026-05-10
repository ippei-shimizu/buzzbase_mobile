import type { BattingStats, PitchingStats } from "../../types/dashboard";
import {
  normalizeBattingStats,
  normalizePitchingStats,
} from "../radarChartUtils";

const buildBattingStats = (
  overrides: Partial<BattingStats["aggregate"]> = {},
  calculatedOverrides: Partial<BattingStats["calculated"]> = {},
): BattingStats => ({
  aggregate: {
    number_of_matches: 10,
    hit: 12,
    two_base_hit: 2,
    three_base_hit: 0,
    home_run: 1,
    total_bases: 18,
    runs_batted_in: 8,
    run: 5,
    stealing_base: 3,
    caught_stealing: 1,
    times_at_bat: 40,
    at_bats: 35,
    base_on_balls: 5,
    hit_by_pitch: 0,
    sacrifice_hit: 0,
    sacrifice_fly: 0,
    strike_out: 6,
    error: 1,
    ...overrides,
  },
  calculated: {
    batting_average: 0.34,
    on_base_percentage: 0.42,
    slugging_percentage: 0.51,
    ops: 0.93,
    iso: 0.17,
    bb_per_k: 0.83,
    isod: 0.08,
    ...calculatedOverrides,
  },
});

describe("normalizeBattingStats", () => {
  it("aggregate / calculated いずれかが null なら空配列を返す", () => {
    expect(
      normalizeBattingStats({ aggregate: null, calculated: null }),
    ).toEqual([]);
  });

  it("試合数が 0 なら空配列を返す", () => {
    const stats = buildBattingStats({ number_of_matches: 0 });
    expect(normalizeBattingStats(stats)).toEqual([]);
  });

  it("全指標が 0 のときは空配列を返す（計算結果ゼロ）", () => {
    const stats = buildBattingStats(
      { number_of_matches: 5, stealing_base: 0 },
      { batting_average: 0, iso: 0, ops: 0, bb_per_k: 0 },
    );
    expect(normalizeBattingStats(stats)).toEqual([]);
  });

  it("通常データでは 5 軸（ミート/パワー/走力/選球眼/総合力）を返す", () => {
    const result = normalizeBattingStats(buildBattingStats());
    expect(result).toHaveLength(5);
    expect(result.map((axis) => axis.label)).toEqual([
      "ミート",
      "パワー",
      "走力",
      "選球眼",
      "総合力",
    ]);
  });

  it("打率は 0.5 を上限として 0〜100 に正規化される", () => {
    const result = normalizeBattingStats(
      buildBattingStats({}, { batting_average: 0.5 }),
    );
    expect(result[0].metric).toBe("打率");
    expect(result[0].value).toBe(100);
  });

  it("打率が基準値を超えても 100 でクランプされる", () => {
    const result = normalizeBattingStats(
      buildBattingStats({}, { batting_average: 0.8 }),
    );
    expect(result[0].value).toBe(100);
  });

  it("rawValue は formatRate で書式化される（先頭0除去）", () => {
    const result = normalizeBattingStats(
      buildBattingStats({}, { batting_average: 0.34 }),
    );
    expect(result[0].rawValue).toBe(".340");
  });
});

const buildPitchingStats = (
  aggregateOverrides: Partial<NonNullable<PitchingStats["aggregate"]>> = {},
  calculatedOverrides: Partial<NonNullable<PitchingStats["calculated"]>> = {},
): PitchingStats => ({
  aggregate: {
    number_of_appearances: 8,
    win: 4,
    loss: 2,
    complete_games: 1,
    shutouts: 0,
    saves: 0,
    hold: 0,
    innings_pitched: 50,
    hits_allowed: 40,
    home_runs_hit: 3,
    strikeouts: 50,
    base_on_balls: 15,
    hit_by_pitch: 2,
    run_allowed: 18,
    earned_run: 15,
    ...aggregateOverrides,
  },
  calculated: {
    era: 2.7,
    win_percentage: 0.667,
    whip: 1.1,
    k_per_nine: 9,
    bb_per_nine: 2.7,
    k_bb: 3.33,
    ...calculatedOverrides,
  },
});

describe("normalizePitchingStats", () => {
  it("calculated が null なら空配列を返す", () => {
    expect(
      normalizePitchingStats({
        aggregate: buildPitchingStats().aggregate,
        calculated: null,
      }),
    ).toEqual([]);
  });

  it("登板 0 なら空配列を返す", () => {
    expect(
      normalizePitchingStats(buildPitchingStats({ number_of_appearances: 0 })),
    ).toEqual([]);
  });

  it("制球力は逆向き正規化（BB/9 が低いほど高評価）", () => {
    const result = normalizePitchingStats(
      buildPitchingStats({}, { bb_per_nine: 0 }),
    );
    const control = result.find((axis) => axis.label === "制球力");
    expect(control?.value).toBe(100);
  });

  it("BB/9 が基準値（6）以上なら 0 にクランプされる", () => {
    const result = normalizePitchingStats(
      buildPitchingStats({}, { bb_per_nine: 9 }),
    );
    const control = result.find((axis) => axis.label === "制球力");
    expect(control?.value).toBe(0);
  });
});
