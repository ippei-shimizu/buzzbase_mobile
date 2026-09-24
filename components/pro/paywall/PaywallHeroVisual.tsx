import type { ProTrigger } from "@utils/analytics";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { HitDirectionTable } from "@components/stats/HitDirectionTable";
import { PitchCourseCard } from "@components/stats/PitchCourseCard";
import {
  CountSituationDummy,
  DUMMY_PITCH_COURSES,
} from "@components/stats/proComingSoonDummies";
import { ProComingSoonHitDirectionField } from "@components/stats/ProComingSoonHitDirectionField";
import { useHitDirections } from "@hooks/useStats";
import { SampleDataLabel } from "../SampleDataLabel";

/** ヒーローに出す図の種類。トリガーに対応する図が無い機能は "none"。 */
export type PaywallHeroKind =
  | "hit_direction"
  | "count_situation"
  | "pitch_course"
  | "none";

// 打席の詳細入力を持つユーザーが多い順に、その場で価値が伝わる図を割り当てる。
// 図を持たない機能はコピーのみで訴求する。
const HERO_KIND_BY_TRIGGER: Partial<Record<ProTrigger, PaywallHeroKind>> = {
  hit_direction_average: "hit_direction",
  count_situation_average: "count_situation",
  pitch_course_average: "pitch_course",
  pitch_type_average: "pitch_course",
};

/**
 * トリガーに対応するヒーロー図の種類を返す。
 * @param trigger Paywall を開いた起点の機能キー
 */
export const heroKindFor = (trigger: ProTrigger): PaywallHeroKind =>
  HERO_KIND_BY_TRIGGER[trigger] ?? "none";

interface PaywallHeroVisualProps {
  kind: PaywallHeroKind;
}

/**
 * 価値画面の先頭に置く図。方向別だけは無料でも同じ集計 API を参照できるため、
 * 本人の打球データがあればそれを、無ければサンプルを見せる。
 * 本人のデータを見せる場合はサンプル表記を出さず、「自分の記録が分析される」ことを伝える。
 */
export function PaywallHeroVisual({ kind }: PaywallHeroVisualProps) {
  // 方向別以外は Pro 限定 API のため無料ユーザーでは取得できず、サンプル固定になる。
  const hitDirections = useHitDirections({}, kind === "hit_direction");

  if (kind === "none") return null;

  if (kind === "hit_direction") {
    const directions = hitDirections.data?.directions ?? [];
    const hasOwnData = directions.some((direction) => direction.at_bats > 0);
    if (hasOwnData) {
      return (
        <View style={styles.container}>
          <Text style={styles.ownDataNote}>
            あなたのこれまでの打球から集計した方向別の打率です
          </Text>
          <View pointerEvents="none" style={styles.visual}>
            <HitDirectionTable directions={directions} />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.container}>
        <SampleDataLabel />
        <View pointerEvents="none" style={styles.visual}>
          <ProComingSoonHitDirectionField />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SampleDataLabel />
      <View pointerEvents="none" style={styles.visual}>
        {kind === "count_situation" ? (
          <CountSituationDummy />
        ) : (
          <PitchCourseCard data={DUMMY_PITCH_COURSES} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  visual: {
    width: "100%",
  },
  ownDataNote: {
    color: "#d08000",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 8,
  },
});
