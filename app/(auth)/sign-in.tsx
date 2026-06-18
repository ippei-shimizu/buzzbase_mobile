import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SignInForm } from "@components/auth/SignInForm";
import { useAuth } from "@hooks/useAuth";
import { useFormValidation } from "@hooks/useFormValidation";
import { getCurrentUserProfile } from "@services/profileService";

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

  const handleLoginError = (error: unknown) => {
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
  };

  const handleSubmit = async () => {
    setErrors([]);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (error) {
      // login 失敗時のみの error handling。GET /user の失敗をここで処理すると
      // 「ネットワークエラー」「パスワードが正しくありません」等の誤った文言が
      // 出てしまうため、後段のプロフィール取得とは try-catch を分離する。
      handleLoginError(error);
      setIsSubmitting(false);
      return;
    }

    // ここに来た = login 成功（トークンは SecureStore に保存済み）。
    // プロフィール取得自体が失敗したケースは安全側（username-registration）
    // に倒す。ログインは成功しているので、画面側で再取得 / 再保存が可能。
    try {
      const profile = await getCurrentUserProfile();
      router.replace(
        profile.user_id ? "/(tabs)" : "/(auth)/username-registration",
      );
    } catch {
      router.replace("/(auth)/username-registration");
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
