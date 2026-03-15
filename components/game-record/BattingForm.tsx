import { View, Text, ScrollView } from "react-native";
import { NumberInputRow } from "./NumberInputRow";
import { Button } from "@components/ui/Button";

interface Props {
  plateAppearances: number;
  timesAtBat: number;
  atBats: number;
  hit: number;
  twoBaseHit: number;
  threeBaseHit: number;
  homeRun: number;
  totalBases: number;
  runsBattedIn: number;
  run: number;
  strikeOut: number;
  baseOnBalls: number;
  hitByPitch: number;
  sacrificeHit: number;
  sacrificeFly: number;
  stealingBase: number;
  caughtStealing: number;
  battingError: number;
  isSubmitting: boolean;
  errors: string[];
  onFieldChange: (field: string, value: number) => void;
  onSubmit: () => void;
  onSkipPitching: () => void;
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text
      style={{
        fontSize: 14,
        fontWeight: "600",
        color: "#d08000",
        marginTop: 16,
        marginBottom: 4,
        paddingHorizontal: 4,
      }}
    >
      {title}
    </Text>
  );
}

export function BattingForm({
  plateAppearances,
  timesAtBat,
  atBats,
  hit,
  twoBaseHit,
  threeBaseHit,
  homeRun,
  totalBases,
  runsBattedIn,
  run,
  strikeOut,
  baseOnBalls,
  hitByPitch,
  sacrificeHit,
  sacrificeFly,
  stealingBase,
  caughtStealing,
  battingError,
  isSubmitting,
  errors,
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

      <SectionTitle title="打席・打数" />
      <NumberInputRow
        label="打席数"
        value={plateAppearances}
        onChangeValue={(v) => onFieldChange("plateAppearances", v)}
      />
      <NumberInputRow
        label="打数"
        value={timesAtBat}
        onChangeValue={(v) => onFieldChange("timesAtBat", v)}
      />
      <NumberInputRow
        label="打数（at_bats）"
        value={atBats}
        onChangeValue={(v) => onFieldChange("atBats", v)}
      />

      <SectionTitle title="安打" />
      <NumberInputRow
        label="安打"
        value={hit}
        onChangeValue={(v) => onFieldChange("hit", v)}
      />
      <NumberInputRow
        label="二塁打"
        value={twoBaseHit}
        onChangeValue={(v) => onFieldChange("twoBaseHit", v)}
      />
      <NumberInputRow
        label="三塁打"
        value={threeBaseHit}
        onChangeValue={(v) => onFieldChange("threeBaseHit", v)}
      />
      <NumberInputRow
        label="本塁打"
        value={homeRun}
        onChangeValue={(v) => onFieldChange("homeRun", v)}
      />

      {/* 塁打数（自動計算） */}
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
        <Text style={{ fontSize: 15, color: "#A1A1AA" }}>
          塁打数（自動計算）
        </Text>
        <Text style={{ fontSize: 16, color: "#d08000", fontWeight: "600" }}>
          {totalBases}
        </Text>
      </View>

      <SectionTitle title="打点・得点" />
      <NumberInputRow
        label="打点"
        value={runsBattedIn}
        onChangeValue={(v) => onFieldChange("runsBattedIn", v)}
      />
      <NumberInputRow
        label="得点"
        value={run}
        onChangeValue={(v) => onFieldChange("run", v)}
      />

      <SectionTitle title="三振・四死球" />
      <NumberInputRow
        label="三振"
        value={strikeOut}
        onChangeValue={(v) => onFieldChange("strikeOut", v)}
      />
      <NumberInputRow
        label="四球"
        value={baseOnBalls}
        onChangeValue={(v) => onFieldChange("baseOnBalls", v)}
      />
      <NumberInputRow
        label="死球"
        value={hitByPitch}
        onChangeValue={(v) => onFieldChange("hitByPitch", v)}
      />

      <SectionTitle title="犠打・犠飛" />
      <NumberInputRow
        label="犠打"
        value={sacrificeHit}
        onChangeValue={(v) => onFieldChange("sacrificeHit", v)}
      />
      <NumberInputRow
        label="犠飛"
        value={sacrificeFly}
        onChangeValue={(v) => onFieldChange("sacrificeFly", v)}
      />

      <SectionTitle title="走塁" />
      <NumberInputRow
        label="盗塁"
        value={stealingBase}
        onChangeValue={(v) => onFieldChange("stealingBase", v)}
      />
      <NumberInputRow
        label="盗塁死"
        value={caughtStealing}
        onChangeValue={(v) => onFieldChange("caughtStealing", v)}
      />

      <SectionTitle title="失策" />
      <NumberInputRow
        label="失策"
        value={battingError}
        onChangeValue={(v) => onFieldChange("battingError", v)}
      />

      <View style={{ marginTop: 24, gap: 12, marginBottom: 40 }}>
        <Button
          title="次へ：投手成績"
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
