import { Link } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { TextInput } from "@components/ui/TextInput";

interface Props {
  email: string;
  emailError?: string;
  errors: string[];
  isSubmitting: boolean;
  isValid: boolean;
  submitted: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

// アカウント列挙・認証方式の推測を防ぐため、成否にかかわらず同一の文言を表示する。
const GENERIC_MESSAGE =
  "ご入力いただいたメールアドレス宛にパスワード再設定のご案内をお送りしました（該当するアカウントが存在する場合）。メールをご確認ください。";

export function ForgotPasswordView({
  email,
  emailError,
  errors,
  isSubmitting,
  isValid,
  submitted,
  onEmailChange,
  onSubmit,
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

      <Text
        style={{
          marginBottom: 24,
          textAlign: "center",
          fontSize: 14,
          color: "#D4D4D8",
        }}
      >
        ご登録のメールアドレスを入力してください。{"\n"}
        パスワード再設定用のリンクをお送りします。
      </Text>

      <ErrorMessage errors={errors} />

      {submitted ? (
        <View
          style={{
            marginBottom: 16,
            borderRadius: 8,
            backgroundColor: "#424242",
            padding: 24,
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 14, color: "#F4F4F4" }}>
            {GENERIC_MESSAGE}
          </Text>
        </View>
      ) : (
        <>
          <TextInput
            label="メールアドレス"
            placeholder="email@example.com"
            value={email}
            onChangeText={onEmailChange}
            error={emailError}
            keyboardType="email-address"
            autoComplete="email"
          />

          <Button
            title="送信する"
            onPress={onSubmit}
            disabled={!isValid}
            loading={isSubmitting}
          />
        </>
      )}

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
