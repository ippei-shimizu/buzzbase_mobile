import { AxiosError } from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ResetPasswordView } from "@components/auth/ResetPasswordView";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";
import { isRateLimitError, rateLimitErrorMessage } from "@utils/axiosError";

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
      // back は PUT /auth/password をスロットル対象にしていないため現状は到達しないが、
      // 対象化された際の取りこぼしを防ぐために置いている。
      if (isRateLimitError(error)) {
        setErrors([rateLimitErrorMessage(error)]);
        return;
      }
      // PUT /auth/password のバリデーションエラーは devise_token_auth の
      // resource_errors ヘルパーにより { フィールド名: [...], full_messages: [...] }
      // というハッシュ形式で返るため、full_messages を優先的に取り出す
      // （フラットな配列を前提にすると ErrorMessage 側の map でクラッシュする）。
      if (error instanceof AxiosError) {
        const messages: string[] =
          error.response?.data?.errors?.full_messages ||
          (Array.isArray(error.response?.data?.errors)
            ? error.response.data.errors
            : []);
        setErrors(
          messages.length > 0
            ? messages
            : ["パスワードの再設定に失敗しました。もう一度お試しください"],
        );
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
