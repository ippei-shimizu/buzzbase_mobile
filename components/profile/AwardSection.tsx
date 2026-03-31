import { Ionicons } from "@expo/vector-icons";
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
      <Text style={styles.sectionSubtitle}>
        受賞（チーム成績・個人タイトル）
      </Text>

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
            <Ionicons name="close-circle" size={22} color="#71717A" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={onAddAward}>
        <Ionicons name="add-circle" size={28} color="#d08000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "#A1A1AA",
    fontSize: 13,
    marginBottom: 12,
  },
  awardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  awardInput: {
    flex: 1,
    backgroundColor: "#424242",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: "#F4F4F4",
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 10,
    padding: 2,
  },
  addButton: {
    alignItems: "flex-end",
    marginTop: 4,
  },
});
