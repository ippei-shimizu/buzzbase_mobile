import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@components/icon/Icon";
import { PaywallModal } from "@components/pro/PaywallModal";
import { useEntitlement } from "@hooks/useEntitlement";
import { useImprovementThemes } from "@hooks/useImprovementThemes";

interface Props {
  selectedThemeIds: number[];
  onChange: (themeIds: number[]) => void;
}

/**
 * 取組中（open）の課題テーマを紐付けるセレクタ。
 * ノート・練習セッションの保存フローで、直近の課題に記録を束ねるために使う。
 * 無料は1件まで、Proは複数件紐付けられる。
 */
export function ThemePickerField({ selectedThemeIds, onChange }: Props) {
  const { themes } = useImprovementThemes({ status: "open" });
  const { hasEntitlement } = useEntitlement();
  const [isOpen, setOpen] = useState(false);
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const selectableThemes = themes.filter(
    (theme) => !selectedThemeIds.includes(theme.id),
  );

  const handleOpenPicker = () => {
    // 無料は1件まで。2件目以降を追加しようとしたら Pro 訴求。
    if (
      selectedThemeIds.length >= 1 &&
      !hasEntitlement("multi_improvement_theme_links")
    ) {
      setPaywallOpen(true);
      return;
    }
    setOpen((prev) => !prev);
  };

  const handleSelect = (themeId: number) => {
    onChange([...selectedThemeIds, themeId]);
    setOpen(false);
  };

  const handleRemove = (themeId: number) =>
    onChange(selectedThemeIds.filter((id) => id !== themeId));

  return (
    <View>
      {selectedThemeIds.map((themeId) => {
        const theme = themes.find((item) => item.id === themeId);
        return (
          <View key={themeId} style={styles.linkButton}>
            <Icon name="flag-outline" size={18} color="#d08000" />
            <Text style={styles.linkButtonText} numberOfLines={1}>
              {theme ? theme.title : "課題に紐付け済み"}
            </Text>
            <TouchableOpacity onPress={() => handleRemove(themeId)}>
              <Icon name="close-circle" size={18} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        );
      })}
      <TouchableOpacity style={styles.linkButton} onPress={handleOpenPicker}>
        <Icon name="flag-outline" size={18} color="#d08000" />
        <Text style={styles.linkButtonText}>
          {selectedThemeIds.length > 0
            ? "課題をもう1件追加"
            : "取り組む課題に紐付け"}
        </Text>
        <Icon
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color="#A1A1AA"
        />
      </TouchableOpacity>
      {isOpen ? (
        <View style={styles.picker}>
          {selectableThemes.length === 0 ? (
            <Text style={styles.pickerEmpty}>取組中の課題がありません</Text>
          ) : (
            selectableThemes.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={styles.pickerRow}
                onPress={() => handleSelect(theme.id)}
              >
                <Text style={styles.pickerText}>{theme.title}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : null}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="multi_improvement_theme_links"
        contextMessage="無料プランでは1つの記録に課題を1件まで紐付けられるため、追加できません。"
      />
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
