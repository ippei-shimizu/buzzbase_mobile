import type { ActivityLog } from "../../../types/activity";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { Heatmap } from "../Heatmap";

const DATA: ActivityLog[] = [
  {
    activity_date: "2026-07-03",
    intensity_level: 2,
    has_game: false,
    total_swing_count: 50,
    practice_menu_count: 1,
  },
];

describe("Heatmap", () => {
  it("セルをタップするとonCellPressに日付とlogを渡す", () => {
    const onCellPress = jest.fn();
    render(
      <Heatmap
        data={DATA}
        from="2026-07-01"
        to="2026-07-07"
        onCellPress={onCellPress}
      />,
    );

    fireEvent.press(screen.getByLabelText("2026年7月3日(金)"));

    expect(onCellPress).toHaveBeenCalledWith({
      date: "2026-07-03",
      log: DATA[0],
    });
  });

  it("記録の無い日をタップするとlog:nullでonCellPressが呼ばれる", () => {
    const onCellPress = jest.fn();
    render(
      <Heatmap
        data={DATA}
        from="2026-07-01"
        to="2026-07-07"
        onCellPress={onCellPress}
      />,
    );

    fireEvent.press(screen.getByLabelText("2026年7月6日(月)"));

    expect(onCellPress).toHaveBeenCalledWith({
      date: "2026-07-06",
      log: null,
    });
  });

  it("lockedBeforeより前のセルはonLockedPressが呼ばれ、onCellPressは呼ばれない", () => {
    const onCellPress = jest.fn();
    const onLockedPress = jest.fn();
    render(
      <Heatmap
        data={DATA}
        from="2026-07-01"
        to="2026-07-07"
        lockedBefore="2026-07-05"
        onLockedPress={onLockedPress}
        onCellPress={onCellPress}
      />,
    );

    fireEvent.press(screen.getByLabelText("2026年7月3日(金)（Pro限定）"));

    expect(onLockedPress).toHaveBeenCalledTimes(1);
    expect(onCellPress).not.toHaveBeenCalled();
  });

  it("lockedBefore以降のセルは通常通りonCellPressが呼ばれる", () => {
    const onCellPress = jest.fn();
    const onLockedPress = jest.fn();
    render(
      <Heatmap
        data={DATA}
        from="2026-07-01"
        to="2026-07-07"
        lockedBefore="2026-07-05"
        onLockedPress={onLockedPress}
        onCellPress={onCellPress}
      />,
    );

    fireEvent.press(screen.getByLabelText("2026年7月6日(月)"));

    expect(onCellPress).toHaveBeenCalledWith({
      date: "2026-07-06",
      log: null,
    });
    expect(onLockedPress).not.toHaveBeenCalled();
  });

  it("onCellPress未指定のセルはPressableにならず、タップしても何も起きない", () => {
    render(<Heatmap data={DATA} from="2026-07-01" to="2026-07-07" />);

    expect(screen.queryByLabelText("2026年7月3日(金)")).toBeNull();
  });
});
