import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SectionCard } from "./SectionCard";

type Tool = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  href: Href;
};

const TOOLS: Tool[] = [
  {
    icon: "flag-outline",
    label: "取り組む課題",
    description: "課題を決めて練習を束ねる",
    href: "/(theme)/list",
  },
  {
    icon: "trending-up",
    label: "相関インサイト",
    description: "練習と成績の傾向を見る",
    href: "/(insight)/insights",
  },
  {
    icon: "document-text-outline",
    label: "振り返りテンプレ",
    description: "問いかけで振り返る",
    href: "/(reflect-template)/list",
  },
  {
    icon: "sparkles-outline",
    label: "振り返りレポート",
    description: "週次・月次のまとめ",
    href: "/(review)/list",
  },
];

/**
 * 上達ループ機能（課題・相関インサイト・振り返りテンプレ・レポート）への導線。
 */
export function ImprovementToolsSection() {
  const router = useRouter();

  return (
    <SectionCard title="上達を深める">
      {TOOLS.map((tool, index) => (
        <TouchableOpacity
          key={tool.label}
          style={[styles.row, index > 0 && styles.rowBorder]}
          onPress={() => router.push(tool.href)}
        >
          <Ionicons name={tool.icon} size={20} color="#d08000" />
          <View style={styles.textWrap}>
            <Text style={styles.label}>{tool.label}</Text>
            <Text style={styles.description}>{tool.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#A1A1AA" />
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
  textWrap: { flex: 1 },
  label: { color: "#F4F4F4", fontSize: 14, fontWeight: "600" },
  description: { color: "#A1A1AA", fontSize: 12, marginTop: 2 },
});
