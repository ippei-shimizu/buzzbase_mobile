import { buildTimelineLayout, minutesFromMidnight } from "../dayTimeline";

describe("minutesFromMidnight", () => {
  it("HH:MM を0時からの経過分にする", () => {
    expect(minutesFromMidnight("00:00")).toBe(0);
    expect(minutesFromMidnight("06:30")).toBe(390);
    expect(minutesFromMidnight("23:59")).toBe(1439);
  });

  it("1桁の時も受け付ける", () => {
    expect(minutesFromMidnight("6:05")).toBe(365);
  });

  it("形式や範囲が不正なら null", () => {
    expect(minutesFromMidnight("")).toBeNull();
    expect(minutesFromMidnight("24:00")).toBeNull();
    expect(minutesFromMidnight("12:60")).toBeNull();
    expect(minutesFromMidnight("12時")).toBeNull();
  });
});

describe("buildTimelineLayout", () => {
  const layout = (minutes: number[]) =>
    buildTimelineLayout(minutes, (value) => value);

  it("時刻順に並べ替える", () => {
    expect(layout([600, 60, 300]).map((p) => p.minutes)).toEqual([
      60, 300, 600,
    ]);
  });

  it("離れた予定は1列ずつ全幅で置く", () => {
    expect(layout([60, 300]).map((p) => p.columnCount)).toEqual([1, 1]);
  });

  it("近接した予定は横に並べて重ならないようにする", () => {
    const placements = layout([360, 370, 380]);
    expect(placements.map((p) => p.columnCount)).toEqual([3, 3, 3]);
    expect(placements.map((p) => p.column)).toEqual([0, 1, 2]);
  });

  it("同時刻の予定も横に並べる", () => {
    const placements = layout([360, 360]);
    expect(placements.map((p) => p.column)).toEqual([0, 1]);
    expect(placements.map((p) => p.columnCount)).toEqual([2, 2]);
  });

  // 先頭からの差で判定すると 7:15 が別グループになり、6:40 のブロックと視覚的に重なる。
  it("少しずつずれて連なる予定も同じグループにまとめる", () => {
    const placements = layout([360, 400, 435]);
    expect(placements.map((p) => p.columnCount)).toEqual([3, 3, 3]);
    expect(placements.map((p) => p.column)).toEqual([0, 1, 2]);
  });

  it("間隔が空いたところでグループを切る", () => {
    const placements = layout([360, 400, 600]);
    expect(placements.map((p) => p.columnCount)).toEqual([2, 2, 1]);
  });

  it("空配列なら空を返す", () => {
    expect(layout([])).toEqual([]);
  });
});
