import { formatMetricValue } from "../goal";

describe("formatMetricValue", () => {
  it("打率のような1未満の率系は先頭の0を省いた3桁小数にする", () => {
    expect(formatMetricValue("batting_average", 0.32)).toBe(".320");
  });

  it("OPSのような1以上の率系も3桁小数のまま表示する", () => {
    expect(formatMetricValue("ops", 1.023)).toBe("1.023");
  });

  it("防御率は1以上でも小数第2位まで表示する", () => {
    expect(formatMetricValue("era", 2.35)).toBe("2.35");
  });

  it("WHIPは1以上でも小数第2位まで表示する", () => {
    expect(formatMetricValue("whip", 1.2)).toBe("1.20");
  });

  it("率系でない指標は整数に丸める", () => {
    expect(formatMetricValue("hits", 12.6)).toBe("13");
  });
});
