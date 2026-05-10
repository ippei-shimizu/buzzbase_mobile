import { markdownToHtml } from "../markdownToHtml";

describe("markdownToHtml", () => {
  it("空文字は空文字を返す", () => {
    expect(markdownToHtml("")).toBe("");
  });

  it("プレーンテキストは段落タグで包む", () => {
    expect(markdownToHtml("こんにちは")).toBe("<p>こんにちは</p>");
  });

  it("太字 ** ** を <strong> に変換する", () => {
    expect(markdownToHtml("**重要**な内容")).toBe(
      "<p><strong>重要</strong>な内容</p>",
    );
  });

  it("斜体 *...* を <em> に変換する", () => {
    expect(markdownToHtml("*強調*テキスト")).toBe(
      "<p><em>強調</em>テキスト</p>",
    );
  });

  it("リンク [text](url) を <a> に変換する", () => {
    expect(markdownToHtml("[公式](https://example.com)")).toBe(
      '<p><a href="https://example.com">公式</a></p>',
    );
  });

  it("画像 ![alt](url) を <img> に変換する（リンクより先にマッチ）", () => {
    expect(markdownToHtml("![図](https://example.com/i.png)")).toBe(
      '<img src="https://example.com/i.png" alt="図">',
    );
  });

  it("見出し # ## ### を <h1>〜<h3> に変換する", () => {
    expect(markdownToHtml("# タイトル")).toBe("<h1>タイトル</h1>");
    expect(markdownToHtml("## サブ")).toBe("<h2>サブ</h2>");
    expect(markdownToHtml("### 小見出し")).toBe("<h3>小見出し</h3>");
  });

  it("リスト - を <ul><li> でグループ化する", () => {
    const html = markdownToHtml("- 一つ目\n- 二つ目");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>一つ目</li>");
    expect(html).toContain("<li>二つ目</li>");
    expect(html).toContain("</ul>");
  });

  it("水平線 --- を <hr> に変換する", () => {
    expect(markdownToHtml("---")).toBe("<hr>");
  });

  it("空行区切りで複数段落を生成する", () => {
    const html = markdownToHtml("段落1\n\n段落2");
    expect(html).toContain("<p>段落1</p>");
    expect(html).toContain("<p>段落2</p>");
  });

  it("段落内の単一改行は <br> に変換する", () => {
    expect(markdownToHtml("行1\n行2")).toBe("<p>行1<br>行2</p>");
  });
});
