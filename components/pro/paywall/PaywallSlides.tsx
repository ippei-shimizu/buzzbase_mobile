import type { ProTrigger } from "@utils/analytics";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { HitDirectionTable } from "@components/stats/HitDirectionTable";
import { PitchCourseCard } from "@components/stats/PitchCourseCard";
import {
  CountSituationDummy,
  DUMMY_PITCH_COURSES,
} from "@components/stats/proComingSoonDummies";
import { ProComingSoonHitDirectionField } from "@components/stats/ProComingSoonHitDirectionField";
import { useHitDirections } from "@hooks/useStats";
import { SampleDataLabel } from "../SampleDataLabel";
import { NoAdsArt, SeasonTrendArt } from "./PaywallSlideArt";

/** スライドの識別子。トリガーに対応するスライドを先頭に並べ替えるために使う。 */
export type PaywallSlideKey =
  | "hit_direction"
  | "count_situation"
  | "pitch_course"
  | "season_trend"
  | "no_ads";

interface SlideCopy {
  key: PaywallSlideKey;
  title: string;
  description: string;
}

// 既定の並び順。打席の詳細入力を持つユーザーが多い成績分析を先に見せる。
const SLIDES: readonly SlideCopy[] = [
  {
    key: "hit_direction",
    title: "打球の方向ごとに打率がわかる",
    description:
      "どこへ打ったときに結果が出ているかを球場図のヒートマップで確認できます。",
  },
  {
    key: "count_situation",
    title: "カウント別の強さが見える",
    description:
      "初球・有利カウント・追い込みで打率がどう変わるかを比べられます。",
  },
  {
    key: "pitch_course",
    title: "コース別の得意・苦手がわかる",
    description:
      "5×5 のゾーン別ヒートマップで、狙い球と苦手コースをはっきりさせます。",
  },
  {
    key: "season_trend",
    title: "シーズンを跨いだ成長を比較",
    description:
      "昨シーズンと今シーズンの成績を重ねて、伸びをそのまま確認できます。",
  },
  {
    key: "no_ads",
    title: "広告なしで記録に集中",
    description: "アプリ内の広告がすべて非表示になり、入力の手が止まりません。",
  },
];

// トリガーになった機能に対応するスライド。該当が無いトリガーは既定の順序で見せる。
const SLIDE_KEY_BY_TRIGGER: Partial<Record<ProTrigger, PaywallSlideKey>> = {
  hit_direction_average: "hit_direction",
  count_situation_average: "count_situation",
  pitch_type_average: "pitch_course",
  pitch_course_average: "pitch_course",
  season_transition_graph: "season_trend",
  no_ads: "no_ads",
};

/**
 * トリガーに対応するスライドを先頭にした並び順を返す。
 * @param trigger Paywall を開いた起点の機能キー
 * @param leadOverride 先頭に固定したいスライド。トリガーより優先する
 */
export function orderSlides(
  trigger: ProTrigger,
  leadOverride?: PaywallSlideKey,
): SlideCopy[] {
  const lead = leadOverride ?? SLIDE_KEY_BY_TRIGGER[trigger];
  if (!lead) return [...SLIDES];
  const leadSlide = SLIDES.find((slide) => slide.key === lead);
  if (!leadSlide) return [...SLIDES];
  return [leadSlide, ...SLIDES.filter((slide) => slide.key !== lead)];
}

const AUTO_ADVANCE_INTERVAL = 5000;

interface PaywallSlidesProps {
  trigger: ProTrigger;
  /**
   * 先頭に固定したいスライド。トリガー由来の既定より優先する。
   * 記録が1シーズン分しかないユーザーにシーズン推移を先頭にしない用途で使う。
   */
  leadSlide?: PaywallSlideKey;
}

/**
 * Pro でできることを紹介する横スクロールのスライドショー。
 * 自動送りはユーザーがスワイプした時点で止め、見たいスライドから動かさない。
 * 方向別だけは無料でも同じ集計 API を参照できるため、本人の打球データがあれば
 * それを見せ、無ければサンプルに切り替える。
 */
export function PaywallSlides({ trigger, leadSlide }: PaywallSlidesProps) {
  const { width } = useWindowDimensions();
  // Paywall 本体の左右パディング（20）を差し引いた1枚あたりの幅。
  const slideWidth = Math.max(1, width - 40);
  const slides = orderSlides(trigger, leadSlide);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const swipedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const hitDirections = useHitDirections({});
  const ownDirections = hitDirections.data?.directions ?? [];
  const hasOwnDirections = ownDirections.some(
    (direction) => direction.at_bats > 0,
  );

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      if (swipedRef.current) return;
      const next = (indexRef.current + 1) % slides.length;
      indexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * slideWidth, animated: true });
    }, AUTO_ADVANCE_INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length, slideWidth]);

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    indexRef.current = next;
    setActiveIndex(next);
  };

  const renderArt = (key: PaywallSlideKey) => {
    switch (key) {
      case "hit_direction":
        return hasOwnDirections ? (
          <>
            <Text style={styles.ownDataNote}>
              あなたのこれまでの打球から集計しています
            </Text>
            <HitDirectionTable directions={ownDirections} />
          </>
        ) : (
          <>
            <SampleDataLabel />
            <ProComingSoonHitDirectionField />
          </>
        );
      case "count_situation":
        return (
          <>
            <SampleDataLabel />
            <CountSituationDummy />
          </>
        );
      case "pitch_course":
        return (
          <>
            <SampleDataLabel />
            <PitchCourseCard data={DUMMY_PITCH_COURSES} />
          </>
        );
      case "season_trend":
        return <SeasonTrendArt />;
      case "no_ads":
        return <NoAdsArt />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          swipedRef.current = true;
        }}
        onMomentumScrollEnd={handleMomentumEnd}
        style={{ width: slideWidth }}
      >
        {slides.map((slide) => (
          <View
            key={slide.key}
            style={[styles.slide, { width: slideWidth }]}
            accessibilityLabel={slide.title}
          >
            <View pointerEvents="none" style={styles.art}>
              {renderArt(slide.key)}
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((slide, index) => (
          <View
            key={slide.key}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  slide: {
    paddingRight: 4,
  },
  art: {
    width: "100%",
    minHeight: 180,
    justifyContent: "center",
  },
  slideTitle: {
    color: "#F4F4F4",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 14,
  },
  slideDescription: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  ownDataNote: {
    color: "#d08000",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 8,
  },
  dots: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#52525B",
  },
  dotActive: {
    width: 18,
    backgroundColor: "#d08000",
  },
});
