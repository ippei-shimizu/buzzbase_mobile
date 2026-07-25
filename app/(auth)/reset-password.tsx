import { AxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResetPasswordView } from "@components/auth/ResetPasswordView";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";

export default function ResetPasswordScreen() {
  const { accessToken, client, uid } = useLocalSearchParams<{
    accessToken: string;
    client: string;
    uid: string;
  }>();
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { validatePassword, getPasswordError } = useFormValidation();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const isValid =
    validatePassword(password) && passwordConfirmation === password;

  const handleSubmit = async () => {
    // isValid で担保済みだが、ディープリンク直後の未初期化タイミング等で
    // params が欠けるケースの防御として残す。
    if (!accessToken || !client || !uid) return;

    setErrors([]);
    setIsSubmitting(true);

    try {
      await resetPassword(
        { password, passwordConfirmation },
        { accessToken, client, uid },
      );
      setCompleted(true);
      setTimeout(() => router.replace("/(auth)/sign-in"), 2000);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(["パスワードの再設定に失敗しました。もう一度お試しください"]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ResetPasswordView
          password={password}
          passwordConfirmation={passwordConfirmation}
          passwordError={getPasswordError(password)}
          errors={errors}
          isSubmitting={isSubmitting}
          isValid={isValid}
          completed={completed}
          onPasswordChange={setPassword}
          onPasswordConfirmationChange={setPasswordConfirmation}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
