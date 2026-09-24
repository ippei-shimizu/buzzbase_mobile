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
import {
  CountSituationArt,
  HitDirectionArt,
  NoAdsArt,
  PitchCourseArt,
  SeasonTrendArt,
} from "./PaywallSlideArt";

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

// 既定の並び順。図だけで「何が読み取れるか」が伝わる成績分析を先に見せる。
// 方向別 → コース別はどちらもヒートマップで、打率の高低が一目で分かる。
const SLIDES: readonly SlideCopy[] = [
  {
    key: "hit_direction",
    title: "打球の方向ごとに\n打率がわかる",
    description:
      "どこへ打ったときに結果が出ているかを、球場図のヒートマップで確認できます。",
  },
  {
    key: "pitch_course",
    title: "コース別の\n得意・苦手がわかる",
    description:
      "ゾーンごとのヒートマップで、狙い球と苦手コースがはっきりします。",
  },
  {
    key: "count_situation",
    title: "カウント別の\n強さが見える",
    description:
      "初球・有利カウント・追い込みで打率がどう変わるかを比べられます。",
  },
  {
    key: "season_trend",
    title: "シーズンを跨いだ\n成長を比較",
    description:
      "昨シーズンと今シーズンの成績を重ねて、伸びをそのまま確認できます。",
  },
  {
    key: "no_ads",
    title: "広告なしで\n記録に集中",
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

/**
 * トリガーに対応する紹介スライドがあるか。
 * ある場合は先頭スライドが機能を説明するため、同じ内容の見出しを重ねない。
 */
export const hasSlideForTrigger = (trigger: ProTrigger): boolean =>
  SLIDE_KEY_BY_TRIGGER[trigger] !== undefined;

const AUTO_ADVANCE_INTERVAL = 5000;

const ART_BY_KEY: Record<PaywallSlideKey, () => React.JSX.Element> = {
  hit_direction: HitDirectionArt,
  count_situation: CountSituationArt,
  pitch_course: PitchCourseArt,
  season_trend: SeasonTrendArt,
  no_ads: NoAdsArt,
};

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
 *
 * 図はすべて作り物のイラストで、ユーザー本人の成績は一切描かない。
 * 未加入のまま Paywall で本物の分析が見えてしまうことを防ぐため。
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
        {slides.map((slide) => {
          const Art = ART_BY_KEY[slide.key];
          return (
            <View
              key={slide.key}
              style={[styles.slide, { width: slideWidth }]}
              accessibilityLabel={slide.title.replace("\n", "")}
            >
              <Art />
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          );
        })}
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
  slideTitle: {
    color: "#F4F4F4",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 32,
    marginTop: 12,
  },
  slideDescription: {
    color: "#D4D4D4",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  dots: {
    flexDirection: "row",
    alignSelf: "center",
    gap: 6,
    marginTop: 16,
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
