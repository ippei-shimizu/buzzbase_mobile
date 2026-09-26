import type { PitchingSummary } from "../../../types/stats";
import { render } from "@testing-library/react-native";
import { PitchingHeadlineStatsCard } from "../PitchingHeadlineStatsCard";

const buildPitchingSummary = (
  overrides: Partial<PitchingSummary> = {},
): PitchingSummary => ({
  appearances: 3,
  win: 2,
  loss: 1,
  hold: 0,
  saves: 0,
  complete_games: 0,
  shutouts: 0,
  innings_pitched: 18,
  hits_allowed: 12,
  home_runs_hit: 1,
  strikeouts: 20,
  base_on_balls: 4,
  hit_by_pitch: 0,
  run_allowed: 5,
  earned_run: 4,
  number_of_pitches: 280,
  era: 2,
  whip: 0.889,
  k_per_nine: 10,
  bb_per_nine: 2,
  k_bb: 5,
  win_percentage: 0.667,
  ...overrides,
});

describe("PitchingHeadlineStatsCard", () => {
  it("四球があるときは K/BB を小数 2 桁で表示する", () => {
    const { getByLabelText } = render(
      <PitchingHeadlineStatsCard data={buildPitchingSummary()} />,
    );

    expect(getByLabelText("K/BB 5.00")).toBeTruthy();
  });

  it("四球が 0 のときは K/BB を 0.00 ではなく - で表示する", () => {
    const { getByLabelText } = render(
      <PitchingHeadlineStatsCard
        data={buildPitchingSummary({ base_on_balls: 0, k_bb: 0 })}
      />,
    );

    expect(getByLabelText("K/BB -")).toBeTruthy();
  });
});
