import type { ReflectionTemplate } from "../../types/reflectionTemplate";
import { Ionicons } from "@expo/vector-icons";
import { isAxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PaywallModal } from "@components/pro/PaywallModal";
import { useEntitlement } from "@hooks/useEntitlement";
import {
  useReflectionTemplateMutations,
  useReflectionTemplates,
} from "@hooks/useReflectionTemplates";

export default function ReflectTemplateListScreen() {
  const router = useRouter();
  const { templates, isLoading } = useReflectionTemplates();
  const { deleteTemplate } = useReflectionTemplateMutations();
  const { hasEntitlement } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  const presets = templates.filter((template) => template.is_preset);
  const custom = templates.filter((template) => !template.is_preset);

  const handleAdd = () => {
    // 無料は自作1つまで。2つ目は Pro 訴求。
    if (
      !hasEntitlement("unlimited_reflection_templates") &&
      custom.length >= 1
    ) {
      setPaywallOpen(true);
      return;
    }
    router.push("/(reflect-template)/new");
  };

  const handleDelete = (template: ReflectionTemplate) => {
    Alert.alert("このテンプレを削除しますか？", template.title, [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTemplate(template.id);
          } catch (error) {
            // ノートで使用中は 422 でサーバーが理由を返す。それを見せる。
            const message =
              isAxiosError(error) && error.response?.data?.error
                ? error.response.data.error
                : "削除に失敗しました";
            Alert.alert(message);
          }
        },
      },
    ]);
  };

  const handleEdit = (template: ReflectionTemplate) =>
    router.push({
      pathname: "/(reflect-template)/new",
      params: { id: String(template.id) },
    });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>プリセット</Text>
        {presets.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.card}
            activeOpacity={0.6}
            accessibilityRole="button"
            onPress={() => handleEdit(template)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{template.title}</Text>
              <Ionicons name="pencil" size={16} color="#A1A1AA" />
            </View>
            <Text style={styles.cardQuestions}>
              {template.questions.join("・")}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, styles.customTitle]}>
          自作テンプレ
        </Text>
        {custom.length === 0 ? (
          <Text style={styles.emptyText}>
            自分専用の問いかけを作れます（無料は1つまで）。
          </Text>
        ) : (
          custom.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.card}
              activeOpacity={0.6}
              accessibilityRole="button"
              onPress={() => handleEdit(template)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{template.title}</Text>
                <Ionicons name="pencil" size={16} color="#A1A1AA" />
                <TouchableOpacity
                  onPress={() => handleDelete(template)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={18} color="#A1A1AA" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardQuestions}>
                {template.questions.join("・")}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={20} color="#F4F4F4" />
          <Text style={styles.addButtonText}>テンプレを作る</Text>
        </TouchableOpacity>
      </ScrollView>

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setPaywallOpen(false)}
        feature="unlimited_reflection_templates"
        contextMessage="無料プランで作成できる振り返りテンプレは1件までのため、追加できません。"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2E2E2E" },
  centered: {
    flex: 1,
    backgroundColor: "#2E2E2E",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
  },
  customTitle: { marginTop: 28 },
  card: {
    backgroundColor: "#3A3A3A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { color: "#F4F4F4", fontSize: 15, fontWeight: "700", flex: 1 },
  cardQuestions: {
    color: "#A1A1AA",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 19,
  },
  emptyText: { color: "#A1A1AA", fontSize: 13, marginBottom: 12 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 4,
  },
  addButtonText: { color: "#F4F4F4", fontSize: 15, fontWeight: "700" },
});
