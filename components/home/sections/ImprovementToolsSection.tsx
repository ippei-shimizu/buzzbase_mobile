import type { IconName } from "../../../types/icon";
import { useRouter, type Href } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@components/icon/Icon";
import { SectionCard } from "./SectionCard";

type Tool = {
  icon: IconName;
  label: string;
  description: string;
  href: Href;
};

const TOOLS: Tool[] = [
  {
    icon: "flag-outline",
    label: "取り組む課題",
    description: "課題を決めて練習を積み重ねる",
    href: "/(theme)/list",
  },
  {
    icon: "trophy-outline",
    label: "目標を立てる",
    description: "目標を決めて達成状況を追う",
    href: "/(goal)/list",
  },
  {
    icon: "trending-up",
    label: "練習と成績のつながり",
    description: "何が成績に効いているかを見る",
    href: "/(insight)/insights",
  },
  {
    icon: "sparkles-outline",
    label: "振り返りレポート",
    description: "週次・月次のまとめ",
    href: "/(review)/list",
  },
];

/**
 * 上達サイクル機能（課題・目標・練習と成績のつながり・振り返りレポート）への導線。
 */
export function ImprovementToolsSection() {
  const router = useRouter();

  return (
    <SectionCard title="上達サイクルをまわす">
      {TOOLS.map((tool, index) => (
        <TouchableOpacity
          key={tool.label}
          style={[
            styles.row,
            index > 0 && styles.rowBorder,
            index === TOOLS.length - 1 && styles.rowLast,
          ]}
          onPress={() => router.push(tool.href)}
        >
          <Icon name={tool.icon} size={20} color="#d08000" />
          <View style={styles.textWrap}>
            <Text style={styles.label}>{tool.label}</Text>
            <Text style={styles.description}>{tool.description}</Text>
          </View>
          <Icon name="chevron-forward" size={18} color="#A1A1AA" />
        </TouchableOpacity>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: "#2E2E2E" },
  // 最終行の下パディングを削り、カード下端の余白を左右（16px）と揃える。
  rowLast: { paddingBottom: 0 },
  textWrap: { flex: 1 },
  label: { color: "#F4F4F4", fontSize: 14, fontWeight: "600" },
  description: { color: "#A1A1AA", fontSize: 12, marginTop: 2 },
});
