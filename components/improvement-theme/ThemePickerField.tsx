import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useImprovementThemes } from "@hooks/useImprovementThemes";

interface Props {
  selectedThemeId: number | null;
  onChange: (themeId: number | null) => void;
}

/**
 * 取組中（open）の課題テーマを紐付けるセレクタ。
 * ノート・練習セッションの保存フローで、直近の課題に記録を束ねるために使う。
 */
export function ThemePickerField({ selectedThemeId, onChange }: Props) {
  const { themes } = useImprovementThemes({ status: "open" });
  const [isOpen, setOpen] = useState(false);
  const selected = themes.find((theme) => theme.id === selectedThemeId);

  return (
    <View>
      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => setOpen((prev) => !prev)}
      >
        <Ionicons name="flag-outline" size={18} color="#d08000" />
        <Text style={styles.linkButtonText}>
          {selected ? selected.title : "取り組む課題に紐付け"}
        </Text>
        {selectedThemeId != null ? (
          <TouchableOpacity onPress={() => onChange(null)}>
            <Ionicons name="close-circle" size={18} color="#A1A1AA" />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color="#A1A1AA"
          />
        )}
      </TouchableOpacity>
      {isOpen ? (
        <View style={styles.picker}>
          {themes.length === 0 ? (
            <Text style={styles.pickerEmpty}>取組中の課題がありません</Text>
          ) : (
            themes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={styles.pickerRow}
                onPress={() => {
                  onChange(theme.id);
                  setOpen(false);
                }}
              >
                <Text style={styles.pickerText}>{theme.title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  linkButtonText: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  picker: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  pickerRow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#2E2E2E",
  },
  pickerText: { color: "#F4F4F4", fontSize: 14 },
  pickerEmpty: { color: "#A1A1AA", fontSize: 13, padding: 12 },
});
