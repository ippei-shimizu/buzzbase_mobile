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
import { Button } from "@components/ui/Button";
import { usePlateAppearancesByGame } from "@hooks/usePlateAppearances";
import { useGameRecordStore } from "../../../stores/gameRecordStore";

/**
 * 打席リスト画面。
 * - リスト末尾の「第N打席 / 結果を入力」プレースホルダタップ → `./new` で新規入力ウィザード
 * - 既存打席カードタップ → `./[id]/edit` で同じウィザードを編集モードで起動
 * - 画面下部の primary ボタンで `recordPattern` に応じて投手成績 or サマリーへ進む
 */
export default function PlateAppearancesListScreen() {
  const router = useRouter();
  const gameResultId = useGameRecordStore((s) => s.gameResultId);
  const recordPattern = useGameRecordStore((s) => s.recordPattern);
  const isEditMode = useGameRecordStore((s) => s.isEditMode);
  const pitchingResultId = useGameRecordStore((s) => s.pitchingResultId);
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

  // 編集モードでは投手成績の有無に関わらず Step3 にアクセスできる動線を出し、
  // 「投手成績を追加 / 編集」と「打席編集だけで完了」のどちらも選べるようにする。
  // 新規記録時は従来通り「両方」パターンのときだけ投手成績入力へ進む単一ボタン。
  const isPitchingNext = isEditMode ? true : recordPattern === "both";
  const finishButtonLabel = (() => {
    if (isEditMode) {
      return pitchingResultId !== null ? "投手成績編集へ" : "投手成績を追加";
    }
    return isPitchingNext ? "投手成績入力へ" : "試合結果まとめへ";
  })();

  const handleFinish = () => {
    if (isPitchingNext) {
      router.push("/(game-record)/step3-pitching");
    } else {
      router.replace("/(game-record)/summary");
    }
  };

  const handleCompleteEdit = () => router.replace("/(game-record)/summary");

  const handleAdd = () => router.push("/(game-record)/plate-appearances/new");

  // 打席削除後は length と batter_box_number がずれるため、最大値 + 1 で採番して重複を防ぐ。
  const nextBatterBoxNumber =
    plateAppearances.length > 0
      ? Math.max(...plateAppearances.map((pa) => pa.batter_box_number)) + 1
      : 1;

  return (
    <View style={styles.container}>
      <StepIndicator currentStep={2} />
      <Text style={styles.heading}>打席一覧</Text>

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
            <PlateAppearanceCard
              plateAppearance={item}
              onPress={() =>
                router.push({
                  pathname: "/(game-record)/plate-appearances/[id]/edit",
                  params: { id: String(item.id) },
                })
              }
            />
          )}
          ListFooterComponent={
            <>
              {plateAppearances.length === 0 && (
                <Text style={styles.emptyHint}>
                  「結果を入力」ボタンをタップして、{"\n"}
                  打席ごとの結果を入力してください
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

      <View style={styles.footer}>
        <Button
          title={finishButtonLabel}
          onPress={handleFinish}
          // 編集モードでは打席 0 件でも投手成績の追加・編集動線に進めるようにする。
          disabled={!isEditMode && plateAppearances.length === 0}
        />
        {isEditMode && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="編集を完了する"
            onPress={handleCompleteEdit}
            style={styles.completeEditButton}
          >
            <Text style={styles.completeEditLabel}>編集を完了する</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  heading: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
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
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#3a3a3a",
    backgroundColor: "#2E2E2E",
    gap: 8,
  },
  completeEditButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  completeEditLabel: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
});
