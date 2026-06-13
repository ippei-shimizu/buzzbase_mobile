import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PlateAppearanceWizard } from "@components/game-record/plate-appearance/PlateAppearanceWizard";
import {
  useDeletePlateAppearance,
  usePlateAppearancesByGame,
} from "@hooks/usePlateAppearances";
import { useGameRecordStore } from "../../../../stores/gameRecordStore";

/**
 * 既存の打席を編集するページ。
 *
 * gameResultId の解決順:
 *   1. 試合記録ウィザード中の store (`useGameRecordStore.gameResultId`)
 *   2. URL クエリパラメータ (`?gameResultId=...`)
 *
 * 試合記録フロー中（store に値がある）と試合詳細画面経由（クエリで受ける）の
 * 両方からこのルートを再利用するため。完了 / 中断時は前画面に戻る。
 */
export default function EditPlateAppearanceScreen() {
  const router = useRouter();
  const { id, gameResultId: gameResultIdParam } = useLocalSearchParams<{
    id: string;
    gameResultId?: string;
  }>();
  const storeGameResultId = useGameRecordStore((s) => s.gameResultId);
  const queryGameResultId = gameResultIdParam
    ? Number(gameResultIdParam)
    : null;
  const effectiveGameResultId = storeGameResultId ?? queryGameResultId;
  const { plateAppearances, isLoading } = usePlateAppearancesByGame(
    effectiveGameResultId,
  );
  const { deletePlateAppearance, isDeleting } = useDeletePlateAppearance();

  if (effectiveGameResultId === null) {
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

  const handleDelete = () => {
    Alert.alert(
      "打席の削除",
      `第${editing.batter_box_number}打席を削除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlateAppearance({
                id: editing.id,
                gameResultId: effectiveGameResultId,
              });
              router.back();
            } catch {
              Alert.alert("エラー", "打席の削除に失敗しました");
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
    >
      <View style={styles.wizardWrapper}>
        <PlateAppearanceWizard
          gameResultId={effectiveGameResultId}
          batterBoxNumber={editing.batter_box_number}
          editingPlateAppearance={editing}
          onClose={() => router.back()}
        />
      </View>
      <View style={styles.footerSlot}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="編集を中断する"
          accessibilityState={{ disabled: isDeleting }}
          style={[styles.cancelButton, isDeleting && styles.buttonDisabled]}
          onPress={() => router.back()}
          disabled={isDeleting}
        >
          <Text style={styles.cancelLabel}>編集を中断する</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="この打席を削除"
          accessibilityState={{ disabled: isDeleting }}
          style={[styles.deleteButton, isDeleting && styles.buttonDisabled]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={styles.deleteLabel}>この打席を削除</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  wizardWrapper: {
    flex: 1,
  },
  footerSlot: {
    backgroundColor: "#2E2E2E",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#3A3A3A",
    gap: 8,
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
  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#A1A1AA",
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelLabel: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  deleteLabel: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
});
