import { formatRate, formatRate2, formatEra } from "../formatStats";

describe("formatRate（小数3桁・1未満は先頭0除去）", () => {
  it("0 はそのまま 0.000 を返す（先頭0は除去しない）", () => {
    expect(formatRate(0)).toBe("0.000");
  });

  it("1 未満の正数は先頭の 0 を除去する", () => {
    expect(formatRate(0.583)).toBe(".583");
    expect(formatRate(0.001)).toBe(".001");
  });

  it("1 以上はそのまま 3 桁丸めで返す", () => {
    expect(formatRate(1)).toBe("1.000");
    expect(formatRate(1.234)).toBe("1.234");
  });

  it("負数（-1 < value < 0）は符号を維持し先頭 0 はそのまま残る", () => {
    // 現状の実装は `^0` を除去するため `-0.xxx` の `0` は残る（バグでなくスペック）。
    // 振る舞いとして「符号付き小数3桁」を返すことが保証されていれば十分。
    expect(formatRate(-0.5)).toBe("-0.500");
  });

  it("-1 以下は小数3桁でそのまま返す", () => {
    expect(formatRate(-1)).toBe("-1.000");
  });

  it("toFixed(3) と同じ丸め規則で 4 桁目を処理する", () => {
    // 浮動小数点の表現上、0.5005 は実際には 0.5004999... になるため `.500` が返る。
    expect(formatRate(0.5005)).toBe(".500");
    expect(formatRate(0.5006)).toBe(".501");
  });
});

describe("formatRate2（小数2桁・1未満は先頭0除去）", () => {
  it("0 はそのまま 0.00 を返す", () => {
    expect(formatRate2(0)).toBe("0.00");
  });

  it("1 未満の正数は先頭の 0 を除去する", () => {
    expect(formatRate2(0.67)).toBe(".67");
  });

  it("1 以上はそのまま 2 桁丸めで返す", () => {
    expect(formatRate2(1)).toBe("1.00");
    expect(formatRate2(2.5)).toBe("2.50");
  });
});

describe("formatEra（小数2桁・先頭0は除去しない）", () => {
  it("0 は 0.00 を返す", () => {
    expect(formatEra(0)).toBe("0.00");
  });

  it("1 未満の正数も先頭 0 を残す", () => {
    expect(formatEra(0.5)).toBe("0.50");
  });

  it("通常の防御率レンジを 2 桁で返す", () => {
    expect(formatEra(3.45)).toBe("3.45");
    expect(formatEra(9.999)).toBe("10.00");
  });
});
