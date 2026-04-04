export const battingResultsPositions = [
  { id: 0, label: "-" },
  { id: 1, label: "投" },
  { id: 2, label: "捕" },
  { id: 3, label: "一" },
  { id: 4, label: "二" },
  { id: 5, label: "三" },
  { id: 6, label: "遊" },
  { id: 7, label: "左線" },
  { id: 8, label: "左" },
  { id: 9, label: "左中" },
  { id: 10, label: "中" },
  { id: 11, label: "右中" },
  { id: 12, label: "右" },
  { id: 13, label: "右線" },
];

// hit_direction_id(新13方向) → batting_position_id(旧9方向) への変換
// 旧IDに存在しない方向（左線/左中/右中/右線）は最も近い旧IDにマッピング
export const hitDirectionToLegacy: Record<number, number> = {
  1: 1, // 投→投
  2: 2, // 捕→捕
  3: 3, // 一→一
  4: 4, // 二→二
  5: 5, // 三→三
  6: 6, // 遊→遊
  7: 7, // 左線→左
  8: 7, // 左→左
  9: 7, // 左中→左
  10: 8, // 中→中
  11: 9, // 右中→右
  12: 9, // 右→右
  13: 9, // 右線→右
};

export const battingResultsList = [
  { id: 0, label: "-" },
  { id: 1, label: "ゴロ" },
  { id: 2, label: "フライ" },
  { id: 3, label: "ファールフライ" },
  { id: 4, label: "ライナー" },
  { id: 5, label: "エラー" },
  { id: 6, label: "フィルダースチョイス" },
  { id: 7, label: "ヒット" },
  { id: 8, label: "二塁打" },
  { id: 9, label: "三塁打" },
  { id: 10, label: "本塁打" },
  { id: 11, label: "犠打" },
  { id: 12, label: "犠飛" },
  { id: 13, label: "三振" },
  { id: 14, label: "振り逃げ" },
  { id: 15, label: "四球" },
  { id: 16, label: "死球" },
  { id: 17, label: "打撃妨害" },
  { id: 18, label: "走塁妨害" },
  { id: 19, label: "併殺打" },
];

export const resultShortForms: Record<string, string> = {
  ゴロ: "ゴ",
  フライ: "飛",
  ファールフライ: "邪飛",
  ライナー: "直",
  エラー: "失",
  フィルダースチョイス: "野選",
  ヒット: "安",
  二塁打: "二",
  三塁打: "三",
  本塁打: "本",
  犠打: "犠打",
  犠飛: "犠飛",
  振り逃げ: "振逃",
  打撃妨害: "打妨",
  走塁妨害: "走妨",
  併殺打: "併",
};

export function getResultText(positionId: number, resultId: number): string {
  const positionLabel =
    battingResultsPositions.find((p) => p.id === positionId)?.label ?? "";
  const resultLabel =
    battingResultsList.find((r) => r.id === resultId)?.label ?? "";
  const shortForm = resultShortForms[resultLabel] ?? resultLabel;
  return `${positionLabel}${shortForm}`;
}

/** 打撃ボックスから各種打撃成績を自動計算する */
export function computeBattingStats(
  boxes: { position: number; result: number }[],
) {
  let totalBases = 0;
  let strikeOuts = 0;
  let baseOnBalls = 0;
  let hitByPitch = 0;
  let sacrificeHit = 0;
  let sacrificeFly = 0;

  const validBoxes = boxes.filter(
    (box) => box.position !== 0 || box.result !== 0,
  );
  const excludedResults = [15, 16, 11, 12, 17, 18];
  const excludedCount = boxes.filter((box) =>
    excludedResults.includes(box.result),
  ).length;

  const timesAtBat = validBoxes.length;
  const atBats = timesAtBat - excludedCount;
  const hit = boxes.filter((box) => box.result === 7).length;
  const twoBaseHit = boxes.filter((box) => box.result === 8).length;
  const threeBaseHit = boxes.filter((box) => box.result === 9).length;
  const homeRun = boxes.filter((box) => box.result === 10).length;

  boxes.forEach((box) => {
    if (box.result === 7) totalBases += 1;
    if (box.result === 8) totalBases += 2;
    if (box.result === 9) totalBases += 3;
    if (box.result === 10) totalBases += 4;
    if (box.result === 13 || box.result === 14) strikeOuts += 1;
    if (box.result === 15) baseOnBalls += 1;
    if (box.result === 16) hitByPitch += 1;
    if (box.result === 11) sacrificeHit += 1;
    if (box.result === 12) sacrificeFly += 1;
  });

  return {
    plateAppearances: timesAtBat,
    timesAtBat,
    atBats,
    hit,
    twoBaseHit,
    threeBaseHit,
    homeRun,
    totalBases,
    strikeOuts,
    baseOnBalls,
    hitByPitch,
    sacrificeHit,
    sacrificeFly,
  };
}
