import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AddPlateAppearanceCard } from "@components/game-record/plate-appearance/AddPlateAppearanceCard";
import { PlateAppearanceCard } from "@components/game-record/plate-appearance/PlateAppearanceCard";
import { StepIndicator } from "@components/game-record/StepIndicator";
import { usePlateAppearancesByGame } from "@hooks/usePlateAppearances";
import { useGameRecordStore } from "../../../stores/gameRecordStore";

/**
 * 打席リスト画面。
 * 既存カードと並んで末尾に「第N打席 / 結果を入力」プレースホルダを常に表示し、
 * タップでウィザード（`./new`）に遷移する。右上「完了」で `recordPattern`
 * に応じて投手成績 or サマリーへ。
 *
 * 打席カードの編集起動は別 Issue（ippei-shimizu/buzzbase#335）で対応するため、
 * 本画面ではカードを TouchableOpacity だが onPress は持たない（タップ不可状態）。
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

  const handleAdd = () => router.push("/(game-record)/plate-appearances/new");

  const nextBatterBoxNumber = plateAppearances.length + 1;

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
          ListFooterComponent={
            <>
              {plateAppearances.length === 0 && (
                <Text style={styles.emptyHint}>
                  「結果を入力」ボタンをタップして、打席ごとの結果を入力してください
                </Text>
              )}
              <AddPlateAppearanceCard
                batterBoxNumber={nextBatterBoxNumber}
                onPress={handleAdd}
              />
            </>
          }
        />
      )}
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
    paddingBottom: 32,
  },
  emptyHint: {
    color: "#A1A1AA",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
    paddingHorizontal: 8,
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
});
