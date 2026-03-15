import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AxiosError } from "axios";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";
import { SignInForm } from "@components/auth/SignInForm";

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { validateEmail, validatePassword, getEmailError, getPasswordError } =
    useFormValidation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    email !== "" &&
    password !== "" &&
    validateEmail(email) &&
    validatePassword(password);

  const handleSubmit = async () => {
    setErrors([]);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.errors?.join(" ") || "";

        if (
          status === 401 &&
          (message.includes("confirmation") ||
            message.includes("A confirmation email"))
        ) {
          router.push({
            pathname: "/(auth)/confirmation-pending",
            params: { email },
          });
          return;
        }

        if (status === 401) {
          setErrors(["メールアドレスまたはパスワードが正しくありません"]);
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
    <KeyboardAvoidingView
      className="flex-1 bg-main"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SignInForm
        email={email}
        password={password}
        emailError={getEmailError(email)}
        passwordError={getPasswordError(password)}
        errors={errors}
        isSubmitting={isSubmitting}
        isValid={isValid}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
}
