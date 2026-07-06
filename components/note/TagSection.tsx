import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTags, useTagMutations } from "@hooks/useTags";

interface Props {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

/**
 * ノートのタグ選択。プリセット＋自作タグをトグルチップで複数選択でき、
 * 未登録の名前は入力欄からその場で作成して選択に加える（ハイブリッド）。
 */
export function TagSection({ selectedIds, onChange }: Props) {
  const { tags, isLoading } = useTags();
  const { createTag, isCreating } = useTagMutations();
  const [newTag, setNewTag] = useState("");

  if (isLoading) return null;

  const toggle = (id: number) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selected) => selected !== id)
        : [...selectedIds, id],
    );
  };

  const handleAdd = async () => {
    const name = newTag.trim();
    if (!name || isCreating) return;
    // 同名が既にあれば作成せず選択に加えるだけ。
    const existing = tags.find((tag) => tag.name === name);
    if (existing) {
      if (!selectedIds.includes(existing.id)) {
        onChange([...selectedIds, existing.id]);
      }
      setNewTag("");
      return;
    }
    try {
      const created = await createTag({ name });
      onChange([...selectedIds, created.id]);
      setNewTag("");
    } catch {
      // サーバー側の重複(422)等は握りつぶし、入力はそのまま残す。
    }
  };

  const canAdd = newTag.trim().length > 0 && !isCreating;

  return (
    <View>
      <Text style={styles.label}>タグ（任意・複数選択可）</Text>
      <View style={styles.chips}>
        {tags.map((tag) => {
          const active = selectedIds.includes(tag.id);
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggle(tag.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {tag.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.addRow}>
        <TextInput
          style={styles.addInput}
          value={newTag}
          onChangeText={setNewTag}
          placeholder="新しいタグを追加"
          placeholderTextColor="#71717A"
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          maxLength={20}
        />
        <TouchableOpacity
          style={[styles.addButton, !canAdd && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={!canAdd}
        >
          <Text style={styles.addButtonText}>追加</Text>
        </TouchableOpacity>
      </View>
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
  addRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  addInput: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 15,
  },
  addButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addButtonDisabled: { opacity: 0.5 },
  addButtonText: { color: "#F4F4F4", fontSize: 14, fontWeight: "700" },
});
