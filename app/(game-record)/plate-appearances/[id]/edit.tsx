import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useLayoutEffect } from "react";
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
 *
 * ヘッダー左の「戻る」は編集破棄の確認ダイアログ付き。ヘッダー右にゴミ箱アイコンを
 * 出して打席削除を行う。フッターに同種ボタンを並べないのは、画面下部のキー操作と
 * 隣接して誤タップしやすいため。
 */
export default function EditPlateAppearanceScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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

  const numericId = Number(id);
  const editing = plateAppearances.find((pa) => pa.id === numericId);

  // confirmCancel / handleDelete は useLayoutEffect の setOptions コールバック内で
  // 参照される。useCallback で安定化し依存配列に明示することで stale closure を防ぐ。
  const confirmCancel = useCallback(() => {
    Alert.alert("編集を中断しますか？", "編集中の内容は破棄されます。", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "中断する",
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);
  }, [router]);

  const editingId = editing?.id;
  const editingBatterBoxNumber = editing?.batter_box_number;
  const handleDelete = useCallback(() => {
    if (editingId === undefined || effectiveGameResultId === null) return;
    Alert.alert(
      "打席の削除",
      `第${editingBatterBoxNumber}打席を削除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlateAppearance({
                id: editingId,
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
  }, [
    editingId,
    editingBatterBoxNumber,
    effectiveGameResultId,
    deletePlateAppearance,
    router,
  ]);

  // 編集対象が存在するときのみヘッダーに「戻る」「削除」アイコンを設置する。
  // PlateAppearanceWizard 側は編集モードで headerLeft/Right を触らないので、
  // ここでの setOptions が最終的な見た目になる。
  useLayoutEffect(() => {
    if (editingId === undefined) {
      navigation.setOptions({ headerLeft: undefined, headerRight: undefined });
      return;
    }
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="編集を中断する"
          onPress={confirmCancel}
          style={styles.headerLeftButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={28} color="#F4F4F4" />
          <Text style={styles.headerLeftLabel}>戻る</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="この打席を削除"
          accessibilityState={{ disabled: isDeleting }}
          onPress={handleDelete}
          disabled={isDeleting}
          style={styles.headerRightButton}
          hitSlop={8}
        >
          {isDeleting ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, editingId, isDeleting, confirmCancel, handleDelete]);

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
        gameResultId={effectiveGameResultId}
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
  headerLeftButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: 12,
    paddingVertical: 4,
    marginLeft: -8,
  },
  headerLeftLabel: {
    color: "#F4F4F4",
    fontSize: 16,
    marginLeft: -2,
  },
  headerRightButton: {
    padding: 8,
  },
});
