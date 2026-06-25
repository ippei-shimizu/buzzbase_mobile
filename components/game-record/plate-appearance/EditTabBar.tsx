import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type EditTab = "tap_and_select" | "counter" | "detail";

interface Props {
  current: EditTab;
  onChange: (tab: EditTab) => void;
  /** 各タブの「入力済み」ドット表示用フラグ。 */
  hasResult: boolean;
  hasScore: boolean;
  hasDetail: boolean;
}

const TABS: { key: EditTab; label: string }[] = [
  { key: "tap_and_select", label: "打席結果" },
  { key: "counter", label: "打点・得点" },
  { key: "detail", label: "詳細" },
];

/**
 * 編集モード時のステップ切替タブ。新規記録時は表示しない。
 * 各タブをタップで該当ステップに即座に遷移できる。
 */
export function EditTabBar({
  current,
  onChange,
  hasResult,
  hasScore,
  hasDetail,
}: Props) {
  const dots: Record<EditTab, boolean> = {
    tap_and_select: hasResult,
    counter: hasScore,
    detail: hasDetail,
  };
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active = current === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: active }}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
          >
            <View style={styles.labelRow}>
              <Text style={[styles.label, active && styles.activeLabel]}>
                {tab.label}
              </Text>
              {dots[tab.key] && <View style={styles.dot} />}
            </View>
            <View
              style={[styles.underline, active && styles.activeUnderline]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: "#2E2E2E",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
  },
  activeLabel: {
    color: "#F4F4F4",
    fontWeight: "bold",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#d08000",
  },
  underline: {
    height: 2,
    width: "100%",
    backgroundColor: "transparent",
  },
  activeUnderline: {
    backgroundColor: "#d08000",
  },
});
