import type { SlateNode } from "../types/baseballNote";

// プレーンテキスト → Slate JSON文字列
export function textToSlateMemo(text: string): string {
  const paragraphs = text.split("\n");
  const nodes: SlateNode[] = paragraphs.map((line) => ({
    children: [{ text: line }],
  }));
  return JSON.stringify(nodes);
}

// Slate JSON文字列 → プレーンテキスト
export function slateMemoToText(memo: string): string {
  try {
    const nodes: SlateNode[] = JSON.parse(memo);
    return nodes
      .map((node) => node.children.map((c) => c.text).join(""))
      .join("\n");
  } catch {
    return memo;
  }
}
