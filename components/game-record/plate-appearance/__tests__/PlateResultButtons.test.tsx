import { fireEvent, render } from "@testing-library/react-native";
import { PLATE_RESULT_IDS } from "@constants/plateResults";
import { PlateResultButtons } from "../PlateResultButtons";

const buildProps = (
  overrides: Partial<Parameters<typeof PlateResultButtons>[0]> = {},
) => ({
  hasHitLocation: false,
  onSelectNoDirection: jest.fn(),
  onSelectOut: jest.fn(),
  onSelectHit: jest.fn(),
  onSelectDirectionOnly: jest.fn(),
  ...overrides,
});

describe("PlateResultButtons", () => {
  it("hasHitLocation=false のときアウト/ヒット/失策などタップ必要系ボタンが disabled", () => {
    const props = buildProps();
    const { getByRole } = render(<PlateResultButtons {...props} />);

    expect(
      getByRole("button", { name: "アウト" }).props.accessibilityState,
    ).toMatchObject({
      disabled: true,
    });
    expect(
      getByRole("button", { name: "ヒット" }).props.accessibilityState,
    ).toMatchObject({
      disabled: true,
    });
    expect(
      getByRole("button", { name: "失策" }).props.accessibilityState,
    ).toMatchObject({
      disabled: true,
    });
  });

  it("hasHitLocation=true で「アウト」タップ → onSelectOut が呼ばれる", () => {
    const props = buildProps({ hasHitLocation: true });
    const { getByRole } = render(<PlateResultButtons {...props} />);

    fireEvent.press(getByRole("button", { name: "アウト" }));

    expect(props.onSelectOut).toHaveBeenCalledTimes(1);
  });

  it("hasHitLocation=true で「ヒット」タップ → onSelectHit が呼ばれる", () => {
    const props = buildProps({ hasHitLocation: true });
    const { getByRole } = render(<PlateResultButtons {...props} />);

    fireEvent.press(getByRole("button", { name: "ヒット" }));

    expect(props.onSelectHit).toHaveBeenCalledTimes(1);
  });

  it("「失策」タップ → onSelectDirectionOnly が ERROR(5) で呼ばれる", () => {
    const props = buildProps({ hasHitLocation: true });
    const { getByRole } = render(<PlateResultButtons {...props} />);

    fireEvent.press(getByRole("button", { name: "失策" }));

    expect(props.onSelectDirectionOnly).toHaveBeenCalledWith(
      PLATE_RESULT_IDS.ERROR,
    );
  });

  it("「四球」タップ → onSelectNoDirection が WALK(15) で呼ばれる（タップ不要グループは常時活性）", () => {
    const props = buildProps({ hasHitLocation: false });
    const { getByRole } = render(<PlateResultButtons {...props} />);

    fireEvent.press(getByRole("button", { name: "四球" }));

    expect(props.onSelectNoDirection).toHaveBeenCalledWith(
      PLATE_RESULT_IDS.WALK,
    );
  });

  it("「空振り三振」タップ → onSelectNoDirection が STRIKEOUT(13) で呼ばれる", () => {
    const props = buildProps();
    const { getByRole } = render(<PlateResultButtons {...props} />);

    fireEvent.press(getByRole("button", { name: "空振り三振" }));

    expect(props.onSelectNoDirection).toHaveBeenCalledWith(
      PLATE_RESULT_IDS.STRIKEOUT,
    );
  });
});
