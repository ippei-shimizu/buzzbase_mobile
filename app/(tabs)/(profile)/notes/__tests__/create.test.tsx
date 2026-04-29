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
let mockIsCreating = false;

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock("@hooks/useBaseballNoteMutations", () => ({
  useCreateBaseballNote: () => ({
    createNote: mockCreateNote,
    isCreating: mockIsCreating,
  }),
}));

const todayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

describe("NoteCreateScreen", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockCreateNote.mockReset();
    mockCreateNote.mockResolvedValue({ id: 1 });
    mockIsCreating = false;
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
});
