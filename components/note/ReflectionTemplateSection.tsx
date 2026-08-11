import type { ReflectionTemplate } from "../../types/reflectionTemplate";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useReflectionTemplates } from "@hooks/useReflectionTemplates";

interface Props {
  selectedTemplateId: number | null;
  answers: Record<string, string>;
  onSelectTemplate: (template: ReflectionTemplate | null) => void;
  onChangeAnswer: (question: string, answer: string) => void;
  /** 編集時など、テンプレ選択を固定して問いだけ編集させる（切替による回答消失を防ぐ）。 */
  locked?: boolean;
}

/**
 * 振り返りテンプレの選択と、選択テンプレの問い→回答入力欄。
 * 空欄の自由メモより「何を書くか」を問いで示し、内省の質を上げる。
 * locked 時はテンプレ選択チップを出さず、このノートの回答（問い）だけを編集させる。
 */
export function ReflectionTemplateSection({
  selectedTemplateId,
  answers,
  onSelectTemplate,
  onChangeAnswer,
  locked = false,
}: Props) {
  const { templates, isLoading } = useReflectionTemplates();
  const selected = templates.find((item) => item.id === selectedTemplateId);

  if (isLoading) return null;

  // locked（編集）はテンプレが削除/更新済みでも復元できるようノートの回答から問いを出す。
  // 未 locked（新規）は選択テンプレの全問を出す。
  const questions = locked ? Object.keys(answers) : (selected?.questions ?? []);

  if (locked && questions.length === 0) return null;

  return (
    <View>
      {locked ? (
        <Text style={styles.label}>
          振り返り{selected ? `（${selected.title}）` : ""}
        </Text>
      ) : (
        <>
          <Text style={styles.label}>振り返りテンプレ（任意）</Text>
          <View style={styles.chips}>
            <TouchableOpacity
              style={[
                styles.chip,
                selectedTemplateId === null && styles.chipActive,
              ]}
              onPress={() => onSelectTemplate(null)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedTemplateId === null && styles.chipTextActive,
                ]}
              >
                なし
              </Text>
            </TouchableOpacity>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.chip,
                  selectedTemplateId === template.id && styles.chipActive,
                ]}
                onPress={() => onSelectTemplate(template)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedTemplateId === template.id && styles.chipTextActive,
                  ]}
                >
                  {template.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {questions.map((question) => (
        <View key={question} style={styles.questionBlock}>
          <Text style={styles.question}>{question}</Text>
          <TextInput
            style={styles.answerInput}
            value={answers[question] ?? ""}
            onChangeText={(text) => onChangeAnswer(question, text)}
            multiline
            placeholder="ここに書く"
            placeholderTextColor="#71717A"
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#3A3A3A",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: "#d08000" },
  chipText: { color: "#F4F4F4", fontSize: 13 },
  chipTextActive: { color: "#F4F4F4", fontWeight: "700" },
  questionBlock: { marginTop: 12 },
  question: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  answerInput: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: "top",
  },
});
