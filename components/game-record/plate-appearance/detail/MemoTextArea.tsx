import { StyleSheet, Text, TextInput as RNTextInput, View } from "react-native";

interface Props {
  label: string;
  value: string | null;
  onChange: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
}

const DEFAULT_MAX_LENGTH = 1000;

/**
 * 自己分析メモ・対戦相手メモ共通の複数行 textarea。
 * 値は store 側で空文字を null に正規化するため、上位は文字列をそのまま流すだけでよい。
 */
export function MemoTextArea({
  label,
  value,
  onChange,
  placeholder,
  maxLength = DEFAULT_MAX_LENGTH,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <RNTextInput
        style={styles.input}
        value={value ?? ""}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#71717A"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={maxLength}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 14,
    minHeight: 96,
  },
});
