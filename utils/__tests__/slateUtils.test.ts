import { textToSlateMemo, slateMemoToText } from "../slateUtils";

describe("textToSlateMemo", () => {
  it("単一行を 1 ノードの SlateNode 配列に変換する", () => {
    const result = textToSlateMemo("こんにちは");
    expect(JSON.parse(result)).toEqual([
      { children: [{ text: "こんにちは" }] },
    ]);
  });

  it("改行ごとに別ノードに分割する", () => {
    const result = textToSlateMemo("1行目\n2行目");
    expect(JSON.parse(result)).toEqual([
      { children: [{ text: "1行目" }] },
      { children: [{ text: "2行目" }] },
    ]);
  });

  it("空文字でも 1 ノードを生成する", () => {
    expect(JSON.parse(textToSlateMemo(""))).toEqual([
      { children: [{ text: "" }] },
    ]);
  });
});

describe("slateMemoToText", () => {
  it("SlateNode 配列の JSON をプレーンテキストに戻す", () => {
    const memo = JSON.stringify([
      { children: [{ text: "1行目" }] },
      { children: [{ text: "2行目" }] },
    ]);
    expect(slateMemoToText(memo)).toBe("1行目\n2行目");
  });

  it("1 ノード内に複数 child があれば連結する", () => {
    const memo = JSON.stringify([
      { children: [{ text: "前半" }, { text: "後半" }] },
    ]);
    expect(slateMemoToText(memo)).toBe("前半後半");
  });

  it("不正な JSON は元の文字列をそのまま返す（フォールバック）", () => {
    expect(slateMemoToText("これはJSONじゃない")).toBe("これはJSONじゃない");
  });
});

describe("textToSlateMemo ↔ slateMemoToText の往復", () => {
  it.each([
    "シンプルテキスト",
    "改行\nを含む\n複数行",
    "",
    "日本語と English と 123 数字",
  ])("入力 %j は往復で同じテキストに戻る", (text) => {
    expect(slateMemoToText(textToSlateMemo(text))).toBe(text);
  });
});
