import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { FilterDropdown } from "../FilterDropdown";

describe("FilterDropdown", () => {
  const baseProps = {
    label: "年度",
    value: undefined as string | undefined,
    options: [
      { key: "2024", label: "2024" },
      { key: "2023", label: "2023" },
    ],
    onSelect: jest.fn(),
    isOpen: false,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("初期表示で `{label}: 全て` が表示される", () => {
    render(<FilterDropdown {...baseProps} />);
    expect(screen.getByText("年度: 全て")).toBeTruthy();
  });

  it("value にマッチするオプションがある場合はそのラベルが表示される", () => {
    render(<FilterDropdown {...baseProps} value="2024" />);
    expect(screen.getByText("年度: 2024")).toBeTruthy();
  });

  it("isOpen=false の場合はオプションが描画されない", () => {
    render(<FilterDropdown {...baseProps} />);
    // 「全て」（option）も "2024" / "2023" も非表示
    expect(screen.queryByText("2024")).toBeNull();
    expect(screen.queryByText("2023")).toBeNull();
  });

  it("isOpen=true の場合は「全て」と各オプションが描画される", () => {
    render(<FilterDropdown {...baseProps} isOpen />);
    // ボタンの「年度: 全て」と、ドロップダウン内の「全て」の両方ヒットするので
    // queryAllByText で確認
    expect(screen.queryAllByText("全て").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("2024")).toBeTruthy();
    expect(screen.getByText("2023")).toBeTruthy();
  });

  it("ボタン押下で onToggle が呼ばれる", () => {
    const onToggle = jest.fn();
    render(<FilterDropdown {...baseProps} onToggle={onToggle} />);
    fireEvent.press(screen.getByText("年度: 全て"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("オプション押下で onSelect(key) と onToggle が呼ばれる", () => {
    const onSelect = jest.fn();
    const onToggle = jest.fn();
    render(
      <FilterDropdown
        {...baseProps}
        isOpen
        onSelect={onSelect}
        onToggle={onToggle}
      />,
    );
    fireEvent.press(screen.getByText("2024"));
    expect(onSelect).toHaveBeenCalledWith("2024");
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("ドロップダウン内の「全て」押下で onSelect(undefined) が呼ばれる", () => {
    const onSelect = jest.fn();
    render(
      <FilterDropdown {...baseProps} value="2024" isOpen onSelect={onSelect} />,
    );
    // ドロップダウン内の「全て」（ボタン側のラベルは "年度: 2024"）を押下
    fireEvent.press(screen.getByText("全て"));
    expect(onSelect).toHaveBeenCalledWith(undefined);
  });
});
