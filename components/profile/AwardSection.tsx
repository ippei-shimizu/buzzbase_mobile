import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface AwardItem {
  id?: number;
  title: string;
}

interface Props {
  awards: AwardItem[];
  onChangeAward: (index: number, title: string) => void;
  onRemoveAward: (index: number) => void;
  onAddAward: () => void;
}

export const AwardSection = ({
  awards,
  onChangeAward,
  onRemoveAward,
  onAddAward,
}: Props) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>受賞歴</Text>

      {awards.map((award, index) => (
        <View key={award.id ?? `new-${index}`} style={styles.awardRow}>
          <TextInput
            style={styles.awardInput}
            value={award.title}
            onChangeText={(text) => onChangeAward(index, text)}
            placeholder="受賞歴を入力"
            placeholderTextColor="#71717A"
          />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemoveAward(index)}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={onAddAward}>
        <Text style={styles.addButtonText}>＋ 受賞歴を追加</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  awardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  awardInput: {
    flex: 1,
    backgroundColor: "#424242",
    borderRadius: 8,
    padding: 12,
    color: "#F4F4F4",
    fontSize: 16,
  },
  removeButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3a3a3a",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  addButton: {
    borderWidth: 1,
    borderColor: "#52525B",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#d08000",
    fontSize: 14,
    fontWeight: "600",
  },
});
