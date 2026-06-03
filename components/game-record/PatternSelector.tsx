import { View } from "react-native";
import { Button } from "@components/ui/Button";

export type RecordPattern = "batting" | "pitching" | "both";

interface Props {
  onSelect: (pattern: RecordPattern) => void;
  disabled?: boolean;
}

/**
 * 試合記録のパターン分岐を選択する UI。
 * 選択結果はクライアント状態のみ（DB には保存しない）。
 */
export function PatternSelector({ onSelect, disabled }: Props) {
  return (
    <View style={{ marginBottom: 40 }}>
      <Button
        title="打撃結果のみ入力"
        onPress={() => onSelect("batting")}
        disabled={disabled}
        accessibilityRole="button"
        style={{ marginBottom: 12 }}
      />
      <Button
        title="投手結果のみ入力"
        onPress={() => onSelect("pitching")}
        disabled={disabled}
        accessibilityRole="button"
        style={{ marginBottom: 12 }}
      />
      <Button
        title="打撃・投手記録を入力"
        onPress={() => onSelect("both")}
        disabled={disabled}
        accessibilityRole="button"
      />
    </View>
  );
}
