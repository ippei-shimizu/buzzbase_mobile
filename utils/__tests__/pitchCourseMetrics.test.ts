import type { PitchCourseZone } from "../../types/stats";
import {
  computePitchCourseMetric,
  foldPitchCourseZones,
  strikeoutBreakdown,
  sumPitchCourseCounts,
  type PitchCourseMetric,
} from "../pitchCourseMetrics";

const buildZone = (
  course: number,
  overrides: Partial<PitchCourseZone> = {},
): PitchCourseZone => ({
  course,
  row: Math.floor((course - 1) / 5) + 1,
  col: ((course - 1) % 5) + 1,
  is_strike_zone: [7, 8, 9, 12, 13, 14, 17, 18, 19].includes(course),
  plate_appearances: 0,
  at_bats: 0,
  hits: 0,
  total_bases: 0,
  strikeouts: 0,
  swinging_strikeouts: 0,
  looking_strikeouts: 0,
  batting_average: 0,
  is_reliable: false,
  ...overrides,
});

const buildZones = (overrides: Record<number, Partial<PitchCourseZone>>) =>
  Array.from({ length: 25 }, (_, index) =>
    buildZone(index + 1, overrides[index + 1] ?? {}),
  );

const context = {
  minAtBats: 3,
  totalPlateAppearances: 20,
  courseCount: 1,
};

describe("foldPitchCourseZones", () => {
  const zones = buildZones({
    1: { plate_appearances: 1, at_bats: 1, hits: 1, total_bases: 4 },
    7: { plate_appearances: 2, at_bats: 2, hits: 0 },
    13: { plate_appearances: 3, at_bats: 2, hits: 1, total_bases: 2 },
    25: { plate_appearances: 4, at_bats: 4, hits: 2, total_bases: 2 },
  });

  it("5x5 はコース順の 25 セルをそのまま返す", () => {
    const cells = foldPitchCourseZones([...zones].reverse(), "grid5");
    expect(cells).toHaveLength(25);
    expect(cells[0].key).toBe("1");
    expect(cells[12]).toMatchObject({ key: "13", plate_appearances: 3 });
  });

  it("3x3 は外周と内側の1列を合わせた帯で合算する", () => {
    const cells = foldPitchCourseZones(zones, "grid3");
    expect(cells).toHaveLength(9);
    expect(cells[0]).toMatchObject({
      key: "1-1",
      plate_appearances: 3,
      at_bats: 3,
      hits: 1,
      total_bases: 4,
    });
    expect(cells[4]).toMatchObject({ key: "2-2", plate_appearances: 3 });
    expect(cells[8]).toMatchObject({ key: "3-3", plate_appearances: 4 });
  });

  it("3x3 はストライクゾーンのコースを含むセルをストライクゾーン扱いにする", () => {
    const cells = foldPitchCourseZones(zones, "grid3");
    expect(cells.every((cell) => cell.isStrikeZone)).toBe(true);
  });

  it("高低・内外は真ん中の帯を除き、1打席を高低と内外の両方に数える", () => {
    const cells = foldPitchCourseZones(zones, "split4");
    expect(cells.map((cell) => [cell.label, cell.plate_appearances])).toEqual([
      ["高め", 3],
      ["低め", 4],
      ["三塁側", 3],
      ["一塁側", 4],
    ]);
  });

  it("ゾーン内外は中央3x3と外周16に分ける", () => {
    const cells = foldPitchCourseZones(zones, "zone");
    expect(cells.map((cell) => [cell.label, cell.plate_appearances])).toEqual([
      ["ストライクゾーン", 5],
      ["ボールゾーン", 5],
    ]);
  });
});

describe("computePitchCourseMetric", () => {
  const counts = sumPitchCourseCounts([
    buildZone(13, {
      plate_appearances: 8,
      at_bats: 6,
      hits: 2,
      total_bases: 5,
      strikeouts: 2,
    }),
  ]);

  it("打率は安打 / 打数を .XXX で表し、打数を併記する", () => {
    expect(
      computePitchCourseMetric("batting_average", counts, context),
    ).toMatchObject({ valueText: ".333", subText: "6打数", isReliable: true });
  });

  it("長打率は塁打 / 打数で、1 以上はそのまま表示する", () => {
    expect(
      computePitchCourseMetric("slugging", counts, context).valueText,
    ).toBe(".833");
    expect(
      computePitchCourseMetric(
        "slugging",
        { ...counts, at_bats: 2, total_bases: 5 },
        context,
      ),
    ).toMatchObject({ valueText: "2.500", isReliable: false });
  });

  it("三振率は三振 / 打席の % 表示で、5打席未満は参考値", () => {
    expect(
      computePitchCourseMetric("strikeout_rate", counts, context),
    ).toMatchObject({ valueText: "25%", subText: "8打席", isReliable: true });
    expect(
      computePitchCourseMetric(
        "strikeout_rate",
        { ...counts, plate_appearances: 4 },
        context,
      ).isReliable,
    ).toBe(false);
  });

  it("三振率は低いほど暖色になる", () => {
    const colorAt = (strikeouts: number) =>
      computePitchCourseMetric(
        "strikeout_rate",
        { ...counts, plate_appearances: 10, strikeouts },
        context,
      ).color;
    expect(colorAt(1)).toBe("#d64545");
    expect(colorAt(5)).toBe("#4173b3");
  });

  it("打席分布は打席数と全体に占める割合を出し、参考値扱いにしない", () => {
    expect(
      computePitchCourseMetric(
        "plate_appearances",
        { ...counts, plate_appearances: 1 },
        context,
      ),
    ).toMatchObject({ valueText: "1", subText: "5%", isReliable: true });
  });

  it("打席分布の濃淡は含むコース数を基準にした均等配分比で決まる", () => {
    const colorAt = (plateAppearances: number, courseCount: number) =>
      computePitchCourseMetric(
        "plate_appearances",
        { ...counts, plate_appearances: plateAppearances },
        { ...context, totalPlateAppearances: 100, courseCount },
      ).color;
    expect(colorAt(8, 1)).toBe("#d08000");
    expect(colorAt(36, 9)).toBe(colorAt(4, 1));
  });

  it("25 コースに均等に散らばった打席は、どの粒度でも全セルが同じ濃さになる", () => {
    const uniformZones = buildZones(
      Object.fromEntries(
        Array.from({ length: 25 }, (_, index) => [
          index + 1,
          { plate_appearances: 4 },
        ]),
      ),
    );
    const granularities = ["grid5", "grid3", "split4", "zone"] as const;
    granularities.forEach((granularity) => {
      const colors = foldPitchCourseZones(uniformZones, granularity).map(
        (cell) =>
          computePitchCourseMetric("plate_appearances", cell, {
            minAtBats: 3,
            totalPlateAppearances: 100,
            courseCount: cell.courseCount,
          }).color,
      );
      expect(new Set(colors)).toEqual(new Set(["#8f5a0a"]));
    });
  });

  it("分母 0 は '-' で色を付けない", () => {
    const empty = sumPitchCourseCounts([]);
    expect(
      computePitchCourseMetric("batting_average", empty, context),
    ).toMatchObject({ valueText: "-", subText: null, color: null });
    expect(
      computePitchCourseMetric("strikeout_rate", empty, context).valueText,
    ).toBe("-");
    expect(
      computePitchCourseMetric("plate_appearances", empty, context).valueText,
    ).toBe("-");
  });
});

describe("strikeoutBreakdown", () => {
  it("空振り・見逃し以外の三振を未入力として数える", () => {
    expect(
      strikeoutBreakdown([
        buildZone(1, {
          strikeouts: 3,
          swinging_strikeouts: 1,
          looking_strikeouts: 1,
        }),
        buildZone(2, { strikeouts: 2, swinging_strikeouts: 2 }),
      ]),
    ).toEqual({ strikeouts: 5, swinging: 3, looking: 1, unspecified: 1 });
  });
});

describe("塁打・三振を返さない旧バックエンドのレスポンス", () => {
  const legacyZones = [
    { plate_appearances: 6, at_bats: 5, hits: 2 },
    { plate_appearances: 2, at_bats: 2, hits: 0 },
  ];

  it("欠けたカウントを 0 として合算する", () => {
    expect(sumPitchCourseCounts(legacyZones)).toMatchObject({
      plate_appearances: 8,
      total_bases: 0,
      strikeouts: 0,
    });
  });

  it("どの指標でも NaN を表示しない", () => {
    const metrics: PitchCourseMetric[] = [
      "plate_appearances",
      "batting_average",
      "slugging",
      "strikeout_rate",
    ];
    metrics.forEach((metric) => {
      const value = computePitchCourseMetric(metric, legacyZones[0], context);
      expect(`${value.valueText} ${value.subText} ${value.color}`).not.toMatch(
        /NaN|undefined/,
      );
    });
    expect(
      computePitchCourseMetric("strikeout_rate", legacyZones[0], context)
        .valueText,
    ).toBe("0%");
  });

  it("三振の内訳は 0 件になる", () => {
    expect(strikeoutBreakdown(legacyZones)).toEqual({
      strikeouts: 0,
      swinging: 0,
      looking: 0,
      unspecified: 0,
    });
  });
});
