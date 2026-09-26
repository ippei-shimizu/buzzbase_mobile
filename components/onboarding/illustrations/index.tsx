import type { ArtProps } from "@components/pro/paywall/artPrimitives";
import type { OnboardingIllustration } from "@constants/onboarding";
import React from "react";
import { AutoCalcIllustration } from "./AutoCalcIllustration";
import { GrowthIllustration } from "./GrowthIllustration";
import { RankingIllustration } from "./RankingIllustration";

const ILLUSTRATIONS: Record<
  OnboardingIllustration,
  (props: ArtProps) => React.JSX.Element
> = {
  autoCalc: AutoCalcIllustration,
  ranking: RankingIllustration,
  growth: GrowthIllustration,
};

interface Props extends ArtProps {
  name: OnboardingIllustration;
}

export const OnboardingIllustrationView = ({ name, height }: Props) => {
  const Illustration = ILLUSTRATIONS[name];
  return <Illustration height={height} />;
};
