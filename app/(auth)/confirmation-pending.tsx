import { AxiosError } from "axios";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConfirmationPendingView } from "@components/auth/ConfirmationPendingView";
import { useAuth } from "@hooks/useAuth";

export default function ConfirmationPendingScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { resendConfirmation } = useAuth();

  const [errors, setErrors] = useState<string[]>([]);
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setErrors([]);
    setResent(false);
    setIsResending(true);

    try {
      await resendConfirmation(email);
      setResent(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrors(["確認メールの再送信に失敗しました"]);
      } else {
        setErrors(["ネットワークエラーが発生しました"]);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ConfirmationPendingView
          email={email || ""}
          errors={errors}
          isResending={isResending}
          resent={resent}
          onResend={handleResend}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
