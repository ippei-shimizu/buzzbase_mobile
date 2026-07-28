import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCancelWebSubscription } from "@hooks/useProMutations";

interface WebCancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Web(Stripe)加入者向けの解約確認モーダル。
 * iOS IAP と異なり Stripe サブスクリプションは Rails 経由で直接解約申請できるため、
 * Apple ID 設定への誘導ではなくアプリ内で完結させる。
 */
export function WebCancelConfirmModal({
  isOpen,
  onClose,
}: WebCancelConfirmModalProps) {
  const { cancelWebSubscription, isCancelling } = useCancelWebSubscription();
  const [done, setDone] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelWebSubscription();
      setDone(true);
    } catch {
      Alert.alert("解約に失敗しました", "しばらくしてから再度お試しください。");
    }
  };

  const handleClose = () => {
    setDone(false);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={isCancelling ? undefined : handleClose}
        accessibilityLabel="モーダルを閉じる"
      >
        <Pressable
          style={styles.card}
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal
        >
          {done ? (
            <>
              <Text style={styles.title}>解約申請を受け付けました</Text>
              <Text style={styles.description}>
                次回更新日まで引き続き Pro 機能をご利用いただけます。
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={[styles.button, styles.primaryButton]}
                  accessibilityRole="button"
                  accessibilityLabel="閉じる"
                >
                  <Text style={styles.primaryButtonText}>閉じる</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Pro プランの解約</Text>
              <Text style={styles.description}>
                解約すると次回更新日以降は Pro
                機能が利用できなくなります。次回更新日までは引き続きご利用いただけます。
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleClose}
                  style={[styles.button, styles.secondaryButton]}
                  accessibilityRole="button"
                  accessibilityLabel="閉じる"
                  disabled={isCancelling}
                >
                  <Text style={styles.secondaryButtonText}>閉じる</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.button, styles.primaryButton]}
                  accessibilityRole="button"
                  accessibilityLabel="解約する"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color="#F4F4F4" />
                  ) : (
                    <Text style={styles.primaryButtonText}>解約する</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
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
    minWidth: 72,
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
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: "#F4F4F4",
    fontSize: 14,
    fontWeight: "500",
  },
});
