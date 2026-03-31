import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { Link } from "expo-router";
import { TextInput } from "@components/ui/TextInput";
import { Button } from "@components/ui/Button";
import { ErrorMessage } from "@components/ui/ErrorMessage";
import { GoogleSignInButton } from "@components/auth/GoogleSignInButton";
import { AppleSignInButton } from "@components/auth/AppleSignInButton";

interface Props {
  email: string;
  password: string;
  emailError?: string;
  passwordError?: string;
  errors: string[];
  isSubmitting: boolean;
  isValid: boolean;
  isGoogleLoading?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onGoogleSignIn: () => void;
  onAppleSignIn: () => void;
}

export function SignInForm({
  email,
  password,
  emailError,
  passwordError,
  errors,
  isSubmitting,
  isValid,
  isGoogleLoading = false,
  onEmailChange,
  onPasswordChange,
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
        autoComplete="password"
      />

      <Button
        title="ログイン"
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

      <GoogleSignInButton onPress={onGoogleSignIn} loading={isGoogleLoading} />

      {Platform.OS === "ios" && <AppleSignInButton onPress={onAppleSignIn} />}

      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <Text style={{ fontSize: 14, color: "#d08000" }}>
              アカウントをお持ちでない方はこちら
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
