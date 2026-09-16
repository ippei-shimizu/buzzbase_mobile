import type { HeadlineStats } from "../../../types/stats";
import { render } from "@testing-library/react-native";
import { HeadlineStatsCard } from "../HeadlineStatsCard";

const buildHeadlineStats = (
  overrides: Partial<HeadlineStats> = {},
): HeadlineStats => ({
  batting_average: 0.333,
  hit: 10,
  home_run: 3,
  inside_the_park_home_run: 0,
  runs_batted_in: 8,
  on_base_percentage: 0.4,
  slugging_percentage: 0.6,
  ops: 1.0,
  at_bats: 30,
  ...overrides,
});

describe("HeadlineStatsCard", () => {
  it("走本塁打があるときは本塁打の内数として表示する", () => {
    const { getByText } = render(
      <HeadlineStatsCard
        data={buildHeadlineStats({
          home_run: 3,
          inside_the_park_home_run: 1,
        })}
      />,
    );

    expect(getByText("本塁打")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("うち走本 1")).toBeTruthy();
  });

  it("走本塁打が 0 のときは内数を表示しない", () => {
    const { getByText, queryByText } = render(
      <HeadlineStatsCard
        data={buildHeadlineStats({
          home_run: 3,
          inside_the_park_home_run: 0,
        })}
      />,
    );

    expect(getByText("本塁打")).toBeTruthy();
    expect(queryByText(/うち走本/)).toBeNull();
  });
});
