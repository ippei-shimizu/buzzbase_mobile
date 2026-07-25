import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ForgotPasswordView } from "@components/auth/ForgotPasswordView";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";

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
    } catch {
      // 成否にかかわらず同一文言を表示するため、ここではエラー内容を利用しない
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
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
