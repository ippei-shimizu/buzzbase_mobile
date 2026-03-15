import { View, Text } from "react-native";

interface Props {
  errors: string[];
}

export function ErrorMessage({ errors }: Props) {
  if (errors.length === 0) return null;

  return (
    <View
      style={{
        marginBottom: 16,
        borderRadius: 8,
        backgroundColor: "#310413",
        padding: 12,
      }}
    >
      {errors.map((error) => (
        <Text key={error} style={{ fontSize: 14, color: "#F871A0" }}>
          {error}
        </Text>
      ))}
    </View>
  );
}
