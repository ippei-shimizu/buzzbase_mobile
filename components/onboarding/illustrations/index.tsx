import type { OnboardingIllustration } from "@constants/onboarding";
import React from "react";
import { AutoCalcIllustration } from "./AutoCalcIllustration";
import { GrowthIllustration } from "./GrowthIllustration";
import { RankingIllustration } from "./RankingIllustration";

const ILLUSTRATIONS: Record<
  OnboardingIllustration,
  ({ size }: { size?: number }) => React.JSX.Element
> = {
  autoCalc: AutoCalcIllustration,
  ranking: RankingIllustration,
  growth: GrowthIllustration,
};

interface Props {
  name: OnboardingIllustration;
  size?: number;
}

export const OnboardingIllustrationView = ({ name, size }: Props) => {
  const Illustration = ILLUSTRATIONS[name];
  return <Illustration size={size} />;
};
