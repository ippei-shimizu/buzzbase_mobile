import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PlateAppearanceCard } from "@components/game-record/plate-appearance/PlateAppearanceCard";
import { StepIndicator } from "@components/game-record/StepIndicator";
import { usePlateAppearancesByGame } from "@hooks/usePlateAppearances";
import { useGameRecordStore } from "../../../stores/gameRecordStore";

/**
 * 打席リスト画面。
 * 「+ 打席を追加」でウィザード（`./new`）に遷移し、右上「完了」で
 * `recordPattern` に応じて投手成績 or サマリーに進む。
 *
 * 編集モード／打席カードの編集起動は別 Issue（ippei-shimizu/buzzbase#335）で対応するため、
 * 本画面ではカードを TouchableOpacity だが onPress は持たない（タップ不可状態）にしておく。
 */
export default function PlateAppearancesListScreen() {
  const router = useRouter();
  const gameResultId = useGameRecordStore((s) => s.gameResultId);
  const recordPattern = useGameRecordStore((s) => s.recordPattern);
  const { plateAppearances, isLoading } =
    usePlateAppearancesByGame(gameResultId);

  if (gameResultId === null) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>
          試合情報が見つかりません。試合記録を最初からやり直してください。
        </Text>
      </View>
    );
  }

  const handleFinish = () => {
    if (recordPattern === "both") {
      router.push("/(game-record)/step3-pitching");
    } else {
      router.replace("/(game-record)/summary");
    }
  };

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={2} />
      <View style={styles.headerActions}>
        <Text style={styles.heading}>打席一覧</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="打席記録を完了する"
          onPress={handleFinish}
          style={styles.completeButton}
          disabled={plateAppearances.length === 0}
        >
          <Text
            style={[
              styles.completeLabel,
              plateAppearances.length === 0 && styles.completeLabelDisabled,
            ]}
          >
            完了
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#d08000" />
        </View>
      ) : (
        <FlatList
          data={plateAppearances}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <PlateAppearanceCard plateAppearance={item} />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              まだ打席が記録されていません。{"\n"}
              「+ 打席を追加」から記録してください。
            </Text>
          }
        />
      )}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="打席を追加"
        style={styles.addButton}
        onPress={() => router.push("/(game-record)/plate-appearances/new")}
      >
        <Ionicons name="add" size={20} color="#F4F4F4" />
        <Text style={styles.addLabel}>打席を追加</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heading: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
  },
  completeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  completeLabel: {
    color: "#d08000",
    fontSize: 15,
    fontWeight: "bold",
  },
  completeLabelDisabled: {
    color: "#52525B",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 80,
  },
  emptyText: {
    color: "#A1A1AA",
    fontSize: 13,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 20,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    color: "#F4F4F4",
    fontSize: 14,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    backgroundColor: "#d08000",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addLabel: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "bold",
  },
});
