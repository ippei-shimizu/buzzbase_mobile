import type { PlanMenu } from "../../types/plan";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Icon } from "@components/icon/Icon";

/**
 * 予定内の練習メニュー1行。タップで done（当日の練習ログ有無）をトグルする。
 * 「今日のやること」とカレンダー経由の予定詳細で共用する。
 * done はキャッシュの楽観的更新で即時反映されるため、通信中もアイコンをそのまま表示する
 * （isToggling は二重タップ防止の disabled にのみ使う）。
 */
export function PlanMenuRow({
  menu,
  onToggle,
  isToggling,
}: {
  menu: PlanMenu;
  onToggle: (menu: PlanMenu) => void;
  isToggling: boolean;
}) {
  const amount =
    menu.target_value != null
      ? `${menu.target_value}${menu.unit_label ?? ""}`
      : "";
  return (
    <TouchableOpacity
      style={styles.menuRow}
      onPress={() => onToggle(menu)}
      disabled={isToggling}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: menu.done, disabled: isToggling }}
    >
      <Icon
        name={menu.done ? "checkmark-circle" : "ellipse-outline"}
        size={18}
        color={menu.done ? "#4a8e32" : "#71717A"}
      />
      <Text
        style={[styles.menuName, menu.done && styles.menuNameDone]}
        numberOfLines={1}
      >
        {menu.name ?? "メニュー"}
        {amount ? `  ${amount}` : ""}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },
  menuName: { color: "#F4F4F4", fontSize: 14, flex: 1 },
  menuNameDone: { color: "#A1A1AA" },
});
