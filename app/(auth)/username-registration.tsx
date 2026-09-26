import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UsernameRegistrationForm } from "@components/auth/UsernameRegistrationForm";
import {
  isNetworkError,
  isRateLimitError,
  NETWORK_ERROR_MESSAGE,
  rateLimitErrorMessage,
} from "@utils/axiosError";
import axiosInstance from "@utils/axiosInstance";

export default function UsernameRegistrationScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Web 版 (front/app/(app)/register-username/page.tsx) と同じバリデーション。
  // ユーザー名: 半角英数 + 全角ひらがな / カタカナ / 漢字 + スペース。
  // ユーザー ID: 半角英数 + ハイフン (-) + アンダーバー (_)。
  const nameRegex = /^[0-9A-Za-z぀-ゟ゠-ヿ㐀-䶿一-鿿 ]+$/;
  const userIdRegex = /^[A-Za-z0-9_-]+$/;
  const isValid =
    name.length >= 1 &&
    userId.length >= 1 &&
    nameRegex.test(name) &&
    userIdRegex.test(userId);

  const getNameError = (): string | undefined => {
    if (name === "") return undefined;
    if (!nameRegex.test(name)) return "有効なユーザー名を入力してください";
    return undefined;
  };

  const getUserIdError = (): string | undefined => {
    if (userId === "") return undefined;
    if (!userIdRegex.test(userId))
      return "半角英数字、ハイフン(-)、アンダーバー(_)のみ使用できます";
    return undefined;
  };

  const handleSubmit = async () => {
    setErrors([]);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("user[name]", name);
      formData.append("user[user_id]", userId);
      await axiosInstance.put("/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // 必須項目の登録を終えてから任意のプロフィール入力を挟む。
      router.replace("/(auth)/profile-setup");
    } catch (error) {
      if (isRateLimitError(error)) {
        setErrors([rateLimitErrorMessage(error)]);
      } else if (isNetworkError(error)) {
        setErrors([NETWORK_ERROR_MESSAGE]);
      } else if (error instanceof AxiosError) {
        const messages: string[] =
          error.response?.data?.errors?.full_messages ||
          error.response?.data?.errors ||
          [];
        if (messages.length > 0) {
          setErrors(messages);
        } else {
          setErrors(["エラーが発生しました。もう一度お試しください"]);
        }
      } else {
        setErrors(["エラーが発生しました。もう一度お試しください"]);
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
        <UsernameRegistrationForm
          name={name}
          userId={userId}
          nameError={getNameError()}
          userIdError={getUserIdError()}
          errors={errors}
          isSubmitting={isSubmitting}
          isValid={isValid}
          onNameChange={setName}
          onUserIdChange={setUserId}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
