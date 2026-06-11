import type { Pitcher } from "../../../../types/pitcher";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePitchers } from "@hooks/usePitchers";
import { PitcherFormModal } from "./PitcherFormModal";
import { SectionHeader } from "./SectionHeader";

interface Props {
  /** 選択中の投手 ID。null は未選択。 */
  value: number | null;
  onChange: (pitcherId: number | null) => void;
  description?: string;
}

const THROW_HAND_LABELS: Record<string, string> = {
  right: "右投げ",
  left: "左投げ",
};

/**
 * 相手投手の選択 UI。
 * 「投手を選択」ボタンタップで投手一覧モーダルを開き、検索 + 新規追加に対応する。
 * 投手マスタは current_user 固有のため、自分が追加した投手のみ表示される。
 */
export function PitcherSelector({ value, onChange, description }: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { pitchers, isLoading } = usePitchers({ q: searchQuery || undefined });

  const selectedPitcher = pitchers.find((pitcher) => pitcher.id === value);

  const handleSelect = (pitcher: Pitcher) => {
    onChange(pitcher.id);
    setPickerVisible(false);
  };

  const handleCreated = (pitcherId: number) => {
    onChange(pitcherId);
    setFormVisible(false);
    setPickerVisible(false);
  };

  // iOS では Modal の dismiss アニメーション中に別の Modal を visible にしても
  // 表示されない。先に選択モーダルを閉じ、アニメーション完了後に登録モーダルを開く。
  const openCreateForm = () => {
    setPickerVisible(false);
    setTimeout(() => setFormVisible(true), 350);
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setTimeout(() => setPickerVisible(true), 350);
  };

  return (
    <View style={styles.container}>
      <SectionHeader label="相手投手" description={description} />
      <View style={styles.selectorRow}>
        <View style={styles.selectedBox}>
          {selectedPitcher ? (
            <View>
              <Text style={styles.selectedName}>{selectedPitcher.name}</Text>
              <Text style={styles.selectedSub}>
                {formatSummary(selectedPitcher)}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>投手未選択</Text>
          )}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="投手を選択"
          style={styles.pickerButton}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={styles.pickerLabel}>選択</Text>
        </TouchableOpacity>
        {value !== null && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="投手の選択を解除"
            style={styles.clearButton}
            onPress={() => onChange(null)}
            hitSlop={6}
          >
            <Ionicons name="close-circle" size={22} color="#A1A1AA" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.note}>自分が追加した投手だけ表示されます</Text>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setPickerVisible(false)}
          accessible={false}
        >
          <Pressable
            style={styles.sheet}
            onPress={(event) => event.stopPropagation()}
            accessible={false}
          >
            <Text style={styles.title}>相手投手を選択</Text>
            <RNTextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="投手名で検索"
              placeholderTextColor="#71717A"
              accessibilityLabel="投手名検索"
            />
            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listBody}
            >
              {isLoading ? (
                <ActivityIndicator color="#d08000" style={styles.loading} />
              ) : pitchers.length === 0 ? (
                <Text style={styles.empty}>
                  {searchQuery
                    ? "該当する投手が見つかりません"
                    : "投手がまだ登録されていません"}
                </Text>
              ) : (
                pitchers.map((pitcher) => (
                  <TouchableOpacity
                    key={pitcher.id}
                    accessibilityRole="button"
                    accessibilityLabel={`投手 ${pitcher.name} を選択`}
                    style={styles.option}
                    onPress={() => handleSelect(pitcher)}
                  >
                    <Text style={styles.optionName}>{pitcher.name}</Text>
                    <Text style={styles.optionSub}>
                      {formatSummary(pitcher)}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="投手選択を閉じる"
                style={styles.modalCancel}
                onPress={() => setPickerVisible(false)}
              >
                <Text style={styles.modalCancelLabel}>閉じる</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="新しい投手を追加"
                style={styles.addButton}
                onPress={openCreateForm}
              >
                <Ionicons name="add" size={16} color="#F4F4F4" />
                <Text style={styles.addLabel}>新規追加</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <PitcherFormModal
        visible={formVisible}
        onCreated={handleCreated}
        onCancel={handleFormCancel}
      />
    </View>
  );
}

function formatSummary(pitcher: Pitcher): string {
  const parts: string[] = [];
  if (pitcher.throw_hand) {
    parts.push(THROW_HAND_LABELS[pitcher.throw_hand] ?? pitcher.throw_hand);
  }
  if (pitcher.arm_angle?.name) parts.push(pitcher.arm_angle.name);
  if (pitcher.velocity_zone?.name) parts.push(pitcher.velocity_zone.name);
  if (pitcher.pitcher_style?.name) parts.push(pitcher.pitcher_style.name);
  return parts.length === 0 ? "未設定" : parts.join(" / ");
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedBox: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedName: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectedSub: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
  },
  placeholder: {
    color: "#71717A",
    fontSize: 14,
  },
  pickerButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#d08000",
  },
  pickerLabel: {
    color: "#d08000",
    fontSize: 13,
    fontWeight: "bold",
  },
  clearButton: {
    padding: 4,
  },
  note: {
    color: "#71717A",
    fontSize: 11,
    marginTop: 6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sheet: {
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  searchInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    backgroundColor: "#424242",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F4F4F4",
    fontSize: 14,
    marginBottom: 12,
  },
  list: {
    maxHeight: 320,
  },
  listBody: {
    paddingBottom: 4,
  },
  loading: {
    paddingVertical: 24,
  },
  empty: {
    color: "#A1A1AA",
    fontSize: 13,
    paddingVertical: 24,
    textAlign: "center",
  },
  option: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#52525B",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  optionName: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
  },
  optionSub: {
    color: "#A1A1AA",
    fontSize: 12,
    marginTop: 2,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalCancel: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#52525B",
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelLabel: {
    color: "#A1A1AA",
    fontSize: 14,
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#d08000",
    borderRadius: 8,
    paddingVertical: 12,
  },
  addLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
  },
});
