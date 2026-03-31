import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { AxiosError } from "axios";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";
import { SignInForm } from "@components/auth/SignInForm";

export default function SignInScreen() {
  const router = useRouter();
  const { login, googleLogin, appleLogin } = useAuth();
  const { validateEmail, validatePassword, getEmailError, getPasswordError } =
    useFormValidation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
      router.replace("/(tabs)");
      return;
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

  const handleGoogleSignIn = async () => {
    setErrors([]);
    setIsGoogleLoading(true);

    try {
      const response = await googleLogin();
      if (response?.requires_username) {
        router.replace("/(auth)/username-registration");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrors(["Googleログインに失敗しました。もう一度お試しください"]);
      } else {
        setErrors(["Googleログインに失敗しました"]);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setErrors([]);

    try {
      const response = await appleLogin();
      if (!response) return; // ユーザーキャンセル
      if (response?.requires_username) {
        router.replace("/(auth)/username-registration");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setErrors(["Appleログインに失敗しました。もう一度お試しください"]);
      } else {
        setErrors(["Appleログインに失敗しました"]);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2E2E2E" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
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
          isGoogleLoading={isGoogleLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          onAppleSignIn={handleAppleSignIn}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
