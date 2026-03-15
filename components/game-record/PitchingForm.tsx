import { View, Text, ScrollView, Switch } from "react-native";
import { NumberInputRow } from "./NumberInputRow";
import { SegmentedControl } from "@components/ui/SegmentedControl";
import { NumberInput } from "@components/ui/NumberInput";
import { Button } from "@components/ui/Button";

interface Props {
  win: number;
  loss: number;
  hold: number;
  saves: number;
  inningsPitchedWhole: number;
  inningsPitchedFraction: number;
  numberOfPitches: number;
  gotToTheDistance: boolean;
  runAllowed: number;
  earnedRun: number;
  hitsAllowed: number;
  homeRunsHit: number;
  strikeouts: number;
  pitchingBaseOnBalls: number;
  pitchingHitByPitch: number;
  isSubmitting: boolean;
  errors: string[];
  onFieldChange: (field: string, value: number | boolean) => void;
  onSubmit: () => void;
}

const WIN_LOSS_OPTIONS = ["なし", "勝", "負"];
const FRACTION_OPTIONS = ["0/3", "1/3", "2/3"];

export function PitchingForm({
  win,
  loss,
  hold,
  saves,
  inningsPitchedWhole,
  inningsPitchedFraction,
  numberOfPitches,
  gotToTheDistance,
  runAllowed,
  earnedRun,
  hitsAllowed,
  homeRunsHit,
  strikeouts,
  pitchingBaseOnBalls,
  pitchingHitByPitch,
  isSubmitting,
  errors,
  onFieldChange,
  onSubmit,
}: Props) {
  const winLossIndex = win > 0 ? 1 : loss > 0 ? 2 : 0;

  const handleWinLossChange = (index: number) => {
    onFieldChange("win", index === 1 ? 1 : 0);
    onFieldChange("loss", index === 2 ? 1 : 0);
  };

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

      {/* 勝敗 */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: "#D4D4D8" }}>
          勝敗
        </Text>
        <SegmentedControl
          options={WIN_LOSS_OPTIONS}
          selectedIndex={winLossIndex}
          onSelect={handleWinLossChange}
        />
      </View>

      {/* ホールド・セーブ */}
      <NumberInputRow
        label="ホールド"
        value={hold}
        onChangeValue={(v) => onFieldChange("hold", v)}
      />
      <NumberInputRow
        label="セーブ"
        value={saves}
        onChangeValue={(v) => onFieldChange("saves", v)}
      />

      {/* 投球回 */}
      <View style={{ marginBottom: 16, marginTop: 16 }}>
        <Text style={{ marginBottom: 8, fontSize: 14, color: "#D4D4D8" }}>
          投球回
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <NumberInput
            value={inningsPitchedWhole}
            onChangeValue={(v) => onFieldChange("inningsPitchedWhole", v)}
            style={{ width: 72 }}
          />
          <Text style={{ color: "#F4F4F4", fontSize: 16 }}>回</Text>
          <View style={{ flex: 1 }}>
            <SegmentedControl
              options={FRACTION_OPTIONS}
              selectedIndex={inningsPitchedFraction}
              onSelect={(i) => onFieldChange("inningsPitchedFraction", i)}
            />
          </View>
        </View>
      </View>

      {/* 完投 */}
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
        <Text style={{ fontSize: 15, color: "#F4F4F4" }}>完投</Text>
        <Switch
          value={gotToTheDistance}
          onValueChange={(v) => onFieldChange("gotToTheDistance", v)}
          trackColor={{ false: "#52525B", true: "#d08000" }}
          thumbColor="#F4F4F4"
        />
      </View>

      <NumberInputRow
        label="投球数"
        value={numberOfPitches}
        onChangeValue={(v) => onFieldChange("numberOfPitches", v)}
      />
      <NumberInputRow
        label="失点"
        value={runAllowed}
        onChangeValue={(v) => onFieldChange("runAllowed", v)}
      />
      <NumberInputRow
        label="自責点"
        value={earnedRun}
        onChangeValue={(v) => onFieldChange("earnedRun", v)}
      />
      <NumberInputRow
        label="被安打"
        value={hitsAllowed}
        onChangeValue={(v) => onFieldChange("hitsAllowed", v)}
      />
      <NumberInputRow
        label="被本塁打"
        value={homeRunsHit}
        onChangeValue={(v) => onFieldChange("homeRunsHit", v)}
      />
      <NumberInputRow
        label="奪三振"
        value={strikeouts}
        onChangeValue={(v) => onFieldChange("strikeouts", v)}
      />
      <NumberInputRow
        label="与四球"
        value={pitchingBaseOnBalls}
        onChangeValue={(v) => onFieldChange("pitchingBaseOnBalls", v)}
      />
      <NumberInputRow
        label="与死球"
        value={pitchingHitByPitch}
        onChangeValue={(v) => onFieldChange("pitchingHitByPitch", v)}
      />

      <Button
        title="次へ：サマリー"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={{ marginTop: 24, marginBottom: 40 }}
      />
    </ScrollView>
  );
}
