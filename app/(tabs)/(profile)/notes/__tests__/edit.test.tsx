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

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
  useLocalSearchParams: () => ({ id: "42" }),
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
});
