import type { ActivityLog } from "../../types/activity";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePracticeSessionByDate } from "@hooks/usePracticeSessions";
import { formatJaFullDateWithWeekday } from "@utils/formatDate";

interface DayDetailModalProps {
  /** 表示する日付。nullなら非表示。 */
  date: string | null;
  /** ホーム・詳細画面側で既に取得済みのその日の集計（試合有無・素振り本数の判定に使う）。 */
  activityLog: ActivityLog | null;
  onClose: () => void;
}

/**
 * 草ヒートマップの日付タップ詳細（F-06）。
 * その日の練習内容一覧を表示し、練習記録画面（日次セッション）への編集導線を提供する。
 */
export function DayDetailModal({
  date,
  activityLog,
  onClose,
}: DayDetailModalProps) {
  const router = useRouter();
  const { session, isLoading } = usePracticeSessionByDate(date);

  const goEdit = () => {
    if (!date) return;
    onClose();
    router.push({ pathname: "/(practice-record)/daily", params: { date } });
  };

  const items = (session?.practice_logs ?? []).map(
    (log) => `${log.menu_name} ${log.amount ?? ""}${log.unit_label ?? ""}`,
  );
  if (activityLog?.has_game) items.push("試合を実施");

  return (
    <Modal
      visible={date != null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="モーダルを閉じる"
      >
        <Pressable
          style={styles.card}
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
        >
          <Text style={styles.title}>
            {date ? formatJaFullDateWithWeekday(date) : ""}
          </Text>

          {isLoading ? (
            <ActivityIndicator color="#d08000" style={styles.loading} />
          ) : items.length > 0 ? (
            <View style={styles.list}>
              {items.map((item, index) => (
                <Text key={index} style={styles.item}>
                  {item}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.empty}>この日の記録はありません</Text>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.button, styles.secondaryButton]}
              accessibilityRole="button"
              accessibilityLabel="閉じる"
            >
              <Text style={styles.secondaryButtonText}>閉じる</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goEdit}
              style={[styles.button, styles.primaryButton]}
              accessibilityRole="button"
              accessibilityLabel="この日の練習を編集"
            >
              <Text style={styles.primaryButtonText}>この日の練習を編集</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  loading: { marginVertical: 12 },
  list: { gap: 8, marginBottom: 8 },
  item: { color: "#F4F4F4", fontSize: 14 },
  empty: { color: "#A1A1AA", fontSize: 14, marginBottom: 8 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 72,
    alignItems: "center",
  },
  primaryButton: { backgroundColor: "#d08000" },
  primaryButtonText: { color: "#F4F4F4", fontSize: 14, fontWeight: "700" },
  secondaryButton: { backgroundColor: "transparent" },
  secondaryButtonText: { color: "#F4F4F4", fontSize: 14, fontWeight: "500" },
});
