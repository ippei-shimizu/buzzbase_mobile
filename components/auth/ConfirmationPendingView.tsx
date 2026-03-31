import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
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
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
      <View style={{ marginBottom: 32 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 28,
            fontWeight: "bold",
            color: "#d08000",
          }}
        >
          BUZZ BASE
        </Text>
      </View>

      <View
        style={{
          marginBottom: 24,
          borderRadius: 8,
          backgroundColor: "#424242",
          padding: 24,
        }}
      >
        <Text
          style={{
            marginBottom: 8,
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            color: "#F4F4F4",
          }}
        >
          確認メールを送信しました
        </Text>
        <Text style={{ textAlign: "center", fontSize: 14, color: "#D4D4D8" }}>
          {email} に確認メールを送信しました。{"\n"}
          メール内のリンクをクリックしてアカウントを有効化してください。
        </Text>
      </View>

      <ErrorMessage errors={errors} />

      {resent && (
        <View
          style={{
            marginBottom: 16,
            borderRadius: 8,
            backgroundColor: "#052814",
            padding: 12,
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 14, color: "#74DFA2" }}>
            確認メールを再送信しました
          </Text>
        </View>
      )}

      <Button
        title="確認メールを再送信"
        onPress={onResend}
        loading={isResending}
      />

      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity>
            <Text style={{ fontSize: 14, color: "#d08000" }}>
              ログイン画面に戻る
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
