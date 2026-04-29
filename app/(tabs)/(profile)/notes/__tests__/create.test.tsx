import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import { textToSlateMemo } from "@utils/slateUtils";
import NoteCreateScreen from "../create";

const mockBack = jest.fn();
const mockCreateNote = jest.fn();
const mockNavDispatch = jest.fn();
let mockIsCreating = false;

let capturedPreventRemove = false;
let capturedRemoveCallback: (options: {
  data: { action: unknown };
}) => void = () => {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock("@react-navigation/native", () => ({
  usePreventRemove: (
    preventRemove: boolean,
    callback: (options: { data: { action: unknown } }) => void,
  ) => {
    capturedPreventRemove = preventRemove;
    capturedRemoveCallback = callback;
  },
  useNavigation: () => ({ dispatch: mockNavDispatch }),
}));

jest.mock("@hooks/useBaseballNoteMutations", () => ({
  useCreateBaseballNote: () => ({
    createNote: mockCreateNote,
    isCreating: mockIsCreating,
  }),
}));

const triggerBack = () => {
  capturedRemoveCallback({ data: { action: { type: "GO_BACK" } } });
};

const getDestructiveButton = () => {
  const alertCalls = (Alert.alert as jest.Mock).mock.calls;
  const lastCall = alertCalls[alertCalls.length - 1];
  const buttons = lastCall[2] as { style?: string; onPress?: () => void }[];
  return buttons.find((b) => b.style === "destructive");
};

const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

describe("NoteCreateScreen", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockCreateNote.mockReset();
    mockCreateNote.mockResolvedValue({ id: 1 });
    mockNavDispatch.mockClear();
    mockIsCreating = false;
    capturedPreventRemove = false;
    capturedRemoveCallback = () => {};
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("初期表示時、日付フィールドに本日の日付がプリセットされる", () => {
    render(<NoteCreateScreen />);
    expect(screen.getByPlaceholderText("YYYY-MM-DD").props.value).toBe(
      todayString(),
    );
  });

  it("title未入力では保存ボタンが押下できない", () => {
    render(<NoteCreateScreen />);
    fireEvent.press(screen.getByText("作成"));
    expect(mockCreateNote).not.toHaveBeenCalled();
  });

  it("dateを空にすると保存できない", () => {
    render(<NoteCreateScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "練習");
    fireEvent.changeText(screen.getByPlaceholderText("YYYY-MM-DD"), "");
    fireEvent.press(screen.getByText("作成"));
    expect(mockCreateNote).not.toHaveBeenCalled();
  });

  it("titleとdateが入力されれば保存ボタンが有効になる", async () => {
    render(<NoteCreateScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("タイトルを入力"),
      "今日の振り返り",
    );
    fireEvent.press(screen.getByText("作成"));
    await waitFor(() => expect(mockCreateNote).toHaveBeenCalledTimes(1));
  });

  it("保存時、createNoteが正しいpayloadで呼ばれる", async () => {
    render(<NoteCreateScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("タイトルを入力"),
      "  今日の試合  ",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("YYYY-MM-DD"),
      "2026-04-29",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("メモを入力"),
      "ヒット2本\n好走塁あり",
    );
    fireEvent.press(screen.getByText("作成"));
    await waitFor(() => expect(mockCreateNote).toHaveBeenCalledTimes(1));
    expect(mockCreateNote).toHaveBeenCalledWith({
      title: "今日の試合",
      date: "2026-04-29",
      memo: textToSlateMemo("ヒット2本\n好走塁あり"),
    });
  });

  it("保存成功時 router.back() が呼ばれる", async () => {
    render(<NoteCreateScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "T");
    fireEvent.press(screen.getByText("作成"));
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it("保存失敗時 Alert.alert がエラーメッセージで呼ばれる", async () => {
    mockCreateNote.mockRejectedValueOnce(new Error("network error"));
    render(<NoteCreateScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "T");
    fireEvent.press(screen.getByText("作成"));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "ノートの作成に失敗しました",
      ),
    );
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("isCreating中はActivityIndicatorが表示され、テキストは非表示", () => {
    mockIsCreating = true;
    render(<NoteCreateScreen />);
    expect(screen.queryByText("作成")).toBeNull();
  });

  describe("未保存変更の戻り確認", () => {
    it("入力が空の場合は preventRemove=false（ガードしない）", () => {
      render(<NoteCreateScreen />);
      expect(capturedPreventRemove).toBe(false);
    });

    it("title/memoが入力されると preventRemove=true（ガードする）", () => {
      render(<NoteCreateScreen />);
      fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "T");
      expect(capturedPreventRemove).toBe(true);
    });

    it("ガード状態で戻ろうとすると確認 Alert が表示される", () => {
      render(<NoteCreateScreen />);
      fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "T");
      triggerBack();
      expect(Alert.alert).toHaveBeenCalledWith(
        "変更を破棄しますか？",
        "編集中の内容は失われます。",
        expect.any(Array),
      );
    });

    it("Alert で「破棄する」を選ぶと navigation.dispatch が呼ばれる", () => {
      render(<NoteCreateScreen />);
      fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "T");
      triggerBack();
      getDestructiveButton()?.onPress?.();
      expect(mockNavDispatch).toHaveBeenCalledWith({ type: "GO_BACK" });
    });

    it("Alert で「キャンセル」を選んでも navigation.dispatch は呼ばれない", () => {
      render(<NoteCreateScreen />);
      fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "T");
      triggerBack();
      // destructiveを呼ばないだけ（cancelボタンは何もしない設計）
      expect(mockNavDispatch).not.toHaveBeenCalled();
    });

    it("保存成功後の戻りは Alert なし・dispatch される", async () => {
      render(<NoteCreateScreen />);
      fireEvent.changeText(screen.getByPlaceholderText("タイトルを入力"), "T");
      fireEvent.press(screen.getByText("作成"));
      await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
      // 保存後にbeforeRemoveが発火した場合の挙動: Alert出さずに通す
      triggerBack();
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const guardCall = alertCalls.find((c) => c[0] === "変更を破棄しますか？");
      expect(guardCall).toBeUndefined();
      expect(mockNavDispatch).toHaveBeenCalledWith({ type: "GO_BACK" });
    });
  });
});
