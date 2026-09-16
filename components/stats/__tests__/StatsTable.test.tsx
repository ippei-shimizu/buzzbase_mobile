import type { BattingStatsRow } from "../../../types/stats";
import { render } from "@testing-library/react-native";
import { StatsTable, getBattingColumns } from "../StatsTable";

const buildRow = (
  overrides: Partial<BattingStatsRow> = {},
): BattingStatsRow => ({
  label: "2026",
  games: 10,
  plate_appearances: 40,
  at_bats: 36,
  hit: 12,
  two_base_hit: 2,
  three_base_hit: 0,
  home_run: 3,
  inside_the_park_home_run: 0,
  total_bases: 20,
  runs_batted_in: 8,
  run: 6,
  strike_out: 7,
  base_on_balls: 3,
  hit_by_pitch: 1,
  sacrifice_hit: 0,
  sacrifice_fly: 0,
  stealing_base: 1,
  caught_stealing: 0,
  error: 1,
  batting_average: 0.333,
  slugging_percentage: 0.5,
  ops: 0.9,
  iso: 0.167,
  bb_per_k: 0.43,
  babip: 0.35,
  ...overrides,
});

// ヘッダーは 1 文字ずつ改行した縦書きで描画され、RNTL は空白を 1 つに正規化して照合する。
const VERTICAL_HOME_RUN_LABEL = /^本\s塁\s打$/;
const VERTICAL_INSIDE_THE_PARK_LABEL = /^走\s本$/;

describe("打撃成績テーブルの走本塁打列", () => {
  it("走本塁打が 1 本以上ある行があれば本塁打の右隣に走本列を出す", () => {
    const rows = [
      buildRow({ label: "2025", home_run: 2, inside_the_park_home_run: 1 }),
      buildRow({ label: "2026", home_run: 1, inside_the_park_home_run: 0 }),
      buildRow({ label: "通算", home_run: 3, inside_the_park_home_run: 1 }),
    ];

    const columns = getBattingColumns(rows);
    const keys = columns.map((column) => column.key);
    expect(keys.indexOf("inside_the_park_home_run")).toBe(
      keys.indexOf("home_run") + 1,
    );

    const { getByText } = render(
      <StatsTable rows={rows} columns={columns} labelKey="label" />,
    );
    expect(getByText(VERTICAL_HOME_RUN_LABEL)).toBeTruthy();
    expect(getByText(VERTICAL_INSIDE_THE_PARK_LABEL)).toBeTruthy();
  });

  it("全行で走本塁打が 0 なら走本列を出さない", () => {
    const rows = [
      buildRow({ label: "2026", home_run: 3, inside_the_park_home_run: 0 }),
      buildRow({ label: "通算", home_run: 3, inside_the_park_home_run: 0 }),
    ];

    const columns = getBattingColumns(rows);
    expect(columns.map((column) => column.key)).not.toContain(
      "inside_the_park_home_run",
    );

    const { queryByText } = render(
      <StatsTable rows={rows} columns={columns} labelKey="label" />,
    );
    expect(queryByText(VERTICAL_INSIDE_THE_PARK_LABEL)).toBeNull();
  });

  it("古いバックエンドで内数が返らないときも走本列を出さない", () => {
    const rows = [buildRow({ inside_the_park_home_run: undefined })];

    expect(getBattingColumns(rows).map((column) => column.key)).not.toContain(
      "inside_the_park_home_run",
    );
  });
});
