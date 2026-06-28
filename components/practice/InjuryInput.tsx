import type { Injury } from "../../types/practice";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { INJURY_PARTS } from "../../constants/practice";

interface Props {
  injuries: Injury[];
  onChange: (injuries: Injury[]) => void;
}

/** 怪我・痛みの入力。部位プリセット＋任意の自由メモ（程度は持たない）。 */
export function InjuryInput({ injuries, onChange }: Props) {
  const add = () =>
    onChange([...injuries, { part: INJURY_PARTS[0], memo: "" }]);
  const update = (index: number, patch: Partial<Injury>) =>
    onChange(
      injuries.map((injury, i) =>
        i === index ? { ...injury, ...patch } : injury,
      ),
    );
  const remove = (index: number) =>
    onChange(injuries.filter((_, i) => i !== index));

  return (
    <View>
      {injuries.map((injury, index) => (
        <View key={index} style={styles.item}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.parts}
          >
            {INJURY_PARTS.map((part) => {
              const active = part === injury.part;
              return (
                <TouchableOpacity
                  key={part}
                  style={[styles.partChip, active && styles.partChipActive]}
                  onPress={() => update(index, { part })}
                >
                  <Text
                    style={[styles.partText, active && styles.partTextActive]}
                  >
                    {part}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.memoRow}>
            <TextInput
              style={styles.memoInput}
              value={injury.memo}
              onChangeText={(text) => update(index, { memo: text })}
              placeholder="軽い張り など（任意）"
              placeholderTextColor="#71717A"
            />
            <TouchableOpacity onPress={() => remove(index)}>
              <Ionicons name="close-circle" size={20} color="#71717A" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={add}>
        <Ionicons name="add" size={16} color="#d08000" />
        <Text style={styles.addText}>部位を追加</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: "#333333",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  parts: { gap: 6, marginBottom: 8 },
  partChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#424242",
  },
  partChipActive: { backgroundColor: "#d08000" },
  partText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
  partTextActive: { color: "#FFFFFF" },
  memoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  memoInput: {
    flex: 1,
    backgroundColor: "#3A3A3A",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#F4F4F4",
    fontSize: 13,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  addText: { color: "#d08000", fontSize: 14, fontWeight: "600" },
});
