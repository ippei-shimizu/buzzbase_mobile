/** タイムライン上でブロック1つが占める想定の時間（分）。重なり判定の幅にも使う。 */
export const TIMELINE_BLOCK_MINUTES = 45;

/**
 * "HH:MM" を0時からの経過分に変換する。
 * @returns 経過分。形式・範囲が不正なら null
 */
export const minutesFromMidnight = (time: string): number | null => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

export interface TimelinePlacement<T> {
  item: T;
  minutes: number;
  /** 同時間帯で横に並べるときの列番号（0始まり）。 */
  column: number;
  /** 同時間帯の列数。幅は 1/columnCount になる。 */
  columnCount: number;
}

/**
 * 時刻付き要素をタイムラインへ配置するための列割りを計算する。
 *
 * 予定は終了時刻を持たないため、開始が TIMELINE_BLOCK_MINUTES 以内に固まっているものを
 * 「重なっている」とみなして横に並べる。そうしないとブロック同士が重なって
 * 後ろの予定が読めなくなる。
 *
 * @param items 時刻付き要素（順不同でよい）
 * @param minutesOf 要素から0時からの経過分を取り出す関数
 * @returns 開始時刻の昇順に並んだ配置情報
 */
export const buildTimelineLayout = <T>(
  items: T[],
  minutesOf: (item: T) => number,
): TimelinePlacement<T>[] => {
  const sorted = [...items].sort((a, b) => minutesOf(a) - minutesOf(b));

  const groups: { item: T; minutes: number }[][] = [];
  for (const item of sorted) {
    const minutes = minutesOf(item);
    const lastGroup = groups.at(-1);
    if (lastGroup && minutes - lastGroup[0].minutes < TIMELINE_BLOCK_MINUTES) {
      lastGroup.push({ item, minutes });
    } else {
      groups.push([{ item, minutes }]);
    }
  }

  return groups.flatMap((group) =>
    group.map((entry, index) => ({
      item: entry.item,
      minutes: entry.minutes,
      column: index,
      columnCount: group.length,
    })),
  );
};
