/**
 * カレンダー「日」表示のタイムラインタップで、時刻付きの予定作成画面へ遷移する振る舞いテスト。
 */
import { fireEvent, screen, waitFor } from "@testing-library/react-native";
import {
  apiUrl,
  baseUrl,
  http,
  HttpResponse,
} from "../../../__tests__/test-utils/handlers";
import { renderWithProviders } from "../../../__tests__/test-utils/renderWithProviders";
import { server } from "../../../jest-setup-msw";
import { DEFAULT_PRO_STATUS } from "../../../types/pro";
import { todayIso } from "../../../utils/planDate";
import { CalendarView } from "../CalendarView";

/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock("expo-router", () => {
  const {
    buildExpoRouterMock,
  } = require("../../../__tests__/test-utils/mockExpoRouter");
  return buildExpoRouterMock();
});

const getRouterSpies = () => {
  const routerModule = require("expo-router") as {
    __routerSpies: { push: jest.Mock };
  };
  return routerModule.__routerSpies;
};
/* eslint-enable @typescript-eslint/no-require-imports */

// PaywallModal が pro_features フラグで kill switch される設計のため、常時 true を返す。
jest.mock("@hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ enabled: true, isLoading: false })),
}));

const respondWithEmptyCalendar = () => {
  server.use(
    http.get(apiUrl("/pro/status"), () =>
      HttpResponse.json(DEFAULT_PRO_STATUS),
    ),
    http.get(baseUrl("/api/v2/plans/calendar"), () =>
      HttpResponse.json({ entries: [] }),
    ),
  );
};

/** 月表示の曜日ヘッダーにも「日」があるため、先頭の切替ボタンを押す。 */
const switchToDayMode = async () => {
  await waitFor(() => expect(screen.getAllByText("日")[0]).toBeOnTheScreen());
  fireEvent.press(screen.getAllByText("日")[0]);
};

describe("CalendarView 日表示のタイムライン", () => {
  beforeEach(() => {
    getRouterSpies().push.mockClear();
  });

  it("時間行の上半分をタップすると、その時刻ちょうどの予定作成画面へ遷移する", async () => {
    respondWithEmptyCalendar();
    renderWithProviders(<CalendarView />);
    await switchToDayMode();

    fireEvent.press(await screen.findByLabelText("9時に予定を追加"), {
      nativeEvent: { locationY: 4 },
    });

    expect(getRouterSpies().push).toHaveBeenCalledWith(
      `/(schedule)/new?date=${todayIso()}&time=09:00`,
    );
  });

  it("時間行の下半分をタップすると、30分刻みに丸めた時刻で遷移する", async () => {
    respondWithEmptyCalendar();
    renderWithProviders(<CalendarView />);
    await switchToDayMode();

    fireEvent.press(await screen.findByLabelText("9時に予定を追加"), {
      nativeEvent: { locationY: 40 },
    });

    expect(getRouterSpies().push).toHaveBeenCalledWith(
      `/(schedule)/new?date=${todayIso()}&time=09:30`,
    );
  });
});
