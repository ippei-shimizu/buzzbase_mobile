import {
  View,
  Text,
  TextInput as RNTextInput,
  type TextInputProps,
} from "react-native";

interface Props extends Omit<TextInputProps, "className"> {
  label: string;
  error?: string;
}

export function TextInput({ label, error, ...props }: Props) {
  return (
    <View className="mb-4">
      <Text className="mb-1 text-sm text-zic-300">{label}</Text>
      <RNTextInput
        className={`rounded-lg border bg-sub px-4 py-3 text-white ${
          error ? "border-red-500" : "border-zic-600"
        }`}
        placeholderTextColor="#71717A"
        autoCapitalize="none"
        {...props}
      />
      {error && <Text className="mt-1 text-xs text-red-500">{error}</Text>}
    </View>
  );
}
