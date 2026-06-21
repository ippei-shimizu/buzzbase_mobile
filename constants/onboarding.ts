export type OnboardingIllustration = "autoCalc" | "ranking" | "growth";

export interface OnboardingStep {
  illustration: OnboardingIllustration;
  title: string;
  copy: string;
}

// 業界平均に合わせ3ステップを上限とする（5以上は離脱増）。順序が表示順。
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    illustration: "autoCalc",
    title: "打席を入力するだけで自動計算",
    copy: "もう自分で電卓を叩かなくていい。打率・OPS・防御率など29指標を自動で算出します。",
  },
  {
    illustration: "ranking",
    title: "チームメイトとランキングで競う",
    copy: "友達と打率を競い合おう。グループ内ランキングでモチベーションが続きます。",
  },
  {
    illustration: "growth",
    title: "成長を1枚のグラフで",
    copy: "成績の推移をグラフで振り返り。自分の成長が一目でわかります。",
  },
] as const;
