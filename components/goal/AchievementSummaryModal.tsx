import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon } from "@components/icon/Icon";
import { useAchievementSummarySeen } from "@hooks/useAchievementSummarySeen";
import { useGoalBadges, useGoalHistory } from "@hooks/useGoals";
import {
  formatMonthKeyJa,
  isDateInMonth,
  previousMonthKey,
} from "@utils/achievementSummary";

/**
 * 月末に確定した目標の達成サマリーをアプリ起動時に一度だけモーダル表示する。
 * サーバーpushは使わず、端末内フラグ(SecureStore)で月ごとの表示済みを管理する。
 */
export function AchievementSummaryModal() {
  const router = useRouter();
  const { goals: history, isLoading: isHistoryLoading } = useGoalHistory();
  const { badges, isLoading: isBadgesLoading } = useGoalBadges();
  const { getLastShownPeriod, markPeriodShown } = useAchievementSummarySeen();
  const [period, setPeriod] = useState<string | null>(null);

  useEffect(() => {
    if (isHistoryLoading || isBadgesLoading) return;

    const targetPeriod = previousMonthKey();
    const finalizedInPeriod = history.filter((goal) =>
      isDateInMonth(goal.deadline, targetPeriod),
    );
    if (finalizedInPeriod.length === 0) return;

    let ignore = false;
    getLastShownPeriod().then((lastShown) => {
      if (ignore || lastShown === targetPeriod) return;
      setPeriod(targetPeriod);
    });
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 初回のisLoading完了時のみ判定すればよい
  }, [isHistoryLoading, isBadgesLoading]);

  if (!period) return null;

  const finalizedInPeriod = history.filter((goal) =>
    isDateInMonth(goal.deadline, period),
  );
  const achievedCount = finalizedInPeriod.filter(
    (goal) => goal.is_achieved,
  ).length;
  const badgesInPeriod = badges.filter((badge) =>
    isDateInMonth(badge.awarded_at, period),
  );

  const handleClose = () => {
    void markPeriodShown(period);
    setPeriod(null);
  };

  const handleViewBadges = () => {
    handleClose();
    router.push("/(goal)/badges");
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleClose}
        accessibilityLabel="モーダルを閉じる"
      >
        <Pressable
          style={styles.card}
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal
        >
          <Icon name="trophy" size={40} color="#FFD43B" />
          <Text style={styles.title}>{formatMonthKeyJa(period)}の振り返り</Text>
          <Text style={styles.summary}>
            期限を迎えた目標 {finalizedInPeriod.length}件中{" "}
            <Text style={styles.summaryEmphasis}>{achievedCount}件達成</Text>
          </Text>
          {badgesInPeriod.length > 0 ? (
            <Text style={styles.badgeNote}>
              新しいバッジを{badgesInPeriod.length}個獲得しました
            </Text>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.button, styles.secondaryButton]}
              accessibilityRole="button"
              accessibilityLabel="閉じる"
            >
              <Text style={styles.secondaryButtonText}>閉じる</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleViewBadges}
              style={[styles.button, styles.primaryButton]}
              accessibilityRole="button"
              accessibilityLabel="バッジを見る"
            >
              <Text style={styles.primaryButtonText}>バッジを見る</Text>
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
    maxWidth: 380,
    backgroundColor: "#2E2E2E",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#F4F4F4",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  summary: {
    color: "#D4D4D4",
    fontSize: 14,
    textAlign: "center",
  },
  summaryEmphasis: {
    color: "#FFD43B",
    fontWeight: "700",
  },
  badgeNote: {
    color: "#A1A1AA",
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#d08000",
  },
  primaryButtonText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#424242",
  },
  secondaryButtonText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "500",
  },
});
