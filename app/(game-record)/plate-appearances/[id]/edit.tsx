import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useGameRecordStore } from "../../../../stores/gameRecordStore";

/**
 * 既存の打席を編集するページ。
 * 動的 `[id]` から plate_appearance.id を取得し、`usePlateAppearancesByGame` で
 * 引いた中から該当行を探して `PlateAppearanceWizard` を編集モードでマウントする。
 * 完了 / 中断時は前画面（打席一覧）に戻る。
 */
export default function EditPlateAppearanceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
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

  const numericId = Number(id);
  const editing = plateAppearances.find((pa) => pa.id === numericId);

  if (!editing) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>
          指定の打席が見つかりません。打席一覧に戻ってください。
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <PlateAppearanceWizard
        gameResultId={gameResultId}
        batterBoxNumber={editing.batter_box_number}
        editingPlateAppearance={editing}
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
