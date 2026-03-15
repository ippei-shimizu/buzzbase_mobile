import {
  View,
  Text,
  TextInput as RNTextInput,
  type TextInputProps,
} from "react-native";

interface Props extends Omit<TextInputProps, "value" | "onChangeText"> {
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberInput({
  label,
  value,
  onChangeValue,
  min = 0,
  max,
  style,
  ...props
}: Props) {
  const handleChange = (text: string) => {
    const num = parseInt(text, 10);
    if (text === "" || text === "0") {
      onChangeValue(0);
      return;
    }
    if (!isNaN(num)) {
      let clamped = min !== undefined ? Math.max(min, num) : num;
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChangeValue(clamped);
    }
  };

  return (
    <View>
      {label && (
        <Text style={{ marginBottom: 4, fontSize: 14, color: "#D4D4D8" }}>
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          {
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#52525B",
            backgroundColor: "#424242",
            paddingHorizontal: 12,
            paddingVertical: 8,
            color: "#F4F4F4",
            fontSize: 16,
            textAlign: "center",
            minWidth: 60,
          },
          style,
        ]}
        keyboardType="number-pad"
        value={value === 0 ? "0" : String(value)}
        onChangeText={handleChange}
        selectTextOnFocus
        placeholderTextColor="#71717A"
        {...props}
      />
    </View>
  );
}
