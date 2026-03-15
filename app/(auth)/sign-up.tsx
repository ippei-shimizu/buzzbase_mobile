import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AxiosError } from "axios";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";
import { SignUpForm } from "@components/auth/SignUpForm";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { validateEmail, validatePassword, getEmailError, getPasswordError } =
    useFormValidation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    email !== "" &&
    password !== "" &&
    passwordConfirmation !== "" &&
    validateEmail(email) &&
    validatePassword(password);

  const handleSubmit = async () => {
    setErrors([]);
    setIsSubmitting(true);

    try {
      await signUp({ email, password, passwordConfirmation });
      router.push({
        pathname: "/(auth)/confirmation-pending",
        params: { email },
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const messages: string[] =
          error.response?.data?.errors?.full_messages || [];

        if (status === 422 && messages.length > 0) {
          const translated = messages.map((msg: string) => {
            if (msg.includes("Email has already been taken")) {
              return "このメールアドレスは既に登録されています";
            }
            return msg;
          });
          setErrors(translated);
        } else {
          setErrors(["エラーが発生しました。もう一度お試しください"]);
        }
      } else {
        setErrors(["ネットワークエラーが発生しました"]);
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
        <SignUpForm
          email={email}
          password={password}
          passwordConfirmation={passwordConfirmation}
          emailError={getEmailError(email)}
          passwordError={getPasswordError(password)}
          errors={errors}
          isSubmitting={isSubmitting}
          isValid={isValid}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onPasswordConfirmationChange={setPasswordConfirmation}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
