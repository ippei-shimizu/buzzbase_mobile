import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StoreGuideContent {
  description: string;
  steps: string[];
  url: string;
  openLabel: string;
  /** 「設定アプリを開く」ボタンの表示テキスト。 */
  buttonLabel: string;
}

// ストア課金の解約はアプリ内で完結できないため、それぞれの管理画面へ誘導する。
const STORE_GUIDE: Record<"ios" | "android", StoreGuideContent> = {
  ios: {
    description: "App Store のサブスクリプション設定から解約手続きを行います。",
    steps: [
      "設定アプリを開く",
      "上部のあなたの名前（Apple ID）をタップ",
      "「サブスクリプション」をタップ",
      "「BUZZ BASE Pro」を選び、解約を完了",
    ],
    url: "https://apps.apple.com/account/subscriptions",
    openLabel: "Apple サブスクリプション設定を開く",
    buttonLabel: "設定アプリを開く",
  },
  android: {
    description: "Google Play の定期購入から解約手続きを行います。",
    steps: [
      "Google Play ストアを開く",
      "右上のプロフィールアイコンをタップ",
      "「お支払いと定期購入」→「定期購入」をタップ",
      "「BUZZ BASE Pro」を選び、解約を完了",
    ],
    url: "https://play.google.com/store/account/subscriptions",
    openLabel: "Google Play の定期購入を開く",
    buttonLabel: "Google Play を開く",
  },
};

interface CancelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** ストア課金の種別。判別できない場合は iOS 向け案内にフォールバックする。 */
  platform?: "ios" | "android";
}

/**
 * ストア課金（iOS App内課金 / Google Play 定期購入）の解約手順を案内するモーダル。
 * プラットフォームのガイドライン上、アプリ内で解約を完結させられないため、それぞれの管理画面へ誘導する。
 */
export function CancelGuideModal({
  isOpen,
  onClose,
  platform = "ios",
}: CancelGuideModalProps) {
  const guide = STORE_GUIDE[platform];

  const handleOpenSettings = () => {
    void Linking.openURL(guide.url);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
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
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal
        >
          <Text style={styles.title}>Pro プランの解約方法</Text>
          <Text style={styles.description}>{guide.description}</Text>

          <View style={styles.steps}>
            {guide.steps.map((step, index) => (
              <Text key={step} style={styles.step}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>

          <Text style={styles.note}>
            解約後も次回更新日までは Pro 機能を引き続きご利用いただけます。
          </Text>

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
              onPress={handleOpenSettings}
              style={[styles.button, styles.primaryButton]}
              accessibilityRole="button"
              accessibilityLabel={guide.openLabel}
            >
              <Text style={styles.primaryButtonText}>{guide.buttonLabel}</Text>
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
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    color: "#D4D4D4",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  steps: {
    backgroundColor: "#424242",
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginBottom: 16,
  },
  step: {
    color: "#F4F4F4",
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    color: "#A1A1AA",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
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
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "500",
  },
});
