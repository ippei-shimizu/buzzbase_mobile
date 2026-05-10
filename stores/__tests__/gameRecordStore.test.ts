import { buildGameResult } from "../../__tests__/test-utils/factories/gameResult";
import { useGameRecordStore } from "../gameRecordStore";

const initialSnapshot = useGameRecordStore.getState();

afterEach(() => {
  // 公開 action `reset` 経由でストアを初期化（内部 state を直接書き換えない）
  useGameRecordStore.getState().reset();
});

describe("battingBoxes の編集 action", () => {
  it("addBattingBox は配列の末尾に空の打席を追加する", () => {
    const before = useGameRecordStore.getState().battingBoxes;
    useGameRecordStore.getState().addBattingBox();
    const after = useGameRecordStore.getState().battingBoxes;

    expect(after).toHaveLength(before.length + 1);
    expect(after[after.length - 1]).toEqual({
      id: 0,
      position: 0,
      result: 0,
      text: "--",
    });
  });

  it("removeBattingBox(0) で配列が空になる場合、初期打席 1 件が補完される", () => {
    useGameRecordStore.getState().removeBattingBox(0);
    const after = useGameRecordStore.getState().battingBoxes;

    expect(after).toHaveLength(1);
    expect(after[0]).toEqual({ id: 0, position: 0, result: 0, text: "--" });
  });

  it("removeBattingBox は指定 index を取り除き、残りを保持する", () => {
    useGameRecordStore.getState().addBattingBox();
    useGameRecordStore.getState().setBattingBoxes([
      { id: 1, position: 1, result: 7, text: "投安" },
      { id: 2, position: 2, result: 13, text: "捕三振" },
    ]);

    useGameRecordStore.getState().removeBattingBox(0);
    const after = useGameRecordStore.getState().battingBoxes;

    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(2);
  });

  it("updateBattingBoxPosition は position と text（getResultText 経由）を更新する", () => {
    useGameRecordStore
      .getState()
      .setBattingBoxes([{ id: 1, position: 0, result: 7, text: "" }]);

    // position=10（中）, result=7（ヒット） → 結果テキストは「中安」（「ヒット」の短縮形「安」）
    useGameRecordStore.getState().updateBattingBoxPosition(0, 10);

    const updated = useGameRecordStore.getState().battingBoxes[0];
    expect(updated.position).toBe(10);
    expect(updated.text).toBe("中安");
  });

  it("updateBattingBoxResult は result と text（getResultText 経由）を更新する", () => {
    useGameRecordStore
      .getState()
      .setBattingBoxes([{ id: 1, position: 10, result: 0, text: "" }]);

    // position=10（中）, result=2（フライ） → 「中飛」
    useGameRecordStore.getState().updateBattingBoxResult(0, 2);

    const updated = useGameRecordStore.getState().battingBoxes[0];
    expect(updated.result).toBe(2);
    expect(updated.text).toBe("中飛");
  });
});

describe("computeInningsPitched", () => {
  it("whole + fraction/3 を返す（4回 + 2/3 → 4.666...）", () => {
    useGameRecordStore.getState().setField("inningsPitchedWhole", 4);
    useGameRecordStore.getState().setField("inningsPitchedFraction", 2);

    expect(useGameRecordStore.getState().computeInningsPitched()).toBeCloseTo(
      4 + 2 / 3,
    );
  });
});

describe("loadFromGameResult", () => {
  it("plate_appearances を batter_box_number 順に並べ替えて battingBoxes に展開する", () => {
    const game = buildGameResult({
      plate_appearances: [
        {
          id: 30,
          batter_box_number: 3,
          batting_result: "三振",
          game_result_id: 100,
          batting_position_id: 1,
          plate_result_id: 13,
        },
        {
          id: 10,
          batter_box_number: 1,
          batting_result: "ヒット",
          game_result_id: 100,
          batting_position_id: 10,
          plate_result_id: 7,
        },
        {
          id: 20,
          batter_box_number: 2,
          batting_result: "フライ",
          game_result_id: 100,
          batting_position_id: 8,
          plate_result_id: 2,
        },
      ],
    });

    useGameRecordStore.getState().loadFromGameResult(game);

    const boxes = useGameRecordStore.getState().battingBoxes;
    expect(boxes.map((b) => b.id)).toEqual([10, 20, 30]);
    // 1 番目: position=10（中）, result=7（安打） → 「中安」
    expect(boxes[0].text).toBe("中安");
  });

  it("innings_pitched（小数）を whole/fraction に分解する", () => {
    const game = buildGameResult({
      pitching_result: { innings_pitched: 5 + 2 / 3 },
    });

    useGameRecordStore.getState().loadFromGameResult(game);

    expect(useGameRecordStore.getState().inningsPitchedWhole).toBe(5);
    expect(useGameRecordStore.getState().inningsPitchedFraction).toBe(2);
  });

  it("isEditMode を true にし、各 ID を game_result から復元する", () => {
    const game = buildGameResult({
      game_result_id: 555,
      user_id: 7,
      season_id: 3,
    });

    useGameRecordStore.getState().loadFromGameResult(game);

    const state = useGameRecordStore.getState();
    expect(state.isEditMode).toBe(true);
    expect(state.gameResultId).toBe(555);
    expect(state.userId).toBe(7);
    expect(state.seasonId).toBe(3);
    expect(state.matchResultId).toBe(game.match_result.id);
  });

  it("plate_appearances が空でも初期打席 1 件を残す", () => {
    const game = buildGameResult({ plate_appearances: [] });

    useGameRecordStore.getState().loadFromGameResult(game);

    const boxes = useGameRecordStore.getState().battingBoxes;
    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toEqual({ id: 0, position: 0, result: 0, text: "--" });
  });

  it("batting_average / pitching_result が null でもデフォルト値で復元する", () => {
    const game = buildGameResult({
      batting_average: null,
      pitching_result: null,
    });

    useGameRecordStore.getState().loadFromGameResult(game);

    const state = useGameRecordStore.getState();
    expect(state.battingAverageId).toBeNull();
    expect(state.pitchingResultId).toBeNull();
    expect(state.runsBattedIn).toBe(0);
    expect(state.win).toBe(0);
    expect(state.inningsPitchedWhole).toBe(0);
    expect(state.inningsPitchedFraction).toBe(0);
  });
});

describe("reset", () => {
  it("各種フィールドを初期状態に戻し、date は当日に更新する", () => {
    useGameRecordStore.getState().setField("myTeamName", "チームA");
    useGameRecordStore.getState().setField("opponentTeamName", "チームB");
    useGameRecordStore.getState().setField("isEditMode", true);
    useGameRecordStore.getState().addBattingBox();
    useGameRecordStore.getState().addBattingBox();

    useGameRecordStore.getState().reset();

    const state = useGameRecordStore.getState();
    expect(state.myTeamName).toBe("");
    expect(state.opponentTeamName).toBe("");
    expect(state.isEditMode).toBe(false);
    expect(state.battingBoxes).toEqual(initialSnapshot.battingBoxes);
    // date は YYYY-MM-DD で当日が入る
    expect(state.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
