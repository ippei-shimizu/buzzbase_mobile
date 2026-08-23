import type { PlateAppearanceV2 } from "../../types/plateAppearance";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BSOBoard } from "@components/baseball/BSOBoard";
import { RunnersDiamond } from "@components/baseball/RunnersDiamond";
import {
  DIRECTION_LABELS,
  LEGACY_POSITION_TO_DIRECTION,
} from "@constants/groundCanvas";
import { pitchCourseLabel } from "@constants/pitchCourse";
import { PLATE_RESULT_IDS } from "@constants/plateResults";
import { THROW_HAND_FULL_LABELS } from "@constants/throwHand";
import { getBattingResultColor } from "@utils/battingResultColor";
import { DetailRow, UnrecordedBadgeOverlay } from "./DetailRow";
import { DetailSection } from "./DetailSection";
import { HitLocationView } from "./HitLocationView";

interface Props {
  plateAppearance: PlateAppearanceV2;
  currentUserId: number | null;
  onEditPress: () => void;
}

const OUT_TYPE_LABELS: Record<string, string> = {
  ground_ball: "ゴロ",
  fly_ball: "フライ",
  line_drive: "ライナー",
  double_play: "併殺打",
  foul_fly: "ファールフライ",
};

const HIT_TYPE_LABELS: Record<string, string> = {
  single: "単打",
  double: "二塁打",
  triple: "三塁打",
  home_run: "本塁打",
};

const SWING_TYPE_LABELS: Record<string, string> = {
  swinging: "空振り",
  looking: "見逃し",
};

/** 打席詳細（閲覧専用）。記録済みの全項目を表示し、未記録は DetailRow のルールで示す。 */
export function PlateAppearanceDetailView({
  plateAppearance: pa,
  currentUserId,
  onEditPress,
}: Props) {
  const isRecorder = currentUserId !== null && currentUserId === pa.user_id;
  const resultText = pa.batting_result || "未入力";
  const isStrikeout = pa.plate_result_id === PLATE_RESULT_IDS.STRIKEOUT;

  // 旧形式は hit_direction_id を持たないため、旧9方向から近似表示する。
  const directionId =
    pa.hit_direction_id ??
    (pa.batting_position_id !== null
      ? (LEGACY_POSITION_TO_DIRECTION[pa.batting_position_id] ?? null)
      : null);

  const hasCount =
    pa.final_balls !== null ||
    pa.final_strikes !== null ||
    pa.final_outs !== null;

  return (
    <View style={styles.container}>
      {pa.is_new_format === false ? (
        <View style={styles.legacyBanner}>
          <Text style={styles.legacyBannerText}>
            旧形式で記録された打席です。詳細項目は記録されていません
          </Text>
        </View>
      ) : null}

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerBox}>第{pa.batter_box_number}打席</Text>
        <Text
          style={[
            styles.headerResult,
            { color: getBattingResultColor(resultText) },
          ]}
        >
          {resultText}
        </Text>
        {pa.inning !== null ? (
          <Text style={styles.headerInning}>{pa.inning}回</Text>
        ) : null}
      </View>

      {(isStrikeout || pa.out_type !== null || pa.hit_type !== null) && (
        <DetailSection title="結果の内訳">
          {isStrikeout ? (
            <DetailRow
              label="三振の種類"
              value={pa.swing_type ? SWING_TYPE_LABELS[pa.swing_type] : null}
            />
          ) : null}
          {pa.out_type !== null ? (
            <DetailRow
              label="アウト種別"
              value={OUT_TYPE_LABELS[pa.out_type]}
            />
          ) : null}
          {pa.hit_type !== null ? (
            <DetailRow
              label="ヒット種別"
              value={HIT_TYPE_LABELS[pa.hit_type]}
            />
          ) : null}
        </DetailSection>
      )}

      <DetailSection title="打球">
        <DetailRow
          label="打球方向"
          value={directionId !== null ? DIRECTION_LABELS[directionId] : null}
        />
        <DetailRow label="打球位置">
          <HitLocationView
            hitLocationX={pa.hit_location_x}
            hitLocationY={pa.hit_location_y}
          />
        </DetailRow>
      </DetailSection>

      <DetailSection title="カウント・状況">
        <DetailRow label="最終カウント">
          <UnrecordedBadgeOverlay isUnrecorded={!hasCount}>
            <BSOBoard
              balls={pa.final_balls}
              strikes={pa.final_strikes}
              outs={pa.final_outs}
            />
          </UnrecordedBadgeOverlay>
        </DetailRow>
        <DetailRow label="ランナー状況">
          <UnrecordedBadgeOverlay isUnrecorded={pa.runners_state === null}>
            <RunnersDiamond value={pa.runners_state} />
          </UnrecordedBadgeOverlay>
        </DetailRow>
        <DetailRow
          label="初球打ち"
          value={
            pa.first_pitch_swing === null
              ? null
              : pa.first_pitch_swing
                ? "はい"
                : "いいえ"
          }
        />
        <DetailRow
          label="登板状況"
          value={pa.appearance_situation?.name ?? null}
        />
      </DetailSection>

      <DetailSection title="記録">
        <DetailRow label="打点" value={pa.rbi} />
        <DetailRow label="得点" value={pa.run_scored} />
        <DetailRow label="盗塁" value={pa.stolen_bases} />
        <DetailRow label="盗塁死" value={pa.caught_stealing} />
      </DetailSection>

      <DetailSection title="打球の質・投手">
        <DetailRow label="打球の質" value={pa.contact_quality?.name ?? null} />
        <DetailRow label="タイミング" value={pa.timing?.name ?? null} />
        <DetailRow label="球種" value={pa.pitch_type?.name ?? null} />
        <DetailRow
          label="コース"
          value={
            pa.pitch_course !== null && pa.pitch_course !== undefined
              ? pitchCourseLabel(pa.pitch_course)
              : null
          }
        />
        <DetailRow
          label="投手"
          value={
            pa.pitcher
              ? `${pa.pitcher.name}${
                  pa.pitcher.throw_hand
                    ? `（${THROW_HAND_FULL_LABELS[pa.pitcher.throw_hand]}）`
                    : ""
                }`
              : null
          }
        />
        {pa.pitcher ? (
          <>
            <DetailRow
              label="腕の角度"
              value={pa.pitcher.arm_angle?.name ?? null}
            />
            <DetailRow
              label="球速帯"
              value={pa.pitcher.velocity_zone?.name ?? null}
            />
            <DetailRow
              label="投手タイプ"
              value={pa.pitcher.pitcher_style?.name ?? null}
            />
            <DetailRow label="投手メモ" value={pa.pitcher.memo ?? null} />
          </>
        ) : null}
      </DetailSection>

      {/* 書き込み停止済みの opponent_memo は値があるときのみ表示（未記録表示はしない）。 */}
      {(pa.self_analysis_memo || pa.opponent_memo) && (
        <DetailSection title="メモ">
          {pa.self_analysis_memo ? (
            <DetailRow label="自己分析メモ" value={pa.self_analysis_memo} />
          ) : null}
          {pa.opponent_memo ? (
            <DetailRow label="対戦相手メモ" value={pa.opponent_memo} />
          ) : null}
        </DetailSection>
      )}

      {isRecorder ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="この打席を編集"
          style={styles.editButton}
          onPress={onEditPress}
        >
          <Text style={styles.editButtonText}>この打席を編集</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  legacyBanner: {
    backgroundColor: "#3a3a3a",
    borderColor: "#52525B",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  legacyBannerText: {
    color: "#D4D4D8",
    fontSize: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerBox: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  headerResult: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerInning: {
    color: "#A1A1AA",
    fontSize: 13,
  },
  editButton: {
    backgroundColor: "#d08000",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
