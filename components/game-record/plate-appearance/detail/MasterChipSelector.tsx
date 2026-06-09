import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SectionHeader } from "./SectionHeader";

interface Option {
  id: number;
  name: string;
}

interface Props {
  /** 見出しラベル（例: "打球の質"）。 */
  label: string;
  /** マスタ取得済みの選択肢。display_order 昇順で渡す。 */
  options: Option[];
  /** 現在選択中の ID。未選択は null。 */
  value: number | null;
  /** 同じ ID を再選択すると null を返す（タップで選択解除可能）。 */
  onChange: (id: number | null) => void;
  /** マスタ取得中は ActivityIndicator を表示し、チップを抑制する。 */
  isLoading?: boolean;
  /** マスタ取得失敗時は disabled 表示にし、操作を抑止する。 */
  isError?: boolean;
  /** 初めて使うユーザー向けの 1〜2 文の説明。 */
  description?: string;
}

/**
 * 打席詳細（球質・タイミング・球種）の単選択チップ群。
 * 同じチップを再タップすると未選択（null）に戻る。
 */
export function MasterChipSelector({
  label,
  options,
  value,
  onChange,
  isLoading,
  isError,
  description,
}: Props) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <SectionHeader label={label} description={description} />
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#d08000" />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <SectionHeader label={label} description={description} />
        <Text style={styles.errorText}>マスタの取得に失敗しました</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader label={label} description={description} />
      <View style={styles.chipRow}>
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${option.name}`}
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onChange(selected ? null : option.id)}
            >
              <Text
                style={[styles.chipText, selected && styles.chipTextSelected]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  loadingRow: {
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  errorText: {
    color: "#F08080",
    fontSize: 13,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
  },
  chipSelected: {
    backgroundColor: "#d08000",
    borderColor: "#d08000",
  },
  chipText: {
    color: "#F4F4F4",
    fontSize: 13,
  },
  chipTextSelected: {
    fontWeight: "bold",
  },
});
