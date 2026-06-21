import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingSlide } from "@components/onboarding/OnboardingSlide";
import { PageIndicator } from "@components/onboarding/PageIndicator";
import { Button } from "@components/ui/Button";
import { ONBOARDING_STEPS } from "@constants/onboarding";
import { useAuth } from "@hooks/useAuth";
import { useOnboarding } from "@hooks/useOnboarding";

export default function OnboardingWelcome() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { complete } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const isLastStep = pageIndex === ONBOARDING_STEPS.length - 1;

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    setPageIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  const goToPage = (index: number) => {
    const clamped = Math.max(0, Math.min(index, ONBOARDING_STEPS.length - 1));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setPageIndex(clamped);
  };

  const finish = async () => {
    await complete();
    router.replace(isLoggedIn ? "/(tabs)" : "/(auth)/sign-up");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        {pageIndex > 0 ? (
          <TouchableOpacity
            onPress={() => goToPage(pageIndex - 1)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="前のステップに戻る"
          >
            <Ionicons name="chevron-back" size={26} color="#F4F4F4" />
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          onPress={finish}
          hitSlop={8}
          accessibilityRole="button"
        >
          <Text style={styles.skipText}>スキップ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.scroll}
      >
        {ONBOARDING_STEPS.map((step) => (
          <OnboardingSlide key={step.illustration} width={width} step={step} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <PageIndicator
          count={ONBOARDING_STEPS.length}
          activeIndex={pageIndex}
        />
        {isLastStep ? (
          <Button title="はじめる" onPress={finish} style={styles.cta} />
        ) : (
          <Button
            title="次へ"
            onPress={() => goToPage(pageIndex + 1)}
            style={styles.cta}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E2E2E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 44,
  },
  skipText: {
    color: "#A1A1AA",
    fontSize: 15,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 24,
  },
  cta: {
    alignSelf: "stretch",
  },
});
