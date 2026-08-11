import type { ReflectionTemplate } from "../../types/reflectionTemplate";
import { Ionicons as Icon } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScreen } from "@components/ui/KeyboardAwareScreen";
import {
  useReflectionTemplateMutations,
  useReflectionTemplates,
} from "@hooks/useReflectionTemplates";

export default function ReflectTemplateFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { templates, isLoading } = useReflectionTemplates();
  const editing = id
    ? templates.find((template) => template.id === Number(id))
    : undefined;

  // 編集モードでテンプレ取得待ちの間はスピナー（初期値を正しく埋めるため）。
  if (id && isLoading && !editing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  return <TemplateForm key={editing?.id ?? "new"} template={editing} />;
}

/** 作成・編集の共通フォーム。template があれば編集、なければ新規作成。 */
function TemplateForm({ template }: { template?: ReflectionTemplate }) {
  const router = useRouter();
  const { createTemplate, isCreating, updateTemplate, isUpdating } =
    useReflectionTemplateMutations();
  const [title, setTitle] = useState(template?.title ?? "");
  const [questions, setQuestions] = useState<string[]>(
    template && template.questions.length > 0
      ? template.questions
      : ["", "", ""],
  );
  const isSaving = isCreating || isUpdating;

  const setQuestion = (index: number, value: string) =>
    setQuestions((prev) => prev.map((item, i) => (i === index ? value : item)));
  const addQuestion = () => setQuestions((prev) => [...prev, ""]);
  const removeQuestion = (index: number) =>
    setQuestions((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedQuestions = questions
      .map((question) => question.trim())
      .filter((question) => question.length > 0);
    if (!trimmedTitle) {
      Alert.alert("テンプレ名を入力してください");
      return;
    }
    if (trimmedQuestions.length === 0) {
      Alert.alert("問いを1つ以上入力してください");
      return;
    }
    try {
      if (template) {
        await updateTemplate({
          id: template.id,
          input: { title: trimmedTitle, questions: trimmedQuestions },
        });
      } else {
        await createTemplate({
          title: trimmedTitle,
          questions: trimmedQuestions,
        });
      }
      router.back();
    } catch {
      Alert.alert("保存に失敗しました");
    }
  };

  return (
    <KeyboardAwareScreen>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Stack.Screen
          options={{ title: template ? "テンプレを編集" : "テンプレを作る" }}
        />
        <Text style={styles.label}>テンプレ名</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="例: 今日のフォーム意識"
          placeholderTextColor="#71717A"
        />

        <Text style={styles.label}>問い</Text>
        {questions.map((question, index) => (
          <View key={index} style={styles.questionRow}>
            <TextInput
              style={[styles.input, styles.questionInput]}
              value={question}
              onChangeText={(text) => setQuestion(index, text)}
              placeholder={`問い ${index + 1}`}
              placeholderTextColor="#71717A"
            />
            {questions.length > 1 ? (
              <TouchableOpacity onPress={() => removeQuestion(index)}>
                <Icon name="close-circle" size={20} color="#A1A1AA" />
              </TouchableOpacity>
            ) : null}
          </View>
        ))}

        <TouchableOpacity style={styles.addRow} onPress={addQuestion}>
          <Icon name="add" size={18} color="#d08000" />
          <Text style={styles.addRowText}>問いを追加</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAwareScreen>
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
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  questionInput: { flex: 1 },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
  },
  addRowText: { color: "#d08000", fontSize: 14, fontWeight: "600" },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});
