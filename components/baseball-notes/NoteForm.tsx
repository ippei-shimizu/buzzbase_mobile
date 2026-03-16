import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface NoteFormProps {
  title: string;
  date: string;
  memo: string;
  isSaving: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDate: (value: string) => void;
  onChangeMemo: (value: string) => void;
  onSave: () => void;
  saveLabel: string;
}

export const NoteForm: React.FC<NoteFormProps> = ({
  title,
  date,
  memo,
  isSaving,
  onChangeTitle,
  onChangeDate,
  onChangeMemo,
  onSave,
  saveLabel,
}) => {
  const isValid = title.trim().length > 0 && date.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>タイトル</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={onChangeTitle}
        placeholder="タイトルを入力"
        placeholderTextColor="#71717A"
        maxLength={100}
      />

      <Text style={styles.label}>日付</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={onChangeDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#71717A"
        maxLength={10}
      />

      <Text style={styles.label}>メモ</Text>
      <TextInput
        style={[styles.input, styles.memoInput]}
        value={memo}
        onChangeText={onChangeMemo}
        placeholder="メモを入力"
        placeholderTextColor="#71717A"
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[
          styles.saveButton,
          (!isValid || isSaving) && styles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={!isValid || isSaving}
        activeOpacity={0.7}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>{saveLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    padding: 12,
    color: "#F4F4F4",
    fontSize: 15,
  },
  memoInput: {
    height: 200,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
