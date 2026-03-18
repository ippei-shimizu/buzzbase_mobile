import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { NumberInputRow } from "./NumberInputRow";
import { Button } from "@components/ui/Button";
import { Select } from "@components/ui/Select";
import {
  battingResultsPositions,
  battingResultsList,
} from "@constants/battingData";
import type { BattingBox } from "../../types/gameRecord";

interface Props {
  battingBoxes: BattingBox[];
  runsBattedIn: number;
  run: number;
  battingError: number;
  stealingBase: number;
  caughtStealing: number;
  isSubmitting: boolean;
  errors: string[];
  onPositionChange: (index: number, positionId: number) => void;
  onResultChange: (index: number, resultId: number) => void;
  onAddBox: () => void;
  onDeleteBox: (index: number) => void;
  onFieldChange: (field: string, value: number) => void;
  onSubmit: () => void;
  onSkipPitching: () => void;
}

export function BattingForm({
  battingBoxes,
  runsBattedIn,
  run,
  battingError,
  stealingBase,
  caughtStealing,
  isSubmitting,
  errors,
  onPositionChange,
  onResultChange,
  onAddBox,
  onDeleteBox,
  onFieldChange,
  onSubmit,
  onSkipPitching,
}: Props) {
  return (
    <ScrollView
      style={{ flex: 1, padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {errors.length > 0 && (
        <View
          style={{
            backgroundColor: "rgba(243,18,96,0.1)",
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          {errors.map((e) => (
            <Text key={e} style={{ color: "#F31260", fontSize: 13 }}>
              {e}
            </Text>
          ))}
        </View>
      )}

      {/* 打席カード */}
      <View
        style={{
          backgroundColor: "#3a3a3a",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <View style={{ gap: 12 }}>
          {battingBoxes.map((box, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#2E2E2E",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#52525B",
                padding: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#F4F4F4",
                  marginBottom: 8,
                }}
              >
                第{index + 1}打席
              </Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Select
                  options={battingResultsPositions}
                  selectedId={box.position}
                  onSelect={(id) => onPositionChange(index, id)}
                  placeholder="方向"
                  style={{ flex: 1 }}
                />
                <Select
                  options={battingResultsList}
                  selectedId={box.result}
                  onSelect={(id) => onResultChange(index, id)}
                  placeholder="打球結果"
                  style={{ flex: 3 }}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    borderBottomWidth: 2,
                    borderBottomColor: "#d08000",
                    paddingBottom: 2,
                    marginRight: 16,
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: "#F4F4F4",
                      fontSize: 14,
                    }}
                  >
                    {box.text}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onDeleteBox(index)}
                  hitSlop={8}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: "#52525B",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#F4F4F4",
                        fontSize: 14,
                        fontWeight: "bold",
                        lineHeight: 16,
                      }}
                    >
                      ✕
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 追加ボタン */}
        <View style={{ alignItems: "flex-end", marginTop: 12 }}>
          <TouchableOpacity
            onPress={onAddBox}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#d08000",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: "#F4F4F4",
                fontSize: 22,
                fontWeight: "bold",
                lineHeight: 24,
              }}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        {/* 区切り線 */}
        <View
          style={{
            height: 1,
            backgroundColor: "#52525B",
            marginVertical: 20,
          }}
        />

        {/* その他成績 */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="打点"
              value={runsBattedIn}
              onChangeValue={(v) => onFieldChange("runsBattedIn", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="得点"
              value={run}
              onChangeValue={(v) => onFieldChange("run", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="失策"
              value={battingError}
              onChangeValue={(v) => onFieldChange("battingError", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="盗塁"
              value={stealingBase}
              onChangeValue={(v) => onFieldChange("stealingBase", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="盗塁死"
              value={caughtStealing}
              onChangeValue={(v) => onFieldChange("caughtStealing", v)}
            />
          </View>
        </View>
      </View>

      {/* ボタン */}
      <View style={{ marginTop: 24, gap: 12, marginBottom: 40 }}>
        <Button
          title="投手結果入力へ"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        <Button
          title="投手成績をスキップ"
          onPress={onSkipPitching}
          disabled={isSubmitting}
          style={{ backgroundColor: "#52525B" }}
        />
      </View>
    </ScrollView>
  );
}
