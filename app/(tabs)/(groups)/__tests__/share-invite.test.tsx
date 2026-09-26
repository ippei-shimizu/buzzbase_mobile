/**
 * グループ招待の共有画面で送る文言の振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Share } from "react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../../jest-setup-msw";
import ShareInviteScreen from "../share-invite";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock({ searchParams: { id: "7" } });
});
/* eslint-enable @typescript-eslint/no-require-imports */

beforeEach(() => {
  server.use(
    http.post(apiUrl("/groups/7/invite_link"), () =>
      HttpResponse.json({
        code: "ABC123",
        group_name: "草野球チーム",
        group_id: 7,
      }),
    ),
  );
});

// テスト本文の最後で戻すと、途中の expect で落ちたときに Share.share のスパイが後続テストへ残る。
afterEach(() => {
  jest.restoreAllMocks();
});

describe("ShareInviteScreen", () => {
  it("「LINEなどで共有」で送る文言に、招待コードと招待経由を計測できる App Store のキャンペーンリンクが含まれる", async () => {
    const shareSpy = jest
      .spyOn(Share, "share")
      .mockResolvedValue({ action: Share.dismissedAction });

    renderWithProviders(<ShareInviteScreen />);

    fireEvent.press(await screen.findByText("LINEなどで共有"));

    await waitFor(() => expect(shareSpy).toHaveBeenCalled());
    const { message } = shareSpy.mock.calls[0][0] as { message: string };
    expect(message).toContain("招待コード: ABC123");
    expect(message).toContain(
      "https://apps.apple.com/app/apple-store/id6761011816?pt=128690561&ct=share_group_invite&mt=8",
    );
  });
});
