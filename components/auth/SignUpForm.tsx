import { Link } from "expo-router";
import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { AppleSignInButton } from "@components/auth/AppleSignInButton";
import { GoogleSignInButton } from "@components/auth/GoogleSignInButton";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { TextInput } from "@components/ui/TextInput";

interface Props {
  email: string;
  password: string;
  passwordConfirmation: string;
  emailError?: string;
  passwordError?: string;
  errors: string[];
  isSubmitting: boolean;
  isValid: boolean;
  isGoogleLoading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onSubmit: () => void;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
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
  isGoogleLoading = false,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmationChange,
  onSubmit,
  onGoogleSignIn,
  onAppleSignIn,
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

      <View style={{ marginBottom: 32, alignItems: "center" }}>
        <Image
          source={require("../../assets/images/buzz-logo-v2.png")}
          style={{ width: 200, height: 60 }}
          resizeMode="contain"
        />
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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: "#555" }} />
        <Text style={{ marginHorizontal: 12, color: "#999", fontSize: 13 }}>
          または
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#555" }} />
      </View>

      <GoogleSignInButton
        onPress={onGoogleSignIn}
        loading={isGoogleLoading}
        label="Googleで登録"
      />

      {Platform.OS === "ios" && <AppleSignInButton onPress={onAppleSignIn} />}

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
