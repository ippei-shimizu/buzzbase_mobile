import { View, Text } from "react-native";
import { NumberInput } from "@components/ui/NumberInput";

interface Props {
  label: string;
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
}

export function NumberInputRow({
  label,
  value,
  onChangeValue,
  min = 0,
  max,
}: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#3a3a3a",
      }}
    >
      <Text style={{ fontSize: 15, color: "#F4F4F4", flex: 1 }}>{label}</Text>
      <NumberInput
        value={value}
        onChangeValue={onChangeValue}
        min={min}
        max={max}
        style={{ width: 72 }}
      />
    </View>
  );
}
