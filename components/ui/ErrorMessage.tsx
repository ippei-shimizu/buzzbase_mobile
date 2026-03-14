import { View, Text } from "react-native";

interface Props {
  errors: string[];
}

export function ErrorMessage({ errors }: Props) {
  if (errors.length === 0) return null;

  return (
    <View className="mb-4 rounded-lg bg-red-900 p-3">
      {errors.map((error) => (
        <Text key={error} className="text-sm text-red-300">
          {error}
        </Text>
      ))}
    </View>
  );
}
