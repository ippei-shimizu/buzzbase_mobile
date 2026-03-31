import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { UsernameRegistrationForm } from "@components/auth/UsernameRegistrationForm";
import axiosInstance from "@utils/axiosInstance";

export default function UsernameRegistrationScreen() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  const isValid = username.length >= 3 && usernameRegex.test(username);

  const getUsernameError = (): string | undefined => {
    if (username === "") return undefined;
    if (username.length < 3) return "3文字以上で入力してください";
    if (!usernameRegex.test(username))
      return "半角英数字・アンダーバーのみ使用できます";
    return undefined;
  };

  const handleSubmit = async () => {
    setErrors([]);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("user[user_id]", username);
      await axiosInstance.put("/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.replace("/(tabs)");
    } catch (error) {
      if (error instanceof AxiosError) {
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
        <UsernameRegistrationForm
          username={username}
          usernameError={getUsernameError()}
          errors={errors}
          isSubmitting={isSubmitting}
          isValid={isValid}
          onUsernameChange={setUsername}
          onSubmit={handleSubmit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
