import { render } from "@testing-library/react-native";
import {
  buildGameResult,
  buildPlateAppearance,
} from "../../../__tests__/test-utils/factories/gameResult";
import {
  DEFAULT_RESULT_COLOR,
  HIT_RESULT_COLOR,
} from "../../../utils/battingResultColor";
import { GameResultListItem } from "../GameResultListItem";

describe("GameResultListItem", () => {
  it("走本塁打の打席結果が柵越え本塁打と同じ安打色で表示される", () => {
    const game = buildGameResult({
      plate_appearances: [
        buildPlateAppearance({ id: 1, batting_result: "右中本" }),
        buildPlateAppearance({ id: 2, batting_result: "右中走本" }),
        buildPlateAppearance({ id: 3, batting_result: "三ゴロ" }),
      ],
    });

    const { getByText } = render(
      <GameResultListItem game={game} onPress={jest.fn()} />,
    );

    expect(getByText("右中本")).toHaveStyle({ color: HIT_RESULT_COLOR });
    expect(getByText("右中走本")).toHaveStyle({ color: HIT_RESULT_COLOR });
    expect(getByText("三ゴロ")).toHaveStyle({ color: DEFAULT_RESULT_COLOR });
  });
});
