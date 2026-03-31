import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignUpForm } from "@components/auth/SignUpForm";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, googleLogin, appleLogin } = useAuth();
  const { validateEmail, validatePassword, getEmailError, getPasswordError } =
    useFormValidation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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
        <SignUpForm
          email={email}
          password={password}
          passwordConfirmation={passwordConfirmation}
          emailError={getEmailError(email)}
          passwordError={getPasswordError(password)}
          errors={errors}
          isSubmitting={isSubmitting}
          isValid={isValid}
          isGoogleLoading={isGoogleLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onPasswordConfirmationChange={setPasswordConfirmation}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          onAppleSignIn={handleAppleSignIn}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
