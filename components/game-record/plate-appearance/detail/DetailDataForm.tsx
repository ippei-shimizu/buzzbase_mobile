import { StyleSheet, View } from "react-native";
import {
  useContactQualities,
  usePitchTypes,
  useTimings,
} from "@hooks/usePlateAppearanceMasters";
import { useBattingRecordStore } from "@stores/battingRecordStore";
import { CountBSOSelector } from "./CountBSOSelector";
import { FirstPitchSwingToggle } from "./FirstPitchSwingToggle";
import { InningStepper } from "./InningStepper";
import { MasterChipSelector } from "./MasterChipSelector";
import { MemoTextArea } from "./MemoTextArea";
import { RunnersStateSelector } from "./RunnersStateSelector";

/**
 * 打席ステップ式ウィザードの Step3 本体。
 * 全項目は任意入力で、いずれも store 経由で `toCreatePayload` に流れる。
 * マスタは TanStack Query が個別取得し、エラー時はチップ群が disabled 表示になる。
 */
export function DetailDataForm() {
  const finalBalls = useBattingRecordStore((s) => s.finalBalls);
  const finalStrikes = useBattingRecordStore((s) => s.finalStrikes);
  const finalOuts = useBattingRecordStore((s) => s.finalOuts);
  const firstPitchSwing = useBattingRecordStore((s) => s.firstPitchSwing);
  const runnersState = useBattingRecordStore((s) => s.runnersState);
  const inning = useBattingRecordStore((s) => s.inning);
  const contactQualityId = useBattingRecordStore((s) => s.contactQualityId);
  const timingId = useBattingRecordStore((s) => s.timingId);
  const pitchTypeId = useBattingRecordStore((s) => s.pitchTypeId);
  const selfAnalysisMemo = useBattingRecordStore((s) => s.selfAnalysisMemo);
  const opponentMemo = useBattingRecordStore((s) => s.opponentMemo);

  const setDetailCount = useBattingRecordStore((s) => s.setDetailCount);
  const setFirstPitchSwing = useBattingRecordStore((s) => s.setFirstPitchSwing);
  const setRunnersState = useBattingRecordStore((s) => s.setRunnersState);
  const setInning = useBattingRecordStore((s) => s.setInning);
  const setMasterSelection = useBattingRecordStore((s) => s.setMasterSelection);
  const setMemo = useBattingRecordStore((s) => s.setMemo);

  const contactQuality = useContactQualities();
  const timing = useTimings();
  const pitchType = usePitchTypes();

  return (
    <View style={styles.container}>
      <CountBSOSelector
        balls={finalBalls}
        strikes={finalStrikes}
        outs={finalOuts}
        onChange={setDetailCount}
      />
      <FirstPitchSwingToggle
        value={firstPitchSwing}
        onChange={setFirstPitchSwing}
      />
      <RunnersStateSelector value={runnersState} onChange={setRunnersState} />
      <MasterChipSelector
        label="打球の質"
        options={contactQuality.contactQualities}
        value={contactQualityId}
        onChange={(id) => setMasterSelection("contactQualityId", id)}
        isLoading={contactQuality.isLoading}
        isError={contactQuality.isError}
      />
      <MasterChipSelector
        label="タイミング"
        options={timing.timings}
        value={timingId}
        onChange={(id) => setMasterSelection("timingId", id)}
        isLoading={timing.isLoading}
        isError={timing.isError}
      />
      <MasterChipSelector
        label="球種"
        options={pitchType.pitchTypes}
        value={pitchTypeId}
        onChange={(id) => setMasterSelection("pitchTypeId", id)}
        isLoading={pitchType.isLoading}
        isError={pitchType.isError}
      />
      <InningStepper value={inning} onChange={setInning} />
      <MemoTextArea
        label="自己分析メモ"
        value={selfAnalysisMemo}
        onChange={(text) => setMemo("selfAnalysisMemo", text)}
        placeholder="例: 高めの球に手が出てしまった"
      />
      <MemoTextArea
        label="対戦相手メモ"
        value={opponentMemo}
        onChange={(text) => setMemo("opponentMemo", text)}
        placeholder="例: 初球はストレート / 2 球目以降は変化球中心"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
});
