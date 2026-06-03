import { useRouter } from "expo-router";
import {
  PatternSelector,
  type RecordPattern,
} from "@components/game-record/PatternSelector";
import { useGameRecordStore } from "../../stores/gameRecordStore";

/**
 * Step1 完了後の 3 パターン分岐画面。
 * 「打撃のみ」「投手のみ」「両方」のいずれかをユーザーに選ばせ、
 * 選択結果を Zustand に保存して次画面（Step2 or Step3）へ遷移する。
 * 分岐結果は DB には保存せず、Step2/Step3 完了時の遷移制御に使う。
 */
export default function PatternScreen() {
  const router = useRouter();
  const setField = useGameRecordStore((s) => s.setField);

  const handleSelect = (pattern: RecordPattern) => {
    setField("recordPattern", pattern);
    if (pattern === "pitching") {
      router.replace("/(game-record)/step3-pitching");
    } else {
      router.replace("/(game-record)/step2-batting");
    }
  };

  return <PatternSelector onSelect={handleSelect} />;
}
