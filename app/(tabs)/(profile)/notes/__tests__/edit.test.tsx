import type { BaseballNote } from "../../../../../types/baseballNote";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { Alert } from "react-native";
import { textToSlateMemo } from "@utils/slateUtils";
import NoteEditScreen from "../edit";

const mockBack = jest.fn();
const mockUpdateNote = jest.fn();
const mockUseBaseballNote = jest.fn();
const mockNavDispatch = jest.fn();

let capturedPreventRemove = false;
let capturedRemoveCallback: (options: {
  data: { action: unknown };
}) => void = () => {};

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ id: "42" }),
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
  useUpdateBaseballNote: () => ({
    updateNote: mockUpdateNote,
    isUpdating: false,
  }),
}));

jest.mock("@hooks/useBaseballNotes", () => ({
  useBaseballNote: () => mockUseBaseballNote(),
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

const buildNote = (overrides: Partial<BaseballNote> = {}): BaseballNote => ({
  id: 42,
  title: "練習試合",
  date: "2026-04-20",
  memo: textToSlateMemo("ヒット2本\n好走塁あり"),
  created_at: "2026-04-20T10:00:00Z",
  updated_at: "2026-04-20T10:00:00Z",
  ...overrides,
});

describe("NoteEditScreen", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockUpdateNote.mockReset();
    mockUpdateNote.mockResolvedValue({ id: 42 });
    mockUseBaseballNote.mockReset();
    mockNavDispatch.mockClear();
    capturedPreventRemove = false;
    capturedRemoveCallback = () => {};
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("isLoading中は ActivityIndicator のみ描画され、フォームは表示されない", () => {
    mockUseBaseballNote.mockReturnValue({ note: undefined, isLoading: true });
    render(<NoteEditScreen />);
    expect(screen.queryByPlaceholderText("タイトルを入力")).toBeNull();
    expect(screen.queryByText("保存")).toBeNull();
  });

  it("note取得後、title/date/memoがフォームに反映される（memoはslateMemoToText変換済み）", () => {
    mockUseBaseballNote.mockReturnValue({
      note: buildNote(),
      isLoading: false,
    });
    render(<NoteEditScreen />);
    expect(screen.getByPlaceholderText("タイトルを入力").props.value).toBe(
      "練習試合",
    );
    expect(screen.getByPlaceholderText("YYYY-MM-DD").props.value).toBe(
      "2026-04-20",
    );
    expect(screen.getByPlaceholderText("メモを入力").props.value).toBe(
      "ヒット2本\n好走塁あり",
    );
  });

  it("note取得後の再レンダーではフォーム値が上書きされない（initialized挙動）", () => {
    mockUseBaseballNote.mockReturnValue({
      note: buildNote(),
      isLoading: false,
    });
    const { rerender } = render(<NoteEditScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("タイトルを入力"),
      "編集後タイトル",
    );

    mockUseBaseballNote.mockReturnValue({
      note: buildNote({ title: "サーバー側更新" }),
      isLoading: false,
    });
    rerender(<NoteEditScreen />);

    expect(screen.getByPlaceholderText("タイトルを入力").props.value).toBe(
      "編集後タイトル",
    );
  });

  it("保存時、updateNoteが正しいpayloadで呼ばれる", async () => {
    mockUseBaseballNote.mockReturnValue({
      note: buildNote(),
      isLoading: false,
    });
    render(<NoteEditScreen />);
    fireEvent.changeText(
      screen.getByPlaceholderText("タイトルを入力"),
      "  更新後タイトル  ",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("YYYY-MM-DD"),
      "2026-04-21",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("メモを入力"),
      "更新後メモ",
    );
    fireEvent.press(screen.getByText("保存"));
    await waitFor(() => expect(mockUpdateNote).toHaveBeenCalledTimes(1));
    expect(mockUpdateNote).toHaveBeenCalledWith({
      id: 42,
      params: {
        title: "更新後タイトル",
        date: "2026-04-21",
        memo: textToSlateMemo("更新後メモ"),
      },
    });
  });

  it("保存成功時 router.back() が呼ばれる", async () => {
    mockUseBaseballNote.mockReturnValue({
      note: buildNote(),
      isLoading: false,
    });
    render(<NoteEditScreen />);
    fireEvent.press(screen.getByText("保存"));
    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
  });

  it("保存失敗時 Alert.alert がエラーメッセージで呼ばれる", async () => {
    mockUpdateNote.mockRejectedValueOnce(new Error("network error"));
    mockUseBaseballNote.mockReturnValue({
      note: buildNote(),
      isLoading: false,
    });
    render(<NoteEditScreen />);
    fireEvent.press(screen.getByText("保存"));
    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        "エラー",
        "ノートの更新に失敗しました",
      ),
    );
    expect(mockBack).not.toHaveBeenCalled();
  });

  describe("未保存変更の戻り確認", () => {
    it("初期データのまま戻る場合は preventRemove=false（ガードしない）", () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      render(<NoteEditScreen />);
      expect(capturedPreventRemove).toBe(false);
    });

    it("title編集すると preventRemove=true（ガードする）", () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      render(<NoteEditScreen />);
      fireEvent.changeText(
        screen.getByPlaceholderText("タイトルを入力"),
        "編集後",
      );
      expect(capturedPreventRemove).toBe(true);
    });

    it("memo編集すると preventRemove=true", () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      render(<NoteEditScreen />);
      fireEvent.changeText(
        screen.getByPlaceholderText("メモを入力"),
        "全く別のメモ",
      );
      expect(capturedPreventRemove).toBe(true);
    });

    it("date編集すると preventRemove=true", () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      render(<NoteEditScreen />);
      fireEvent.changeText(
        screen.getByPlaceholderText("YYYY-MM-DD"),
        "2026-04-30",
      );
      expect(capturedPreventRemove).toBe(true);
    });

    it("TanStack Queryの再フェッチでサーバー側noteが変化してもガードは発動しない", () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      const { rerender } = render(<NoteEditScreen />);
      // 初期化直後はガードされない
      expect(capturedPreventRemove).toBe(false);

      // ユーザーは何も編集していない状態で、サーバー側でメモが書き換わった想定
      mockUseBaseballNote.mockReturnValue({
        note: buildNote({
          memo: textToSlateMemo("サーバー側で更新された別のメモ"),
        }),
        isLoading: false,
      });
      rerender(<NoteEditScreen />);

      // ユーザーは編集していないのでガードしない（初期値はrefで固定する設計）
      expect(capturedPreventRemove).toBe(false);
    });

    it("ガード状態で戻ろうとすると確認 Alert が表示される", () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      render(<NoteEditScreen />);
      fireEvent.changeText(
        screen.getByPlaceholderText("タイトルを入力"),
        "編集後",
      );
      triggerBack();
      expect(Alert.alert).toHaveBeenCalledWith(
        "変更を破棄しますか？",
        "編集中の内容は失われます。",
        expect.any(Array),
      );
    });

    it("Alert で「破棄する」を選ぶと navigation.dispatch が呼ばれる", () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      render(<NoteEditScreen />);
      fireEvent.changeText(
        screen.getByPlaceholderText("タイトルを入力"),
        "編集後",
      );
      triggerBack();
      getDestructiveButton()?.onPress?.();
      expect(mockNavDispatch).toHaveBeenCalledWith({ type: "GO_BACK" });
    });

    it("保存成功後の戻りは Alert なし・dispatch される", async () => {
      mockUseBaseballNote.mockReturnValue({
        note: buildNote(),
        isLoading: false,
      });
      render(<NoteEditScreen />);
      fireEvent.changeText(
        screen.getByPlaceholderText("タイトルを入力"),
        "編集後",
      );
      fireEvent.press(screen.getByText("保存"));
      await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
      triggerBack();
      const alertCalls = (Alert.alert as jest.Mock).mock.calls;
      const guardCall = alertCalls.find((c) => c[0] === "変更を破棄しますか？");
      expect(guardCall).toBeUndefined();
      expect(mockNavDispatch).toHaveBeenCalledWith({ type: "GO_BACK" });
    });
  });
});
