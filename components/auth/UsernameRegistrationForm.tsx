import { View, Text, Image } from "react-native";
import { TextInput } from "@components/ui/TextInput";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";

interface Props {
  username: string;
  usernameError?: string;
  errors: string[];
  isSubmitting: boolean;
  isValid: boolean;
  onUsernameChange: (value: string) => void;
  onSubmit: () => void;
}

export function UsernameRegistrationForm({
  username,
  usernameError,
  errors,
  isSubmitting,
  isValid,
  onUsernameChange,
  onSubmit,
}: Props) {
  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
      <Image
        source={require("../../assets/images/logo-bg.png")}
        style={{
          position: "absolute",
          top: -40,
          left: -40,
          width: 240,
          height: 240,
          opacity: 0.15,
        }}
        resizeMode="contain"
      />

      <View style={{ marginBottom: 16, alignItems: "center" }}>
        <Image
          source={require("../../assets/images/buzz-logo-v2.png")}
          style={{ width: 200, height: 60 }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{
          fontSize: 16,
          color: "#ccc",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        ユーザーIDを設定してください
      </Text>

      <ErrorMessage errors={errors} />

      <TextInput
        label="ユーザーID"
        placeholder="半角英数字・アンダーバー"
        value={username}
        onChangeText={onUsernameChange}
        error={usernameError}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        title="登録する"
        onPress={onSubmit}
        disabled={!isValid}
        loading={isSubmitting}
      />
    </View>
  );
}
