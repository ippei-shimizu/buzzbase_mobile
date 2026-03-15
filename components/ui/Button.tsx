import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface Props extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export function Button({ title, loading, disabled, style, ...props }: Props) {
  return (
    <TouchableOpacity
      style={[
        {
          alignItems: "center",
          borderRadius: 8,
          backgroundColor: "#d08000",
          paddingHorizontal: 16,
          paddingVertical: 12,
          opacity: disabled || loading ? 0.5 : 1,
        },
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#F4F4F4" />
      ) : (
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#F4F4F4" }}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
