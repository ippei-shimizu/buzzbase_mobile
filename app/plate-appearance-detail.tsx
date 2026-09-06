import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PlateAppearanceDetailView } from "@components/plate-appearance-detail/PlateAppearanceDetailView";
import { usePlateAppearance } from "@hooks/usePlateAppearances";
import { useProfile } from "@hooks/useProfile";
import { isMutualFollowRequiredError } from "@utils/axiosError";

/**
 * 打席詳細画面（閲覧専用）。
 * GameResultDetail は 5 画面から使われるため、どのスタックからも push できる
 * root 直下ルートに置く。gameResultId が既知なら list キャッシュから即描画する。
 */
export default function PlateAppearanceDetailScreen() {
  const router = useRouter();
  const { id, gameResultId } = useLocalSearchParams<{
    id: string;
    gameResultId?: string;
  }>();
  const numericId = id ? Number(id) : null;
  const numericGameResultId = gameResultId ? Number(gameResultId) : undefined;

  const { profile } = useProfile();
  const { plateAppearance, isLoading, isError, error } = usePlateAppearance(
    numericId,
    numericGameResultId,
    profile?.id ?? null,
  );

  const handleEditPress = () => {
    if (!plateAppearance) return;
    router.push({
      pathname: "/(game-record)/plate-appearances/[id]/edit",
      params: {
        id: String(plateAppearance.id),
        gameResultId: String(plateAppearance.game_result_id),
      },
    });
  };

  // 試合詳細のキャッシュ（initialData）が残っていても詳細を見せないため、
  // ローディング・データ有無より先に判定する。
  if (isMutualFollowRequiredError(error)) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>
          相互フォローのユーザーのみ打席詳細を閲覧できます
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color="#d08000" />
      </View>
    );
  }

  if (isError || !plateAppearance) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>打席データの取得に失敗しました</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <PlateAppearanceDetailView
        plateAppearance={plateAppearance}
        currentUserId={profile?.id ?? null}
        onEditPress={handleEditPress}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2E2E2E",
  },
  errorText: {
    color: "#A1A1AA",
    fontSize: 14,
  },
});
