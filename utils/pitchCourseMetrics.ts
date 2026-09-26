import type { PitchCourseZone } from "../types/stats";
import { pitchCourseBand } from "@constants/pitchCourse";
import { formatBattingAverage } from "@utils/formatBattingAverage";

export type PitchCourseMetric =
  | "plate_appearances"
  | "batting_average"
  | "slugging"
  | "strikeout_rate";

export type PitchCourseGranularity = "grid5" | "grid3" | "split4" | "zone";

export const PITCH_COURSE_METRIC_OPTIONS: readonly {
  key: PitchCourseMetric;
  label: string;
}[] = [
  { key: "plate_appearances", label: "打席分布" },
  { key: "batting_average", label: "打率" },
  { key: "slugging", label: "長打率" },
  { key: "strikeout_rate", label: "三振率" },
];

export const PITCH_COURSE_GRANULARITY_OPTIONS: readonly {
  key: PitchCourseGranularity;
  label: string;
}[] = [
  { key: "grid5", label: "5x5" },
  { key: "grid3", label: "3x3" },
  { key: "split4", label: "高低・内外" },
  { key: "zone", label: "ゾーン内外" },
];

/** 三振率を参考値扱いにしない最低打席数。打率・長打率は API の min_at_bats を使う。 */
export const STRIKEOUT_RATE_MIN_PLATE_APPEARANCES = 5;

export interface PitchCourseCounts {
  plate_appearances: number;
  at_bats: number;
  hits: number;
  total_bases: number;
  strikeouts: number;
  swinging_strikeouts: number;
  looking_strikeouts: number;
}

export interface PitchCourseCell extends PitchCourseCounts {
  key: string;
  /** タイル表示（高低・内外 / ゾーン内外）の見出し。グリッド表示では null。 */
  label: string | null;
  isStrikeZone: boolean;
}

export interface PitchCourseMetricValue {
  /** 主指標の表示文字列。分母 0 のときは "-"。 */
  valueText: string;
  /** 主指標の下に併記する補足（分母や打席割合）。分母 0 のときは null。 */
  subText: string | null;
  /** 背景色。分母 0 のときは null（無彩色で描く）。 */
  color: string | null;
  isReliable: boolean;
}

const EMPTY_COUNTS: PitchCourseCounts = {
  plate_appearances: 0,
  at_bats: 0,
  hits: 0,
  total_bases: 0,
  strikeouts: 0,
  swinging_strikeouts: 0,
  looking_strikeouts: 0,
};

/** 生カウントを単純合算する。率は合算後に再計算する前提で、ここでは扱わない。 */
export const sumPitchCourseCounts = (
  zones: readonly PitchCourseCounts[],
): PitchCourseCounts =>
  zones.reduce<PitchCourseCounts>(
    (total, zone) => ({
      plate_appearances: total.plate_appearances + zone.plate_appearances,
      at_bats: total.at_bats + zone.at_bats,
      hits: total.hits + zone.hits,
      total_bases: total.total_bases + zone.total_bases,
      strikeouts: total.strikeouts + zone.strikeouts,
      swinging_strikeouts: total.swinging_strikeouts + zone.swinging_strikeouts,
      looking_strikeouts: total.looking_strikeouts + zone.looking_strikeouts,
    }),
    EMPTY_COUNTS,
  );

const buildCell = (
  key: string,
  label: string | null,
  isStrikeZone: boolean,
  zones: readonly PitchCourseZone[],
): PitchCourseCell => ({
  key,
  label,
  isStrikeZone,
  ...sumPitchCourseCounts(zones),
});

const BAND_INDEXES = [1, 2, 3] as const;

/**
 * 25 コースの zones を粒度に合わせて畳む。
 * - grid5: コース順の 25 セル / grid3: 行優先の 9 セル
 * - split4: 高め・低め・三塁側・一塁側（真ん中の帯は含めず、1打席が高低と内外の両方に入る）
 * - zone: ストライクゾーン・ボールゾーン
 */
export const foldPitchCourseZones = (
  zones: readonly PitchCourseZone[],
  granularity: PitchCourseGranularity,
): PitchCourseCell[] => {
  switch (granularity) {
    case "grid5":
      return [...zones]
        .sort((left, right) => left.course - right.course)
        .map((zone) =>
          buildCell(String(zone.course), null, zone.is_strike_zone, [zone]),
        );
    case "grid3":
      return BAND_INDEXES.flatMap((rowBand) =>
        BAND_INDEXES.map((colBand) =>
          buildCell(
            `${rowBand}-${colBand}`,
            null,
            rowBand === 2 && colBand === 2,
            zones.filter(
              (zone) =>
                pitchCourseBand(zone.row) === rowBand &&
                pitchCourseBand(zone.col) === colBand,
            ),
          ),
        ),
      );
    case "split4":
      return [
        buildCell(
          "high",
          "高め",
          false,
          zones.filter((zone) => pitchCourseBand(zone.row) === 1),
        ),
        buildCell(
          "low",
          "低め",
          false,
          zones.filter((zone) => pitchCourseBand(zone.row) === 3),
        ),
        buildCell(
          "third_base",
          "三塁側",
          false,
          zones.filter((zone) => pitchCourseBand(zone.col) === 1),
        ),
        buildCell(
          "first_base",
          "一塁側",
          false,
          zones.filter((zone) => pitchCourseBand(zone.col) === 3),
        ),
      ];
    case "zone":
      return [
        buildCell(
          "strike",
          "ストライクゾーン",
          true,
          zones.filter((zone) => zone.is_strike_zone),
        ),
        buildCell(
          "ball",
          "ボールゾーン",
          false,
          zones.filter((zone) => !zone.is_strike_zone),
        ),
      ];
  }
};

/**
 * 打席分布の「均等配分なら 1 セルに入る割合」。高低・内外は各軸が
 * 高め/真ん中/低めの3帯なので、表示は2タイルでも 1/3 を基準にする。
 */
export const expectedShareFor = (
  granularity: PitchCourseGranularity,
): number => {
  switch (granularity) {
    case "grid5":
      return 1 / 25;
    case "grid3":
      return 1 / 9;
    case "split4":
      return 1 / 3;
    case "zone":
      return 1 / 2;
  }
};

// 固定閾値にするのは、フィルタを変えても同じ値のセルが同じ色になって比較できるようにするため。
const WARM_TO_COLD = ["#d64545", "#d98236", "#c9a227", "#4f9e6b", "#4173b3"];
const PRIMARY_SHADES = ["#d08000", "#b06d05", "#8f5a0a", "#6e470f", "#4d3414"];

const colorByDescendingThresholds = (
  value: number,
  thresholds: readonly number[],
  palette: readonly string[],
) => {
  const index = thresholds.findIndex((threshold) => value >= threshold);
  return palette[index === -1 ? palette.length - 1 : index];
};

export const colorForBattingAverage = (average: number): string =>
  colorByDescendingThresholds(average, [0.45, 0.35, 0.25, 0.15], WARM_TO_COLD);

export const colorForSlugging = (slugging: number): string =>
  colorByDescendingThresholds(slugging, [0.7, 0.55, 0.4, 0.25], WARM_TO_COLD);

export const colorForStrikeoutRate = (rate: number): string => {
  const index = [0.1, 0.18, 0.25, 0.35].findIndex(
    (threshold) => rate <= threshold,
  );
  return WARM_TO_COLD[index === -1 ? WARM_TO_COLD.length - 1 : index];
};

/** 均等配分比（セルの打席割合 ÷ 均等配分なら入る割合）で濃淡を決める。 */
export const colorForPlateAppearanceShare = (evenShareRatio: number): string =>
  colorByDescendingThresholds(evenShareRatio, [2, 1.5, 1, 0.5], PRIMARY_SHADES);

const formatPercent = (ratio: number) => `${Math.round(ratio * 100)}%`;

const EMPTY_VALUE: PitchCourseMetricValue = {
  valueText: "-",
  subText: null,
  color: null,
  isReliable: true,
};

export interface PitchCourseMetricContext {
  /** 打率・長打率を参考値扱いにしない最低打数（API の min_at_bats）。 */
  minAtBats: number;
  /** 打席分布の割合の分母（表示中の zones 全体の打席数）。 */
  totalPlateAppearances: number;
  granularity: PitchCourseGranularity;
}

/**
 * セル / タイル 1 つ分の生カウントから、選択中の指標の表示値・色・参考値判定を計算する。
 */
export const computePitchCourseMetric = (
  metric: PitchCourseMetric,
  counts: PitchCourseCounts,
  { minAtBats, totalPlateAppearances, granularity }: PitchCourseMetricContext,
): PitchCourseMetricValue => {
  switch (metric) {
    case "plate_appearances": {
      if (counts.plate_appearances === 0 || totalPlateAppearances === 0) {
        return EMPTY_VALUE;
      }
      const share = counts.plate_appearances / totalPlateAppearances;
      return {
        valueText: String(counts.plate_appearances),
        subText: formatPercent(share),
        color: colorForPlateAppearanceShare(
          share / expectedShareFor(granularity),
        ),
        isReliable: true,
      };
    }
    case "batting_average":
    case "slugging": {
      if (counts.at_bats === 0) return EMPTY_VALUE;
      const numerator =
        metric === "batting_average" ? counts.hits : counts.total_bases;
      const rate = numerator / counts.at_bats;
      return {
        valueText: formatBattingAverage(rate, counts.at_bats),
        subText: `${counts.at_bats}打数`,
        color:
          metric === "batting_average"
            ? colorForBattingAverage(rate)
            : colorForSlugging(rate),
        isReliable: counts.at_bats >= minAtBats,
      };
    }
    case "strikeout_rate": {
      if (counts.plate_appearances === 0) return EMPTY_VALUE;
      const rate = counts.strikeouts / counts.plate_appearances;
      return {
        valueText: formatPercent(rate),
        subText: `${counts.plate_appearances}打席`,
        color: colorForStrikeoutRate(rate),
        isReliable:
          counts.plate_appearances >= STRIKEOUT_RATE_MIN_PLATE_APPEARANCES,
      };
    }
  }
};

export interface StrikeoutBreakdown {
  strikeouts: number;
  swinging: number;
  looking: number;
  /** 振り逃げ・スイング種別未入力の三振。 */
  unspecified: number;
}

export const strikeoutBreakdown = (
  zones: readonly PitchCourseCounts[],
): StrikeoutBreakdown => {
  const total = sumPitchCourseCounts(zones);
  return {
    strikeouts: total.strikeouts,
    swinging: total.swinging_strikeouts,
    looking: total.looking_strikeouts,
    unspecified: Math.max(
      0,
      total.strikeouts - total.swinging_strikeouts - total.looking_strikeouts,
    ),
  };
};
