/**
 * MediaPicker の動画トリミング失敗時の振る舞いテスト。
 * ネイティブトリミング（react-native-video-trim）が失敗しても選択操作自体を
 * 未処理の Promise rejection にせず、ユーザーに結果を伝えて安全に復帰することを確認する。
 */
import { fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useEntitlement } from "@hooks/useEntitlement";
import { useVideoTrim } from "@hooks/useVideoTrim";
import { getVideoMeta } from "@utils/mediaProcessing";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { MediaPicker } from "../MediaPicker";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest
    .fn()
    .mockResolvedValue({ granted: true }),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({
    canceled: false,
    assets: [
      {
        uri: "file:///picked-video.mp4",
        type: "video",
        mimeType: "video/mp4",
      },
    ],
  }),
  launchCameraAsync: jest.fn(),
}));

jest.mock("@hooks/useVideoTrim", () => ({
  useVideoTrim: jest.fn(),
}));

jest.mock("@hooks/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

jest.mock("@utils/mediaProcessing", () => ({
  getVideoMeta: jest.fn(),
  generateVideoThumbnail: jest.fn().mockResolvedValue("file:///thumb.jpg"),
}));

const mockUseVideoTrim = useVideoTrim as jest.Mock;
const mockUseEntitlement = useEntitlement as jest.Mock;
const mockGetVideoMeta = getVideoMeta as jest.Mock;

describe("MediaPicker の動画トリミング失敗時の挙動", () => {
  let alertSpy: jest.SpyInstance;
  let trimMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockUseEntitlement.mockReturnValue({ hasEntitlement: () => false });
    // 無料プランの上限（120秒）を超える動画として、必須トリミングの分岐を通す。
    mockGetVideoMeta.mockResolvedValue({
      durationSeconds: 200,
      width: 1080,
      height: 1920,
    });
    trimMock = jest.fn();
    mockUseVideoTrim.mockReturnValue({ trim: trimMock, isTrimming: false });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("上限超過で必須トリミングが失敗したら、選択を中断してアラートで伝える（onStageは呼ばれない）", async () => {
    trimMock.mockRejectedValue(new Error("native trim failed"));
    const onStage = jest.fn();

    const { getByText } = renderWithProviders(
      <MediaPicker onStage={onStage} />,
    );
    fireEvent.press(getByText("ライブラリ"));

    await waitFor(() => expect(trimMock).toHaveBeenCalled());
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "トリミングに失敗しました",
        expect.stringContaining("別の動画を選び直してください"),
      ),
    );
    expect(onStage).not.toHaveBeenCalled();
  });

  it("上限内の動画で任意トリミングが失敗したら、元動画のまま選択を継続する", async () => {
    mockGetVideoMeta.mockResolvedValue({
      durationSeconds: 10,
      width: 1080,
      height: 1920,
    });
    trimMock.mockRejectedValue(new Error("native trim failed"));
    const onStage = jest.fn();

    const { getByText } = renderWithProviders(
      <MediaPicker onStage={onStage} />,
    );
    fireEvent.press(getByText("ライブラリ"));

    // 上限内なので「動画を編集しますか？」の確認ダイアログが出る。「トリミングする」を選ばせる。
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    const confirmCall = alertSpy.mock.calls.find(
      (call) => call[0] === "動画を編集しますか？",
    );
    const trimButton = confirmCall?.[2]?.find(
      (button: { text: string }) => button.text === "トリミングする",
    );
    trimButton?.onPress?.();

    await waitFor(() => expect(trimMock).toHaveBeenCalled());
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith(
        "トリミングに失敗しました",
        "元の動画のまま追加します。",
      ),
    );
    await waitFor(() =>
      expect(onStage).toHaveBeenCalledWith(
        expect.objectContaining({ uri: "file:///picked-video.mp4" }),
      ),
    );
  });
});
