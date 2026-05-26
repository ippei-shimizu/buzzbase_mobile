/**
 * ProGate コンポーネントの結合テスト。
 *
 * 方針:
 * - HTTP 層を MSW で intercept し、useEntitlement / useProStatus / services は実物を通す。
 * - expo-router は buildExpoRouterMock を使ってモジュール全体を差し替える。
 * - 表示判定（許可 → children、未許可 → fallback or renderLockedTrigger）を
 *   ユーザーから見える DOM 経由で検証する。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import { Text, TouchableOpacity } from "react-native";
import {
  apiUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS, FREE_FEATURES } from "../../../types/pro";
import { ProGate } from "../ProGate";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、
// 既存 ProGate テストでは常時 true を返してフラグ取得の API を経由しないようにする。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const respondFree = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
  );
};

const respondPro = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json({
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "active",
          pro_active: true,
          expires_at: "2026-12-31T00:00:00+09:00",
          days_remaining: 30,
        },
        entitlements: [...FREE_FEATURES, "season_transition_graph"],
      }),
    ),
  );
};

describe("ProGate", () => {
  it("Pro ユーザーには children が表示される", async () => {
    respondPro();

    renderWithProviders(
      <ProGate feature="season_transition_graph">
        <Text>Pro Content</Text>
      </ProGate>,
    );

    await waitFor(() => {
      expect(screen.getByText("Pro Content")).toBeOnTheScreen();
    });
  });

  it("無料ユーザーには children が表示されない", async () => {
    respondFree();

    renderWithProviders(
      <ProGate feature="season_transition_graph">
        <Text>Pro Content</Text>
      </ProGate>,
    );

    // 初期ロードが完了するまで待ち、Pro Content が表示されないことを確認
    await waitFor(() => {
      expect(screen.queryByText("Pro Content")).not.toBeOnTheScreen();
    });
  });

  it("無料ユーザーで fallback を渡すと fallback が表示される", async () => {
    respondFree();

    renderWithProviders(
      <ProGate
        feature="season_transition_graph"
        fallback={<Text>Locked Notice</Text>}
      >
        <Text>Pro Content</Text>
      </ProGate>,
    );

    await waitFor(() => {
      expect(screen.getByText("Locked Notice")).toBeOnTheScreen();
    });
    expect(screen.queryByText("Pro Content")).not.toBeOnTheScreen();
  });

  it("renderLockedTrigger をタップすると PaywallModal が開く", async () => {
    respondFree();

    renderWithProviders(
      <ProGate
        feature="season_transition_graph"
        renderLockedTrigger={(open) => (
          <TouchableOpacity onPress={open} accessibilityRole="button">
            <Text>ロック解除</Text>
          </TouchableOpacity>
        )}
      >
        <Text>Pro Content</Text>
      </ProGate>,
    );

    await waitFor(() => {
      expect(screen.getByText("ロック解除")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText("ロック解除"));

    // PaywallModal の Pro 機能特有の文言が表示される
    expect(screen.getByText("シーズンを跨いだ成長を可視化")).toBeOnTheScreen();
  });
});
