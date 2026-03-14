import { View, Text } from "react-native";
import { Link } from "expo-router";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";

interface Props {
  email: string;
  errors: string[];
  isResending: boolean;
  resent: boolean;
  onResend: () => void;
}

export function ConfirmationPendingView({
  email,
  errors,
  isResending,
  resent,
  onResend,
}: Props) {
  return (
    <View className="flex-1 justify-center px-6">
      <View className="mb-8">
        <Text className="text-center text-3xl font-bold text-primary">
          BUZZ BASE
        </Text>
      </View>

      <View className="mb-6 rounded-lg bg-sub p-6">
        <Text className="mb-2 text-center text-lg font-bold text-white">
          確認メールを送信しました
        </Text>
        <Text className="text-center text-sm text-zic-300">
          {email} に確認メールを送信しました。{"\n"}
          メール内のリンクをクリックしてアカウントを有効化してください。
        </Text>
      </View>

      <ErrorMessage errors={errors} />

      {resent && (
        <View className="mb-4 rounded-lg bg-green-900 p-3">
          <Text className="text-center text-sm text-green-300">
            確認メールを再送信しました
          </Text>
        </View>
      )}

      <Button
        title="確認メールを再送信"
        onPress={onResend}
        loading={isResending}
      />

      <View className="mt-6 items-center">
        <Link href="/(auth)/sign-in" className="text-sm text-primary">
          ログイン画面に戻る
        </Link>
      </View>
    </View>
  );
}
