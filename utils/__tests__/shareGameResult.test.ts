import { Share } from "react-native";
import { buildGameResult } from "../../__tests__/test-utils/factories/gameResult";
import { shareGameResult } from "../shareGameResult";

describe("shareGameResult", () => {
  let shareSpy: jest.SpyInstance;

  beforeEach(() => {
    shareSpy = jest
      .spyOn(Share, "share")
      .mockResolvedValue({ action: Share.sharedAction });
  });

  afterEach(() => {
    shareSpy.mockRestore();
  });

  it("試合のサマリ行を含むメッセージを Share に渡す", async () => {
    const game = buildGameResult({
      match_result: {
        date_and_time: "2026-05-09T13:00:00.000Z",
        match_type: "公式戦",
        opponent_team_name: "テストライオンズ",
        my_team_score: 5,
        opponent_team_score: 3,
      },
    });

    await shareGameResult(game);

    expect(shareSpy).toHaveBeenCalledTimes(1);
    const message = shareSpy.mock.calls[0][0].message as string;
    expect(message).toContain("公式戦");
    expect(message).toContain("テストライオンズ");
    expect(message).toContain("5-3");
  });

  it("打撃成績がある場合は打数・安打・本塁打・打点を含める", async () => {
    const game = buildGameResult({
      batting_average: {
        at_bats: 4,
        hit: 2,
        home_run: 1,
        runs_batted_in: 3,
      },
    });

    await shareGameResult(game);

    const message = shareSpy.mock.calls[0][0].message as string;
    expect(message).toContain("打撃: 4打数2安打 1本塁打 3打点");
  });

  it("本塁打 0 / 打点 0 の場合は省略する", async () => {
    const game = buildGameResult({
      batting_average: {
        at_bats: 3,
        hit: 1,
        home_run: 0,
        runs_batted_in: 0,
      },
    });

    await shareGameResult(game);

    const message = shareSpy.mock.calls[0][0].message as string;
    expect(message).toContain("打撃: 3打数1安打");
    expect(message).not.toContain("本塁打");
    expect(message).not.toContain("打点");
  });

  it("投球成績があれば投球行を含める", async () => {
    const game = buildGameResult({
      pitching_result: {
        innings_pitched: 6,
        strikeouts: 7,
        earned_run: 2,
      },
    });

    await shareGameResult(game);

    const message = shareSpy.mock.calls[0][0].message as string;
    expect(message).toContain("投球: 6回 7K 自責2");
  });

  it("ハッシュタグ #BUZZBASE を必ず含める", async () => {
    await shareGameResult(buildGameResult());
    const message = shareSpy.mock.calls[0][0].message as string;
    expect(message).toContain("#BUZZBASE");
  });

  it("Share の action が sharedAction なら shared: true を返す", async () => {
    shareSpy.mockResolvedValueOnce({ action: Share.sharedAction });
    await expect(shareGameResult(buildGameResult())).resolves.toEqual({
      shared: true,
    });
  });

  it("Share の action が dismissed なら shared: false を返す", async () => {
    shareSpy.mockResolvedValueOnce({ action: Share.dismissedAction });
    await expect(shareGameResult(buildGameResult())).resolves.toEqual({
      shared: false,
    });
  });

  it("Share が例外を投げても shared: false で吸収する", async () => {
    shareSpy.mockRejectedValueOnce(new Error("user cancelled"));
    await expect(shareGameResult(buildGameResult())).resolves.toEqual({
      shared: false,
    });
  });
});
