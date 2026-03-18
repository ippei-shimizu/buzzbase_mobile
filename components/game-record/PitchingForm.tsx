import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { NumberInputRow } from "./NumberInputRow";
import { NumberInput } from "@components/ui/NumberInput";
import { Select } from "@components/ui/Select";
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

const winOrLossOptions = [
  { id: -1, label: "-" },
  { id: 0, label: "勝利投手" },
  { id: 1, label: "敗戦投手" },
];

const inningsOptions = Array.from({ length: 13 }, (_, i) => ({
  id: i,
  label: String(i),
}));

const fractionOptions = [
  { id: 0, label: "0/3" },
  { id: 1, label: "1/3" },
  { id: 2, label: "2/3" },
];

function Divider() {
  return (
    <View
      style={{ height: 1, backgroundColor: "#52525B", marginVertical: 16 }}
    />
  );
}

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
  const winLossSelectedId = win > 0 ? 0 : loss > 0 ? 1 : -1;

  const handleWinLossChange = (id: number) => {
    onFieldChange("win", id === 0 ? 1 : 0);
    onFieldChange("loss", id === 1 ? 1 : 0);
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

      <View
        style={{
          backgroundColor: "#3a3a3a",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {/* 勝敗 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#F4F4F4" }}>
            勝敗
          </Text>
          <View style={{ flex: 1, marginLeft: 24 }}>
            <Select
              options={winOrLossOptions}
              selectedId={winLossSelectedId}
              onSelect={handleWinLossChange}
              placeholder="-"
            />
          </View>
        </View>

        <Divider />

        {/* 投球回数 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#F4F4F4" }}>
            投球回数
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 64 }}>
              <Select
                options={inningsOptions}
                selectedId={inningsPitchedWhole}
                onSelect={(id) => onFieldChange("inningsPitchedWhole", id)}
                placeholder="0"
              />
            </View>
            <View style={{ width: 64 }}>
              <Select
                options={fractionOptions}
                selectedId={inningsPitchedFraction}
                onSelect={(id) => onFieldChange("inningsPitchedFraction", id)}
                placeholder="0/3"
              />
            </View>
          </View>
        </View>

        <Divider />

        {/* 投球数 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 15, color: "#F4F4F4" }}>投球数</Text>
          <NumberInput
            value={numberOfPitches}
            onChangeValue={(v) => onFieldChange("numberOfPitches", v)}
            style={{ width: 72 }}
          />
        </View>

        <Divider />

        {/* 完投 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 15, color: "#F4F4F4" }}>完投</Text>
          <TouchableOpacity
            onPress={() => onFieldChange("gotToTheDistance", !gotToTheDistance)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: gotToTheDistance ? "#d08000" : "#71717A",
              backgroundColor: gotToTheDistance ? "#d08000" : "transparent",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {gotToTheDistance && (
              <Text
                style={{
                  color: "#F4F4F4",
                  fontSize: 14,
                  fontWeight: "bold",
                  lineHeight: 16,
                }}
              >
                ✓
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Divider />

        {/* その他成績 (2カラムグリッド) */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 4,
          }}
        >
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="ホールド"
              value={hold}
              onChangeValue={(v) => onFieldChange("hold", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="セーブ"
              value={saves}
              onChangeValue={(v) => onFieldChange("saves", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="失点"
              value={runAllowed}
              onChangeValue={(v) => onFieldChange("runAllowed", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="自責点"
              value={earnedRun}
              onChangeValue={(v) => onFieldChange("earnedRun", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="被安打"
              value={hitsAllowed}
              onChangeValue={(v) => onFieldChange("hitsAllowed", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="被本塁打"
              value={homeRunsHit}
              onChangeValue={(v) => onFieldChange("homeRunsHit", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="奪三振"
              value={strikeouts}
              onChangeValue={(v) => onFieldChange("strikeouts", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="四球"
              value={pitchingBaseOnBalls}
              onChangeValue={(v) => onFieldChange("pitchingBaseOnBalls", v)}
            />
          </View>
          <View style={{ width: "47%" }}>
            <NumberInputRow
              label="死球"
              value={pitchingHitByPitch}
              onChangeValue={(v) => onFieldChange("pitchingHitByPitch", v)}
            />
          </View>
        </View>
      </View>

      {/* 送信ボタン */}
      <Button
        title="試合結果まとめ"
        onPress={onSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={{ marginTop: 24, marginBottom: 40 }}
      />
    </ScrollView>
  );
}
