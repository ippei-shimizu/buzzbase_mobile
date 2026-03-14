import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";

interface Props extends Omit<TouchableOpacityProps, "className"> {
  title: string;
  loading?: boolean;
}

export function Button({ title, loading, disabled, ...props }: Props) {
  return (
    <TouchableOpacity
      className={`items-center rounded-lg bg-primary px-4 py-3 ${
        disabled || loading ? "opacity-50" : ""
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#F4F4F4" />
      ) : (
        <Text className="text-base font-bold text-white">{title}</Text>
      )}
    </TouchableOpacity>
  );
}
