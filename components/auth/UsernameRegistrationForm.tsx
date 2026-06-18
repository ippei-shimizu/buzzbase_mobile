import { View, Text, Image } from "react-native";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { TextInput } from "@components/ui/TextInput";

interface Props {
  name: string;
  userId: string;
  nameError?: string;
  userIdError?: string;
  errors: string[];
  isSubmitting: boolean;
  isValid: boolean;
  onNameChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onSubmit: () => void;
}

export function UsernameRegistrationForm({
  name,
  userId,
  nameError,
  userIdError,
  errors,
  isSubmitting,
  isValid,
  onNameChange,
  onUserIdChange,
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
        ユーザー名とユーザーIDを設定してください
      </Text>

      <ErrorMessage errors={errors} />

      <TextInput
        label="ユーザー名"
        placeholder="大谷 一郎（ニックネーム可）"
        value={name}
        onChangeText={onNameChange}
        error={nameError}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        label="ユーザーID"
        placeholder="buzz_base235"
        value={userId}
        onChangeText={onUserIdChange}
        error={userIdError}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text
        style={{
          fontSize: 12,
          color: "#999",
          marginBottom: 12,
        }}
      >
        ※IDはプロフィール編集から変更できます。
      </Text>

      <Button
        title="登録する"
        onPress={onSubmit}
        disabled={!isValid}
        loading={isSubmitting}
      />
    </View>
  );
}
