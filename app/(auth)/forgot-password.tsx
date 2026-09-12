import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ForgotPasswordView } from "@components/auth/ForgotPasswordView";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";
import { isRateLimitError, rateLimitErrorMessage } from "@utils/axiosError";

export default function ForgotPasswordScreen() {
  const { requestPasswordReset } = useAuth();
  const { validateEmail, getEmailError } = useFormValidation();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isValid = email !== "" && validateEmail(email);

  const handleSubmit = async () => {
    if (!isValid) return;
    setErrors([]);
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      // アカウント列挙を防ぐため成否にかかわらず同一文言を出すが、
      // レート制限は対象メールの有無に依存しないため例外的に別文言を出す。
      if (isRateLimitError(error)) {
        setErrors([rateLimitErrorMessage(error)]);
      } else {
        setSubmitted(true);
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
        <ForgotPasswordView
          email={email}
          emailError={getEmailError(email)}
          errors={errors}
          isSubmitting={isSubmitting}
          isValid={isValid}
          submitted={submitted}
          onEmailChange={setEmail}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
