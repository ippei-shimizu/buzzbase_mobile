import { useMemo } from "react";
import { SearchablePicker } from "@components/ui/SearchablePicker";
import { useCreateStadium, useStadiumSearch } from "@hooks/useStadiums";

interface Props {
  stadiumId: number | null;
  stadiumName: string;
  prefectureId?: number;
  /**
   * 球場が選択（または新規追加）された時のコールバック。
   * `id` が null の場合はクリア or 作成失敗時のフォールバック。
   */
  onSelect: (stadium: { id: number | null; name: string }) => void;
}

/**
 * 球場マスタの検索 + 任意で新規追加できる入力 UI。
 * SearchablePicker をラップして球場用のラベルと API 連携を提供する。
 */
export function StadiumSelect({
  stadiumId: _stadiumId,
  stadiumName,
  prefectureId,
  onSelect,
}: Props) {
  // 初期表示時に全件取得し、SearchablePicker のローカルフィルタに任せる。
  // 球場マスタが大量化したらサーバー側検索に切り替える（後続Issue）。
  const { stadiums, isLoading } = useStadiumSearch("", prefectureId);
  const { createStadium, isCreating } = useCreateStadium();

  const items = useMemo(
    () =>
      stadiums.map((stadium) => ({ label: stadium.name, value: stadium.id })),
    [stadiums],
  );

  const handleSelect = (value: string | number, label: string) => {
    const id = typeof value === "number" ? value : Number(value);
    onSelect({ id, name: label });
  };

  const handleCustomInput = async (text: string) => {
    if (!text) {
      onSelect({ id: null, name: "" });
      return;
    }
    try {
      const created = await createStadium({
        name: text,
        prefecture_id: prefectureId,
      });
      onSelect({ id: created.id, name: created.name });
    } catch {
      // 作成失敗（同名・同県の一意性違反など）。name のみセットして
      // 親の Step1 submit 時に Stadium.create 経由で再試行 or エラー表示する。
      onSelect({ id: null, name: text });
    }
  };

  const placeholder =
    isLoading || isCreating ? "読み込み中..." : "球場を検索または追加";

  return (
    <SearchablePicker
      label="球場（任意）"
      items={items}
      value={stadiumName}
      onSelect={handleSelect}
      onCustomInput={handleCustomInput}
      placeholder={placeholder}
      searchInputPlaceholder="球場名を入力"
      emptyMessageText="該当する球場がありません。入力して新規追加できます"
    />
  );
}
