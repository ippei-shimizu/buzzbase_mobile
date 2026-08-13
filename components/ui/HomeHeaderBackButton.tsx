import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Icon } from "@components/icon/Icon";

/**
 * ヘッダー左の「ホームへ戻る」ボタン。
 *
 * 一覧画面はホーム・記録詳細・通知など複数の導線から開かれ、直前の画面へ戻すと
 * どこへ戻るか予測できないため、戻り先をホームに固定する。
 * `replace`だとpush扱いになり戻るアニメーションが逆向きになるため、
 * スタック内のホームまでpopする`dismissTo`を使う。
 */
export function HomeHeaderBackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.dismissTo("/(tabs)")}
      style={{ padding: 8 }}
      accessibilityRole="button"
      accessibilityLabel="ホームに戻る"
    >
      <Icon name="chevron-back" size={24} color="#F4F4F4" />
    </TouchableOpacity>
  );
}
