import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PlateAppearanceWizard } from "@components/game-record/plate-appearance/PlateAppearanceWizard";
import { usePlateAppearancesByGame } from "@hooks/usePlateAppearances";
import { useGameRecordStore } from "../../../stores/gameRecordStore";

/**
 * 新規打席ウィザードのエントリーページ。
 * 既存リスト件数を取得して `batter_box_number = 件数 + 1` で採番する。
 * 完了 / 中断時はリスト画面に戻る。
 */
export default function NewPlateAppearanceScreen() {
  const router = useRouter();
  const gameResultId = useGameRecordStore((s) => s.gameResultId);
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

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  const nextBatterBoxNumber = plateAppearances.length + 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <PlateAppearanceWizard
        gameResultId={gameResultId}
        batterBoxNumber={nextBatterBoxNumber}
        onClose={() => router.back()}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
    padding: 24,
  },
  errorText: {
    color: "#F4F4F4",
    fontSize: 14,
    textAlign: "center",
  },
});
