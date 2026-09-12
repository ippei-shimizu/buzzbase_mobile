import { shouldResetTabStack } from "../tabStackReset";

describe("shouldResetTabStack", () => {
  it("スタックがまだ生成されていなければ何もしない", () => {
    expect(shouldResetTabStack(undefined)).toBe(false);
    expect(shouldResetTabStack({ index: 0, routes: [] })).toBe(false);
  });

  it("タブの先頭(index)を表示中なら何もしない", () => {
    expect(shouldResetTabStack({ index: 0, routes: [{ name: "index" }] })).toBe(
      false,
    );
  });

  it("index の上に画面が積まれていれば先頭へ戻す", () => {
    expect(
      shouldResetTabStack({
        index: 1,
        routes: [{ name: "index" }, { name: "edit" }],
      }),
    ).toBe(true);
  });

  // Paywall の規約リンクや設定画面からの遷移では index を経由せず1枚目に載るため、
  // 「積まれた枚数」で判定すると行き止まりになる。
  it("index を経由せず1枚だけ積まれた画面からも先頭へ戻せる", () => {
    expect(
      shouldResetTabStack({ index: 0, routes: [{ name: "tokushoho" }] }),
    ).toBe(true);
  });

  it("index が未設定でも末尾の画面で判定する", () => {
    expect(shouldResetTabStack({ routes: [{ name: "privacy-policy" }] })).toBe(
      true,
    );
  });
});
