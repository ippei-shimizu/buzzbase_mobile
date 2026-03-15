import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { TextInput } from "@components/ui/TextInput";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";

interface Props {
  email: string;
  password: string;
  passwordConfirmation: string;
  emailError?: string;
  passwordError?: string;
  errors: string[];
  isSubmitting: boolean;
  isValid: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onSubmit: () => void;
}

export function SignUpForm({
  email,
  password,
  passwordConfirmation,
  emailError,
  passwordError,
  errors,
  isSubmitting,
  isValid,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmationChange,
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

      <ErrorMessage errors={errors} />

      <TextInput
        label="メールアドレス"
        placeholder="email@example.com"
        value={email}
        onChangeText={onEmailChange}
        error={emailError}
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        label="パスワード"
        placeholder="6文字以上の半角英数字"
        value={password}
        onChangeText={onPasswordChange}
        error={passwordError}
        secureTextEntry
        autoComplete="new-password"
      />

      <TextInput
        label="パスワード確認"
        placeholder="パスワードを再入力"
        value={passwordConfirmation}
        onChangeText={onPasswordConfirmationChange}
        secureTextEntry
        autoComplete="new-password"
      />

      <Button
        title="アカウント登録"
        onPress={onSubmit}
        disabled={!isValid}
        loading={isSubmitting}
      />

      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity>
            <Text style={{ fontSize: 14, color: "#d08000" }}>
              すでにアカウントをお持ちの方はこちら
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
