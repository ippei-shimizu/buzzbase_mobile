import {
  View,
  Text,
  TextInput as RNTextInput,
  type TextInputProps,
} from "react-native";

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function TextInput({ label, error, style, ...props }: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ marginBottom: 4, fontSize: 14, color: "#D4D4D8" }}>
        {label}
      </Text>
      <RNTextInput
        style={[
          {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? "#F31260" : "#52525B",
            backgroundColor: "#424242",
            paddingHorizontal: 16,
            paddingVertical: 12,
            color: "#F4F4F4",
            fontSize: 16,
          },
          style,
        ]}
        placeholderTextColor="#71717A"
        autoCapitalize="none"
        {...props}
      />
      {error && (
        <Text style={{ marginTop: 4, fontSize: 12, color: "#F31260" }}>
          {error}
        </Text>
      )}
    </View>
  );
}
