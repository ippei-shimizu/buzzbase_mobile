import { View, Text } from "react-native";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { TextInput } from "@components/ui/TextInput";

interface Props {
  password: string;
  passwordConfirmation: string;
  passwordError?: string;
  errors: string[];
  isSubmitting: boolean;
  isValid: boolean;
  completed: boolean;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onSubmit: () => void;
}

export function ResetPasswordView({
  password,
  passwordConfirmation,
  passwordError,
  errors,
  isSubmitting,
  isValid,
  completed,
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

      {completed ? (
        <View
          style={{
            borderRadius: 8,
            backgroundColor: "#052814",
            padding: 24,
          }}
        >
          <Text style={{ textAlign: "center", fontSize: 14, color: "#74DFA2" }}>
            パスワードを更新しました。ログイン画面に移動します。
          </Text>
        </View>
      ) : (
        <>
          <Text
            style={{
              marginBottom: 24,
              textAlign: "center",
              fontSize: 14,
              color: "#D4D4D8",
            }}
          >
            新しいパスワードを入力してください。
          </Text>

          <ErrorMessage errors={errors} />

          <TextInput
            label="新しいパスワード"
            placeholder="6文字以上の半角英数字"
            value={password}
            onChangeText={onPasswordChange}
            error={passwordError}
            secureTextEntry
            autoComplete="password-new"
          />

          <TextInput
            label="新しいパスワード（確認用）"
            placeholder="もう一度入力してください"
            value={passwordConfirmation}
            onChangeText={onPasswordConfirmationChange}
            secureTextEntry
            autoComplete="password-new"
          />

          <Button
            title="パスワードを変更する"
            onPress={onSubmit}
            disabled={!isValid}
            loading={isSubmitting}
          />
        </>
      )}
    </View>
  );
}
