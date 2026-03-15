import { View, Text, TouchableOpacity } from "react-native";

interface Props {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SegmentedControl({ options, selectedIndex, onSelect }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#52525B",
        overflow: "hidden",
      }}
    >
      {options.map((option, index) => {
        const isActive = index === selectedIndex;
        return (
          <TouchableOpacity
            key={option}
            style={{
              flex: 1,
              paddingVertical: 10,
              backgroundColor: isActive ? "#d08000" : "#424242",
              alignItems: "center",
              borderRightWidth: index < options.length - 1 ? 1 : 0,
              borderRightColor: "#52525B",
            }}
            onPress={() => onSelect(index)}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: isActive ? "600" : "400",
                color: isActive ? "#F4F4F4" : "#A1A1AA",
              }}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
