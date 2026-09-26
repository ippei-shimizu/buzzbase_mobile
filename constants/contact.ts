/** お問い合わせ画面にご意見・ご要望用のバナーを出すときの `subject` の値。 */
export const FEEDBACK_CONTACT_SUBJECT = "feedback";

/** ご意見・ご要望としてお問い合わせ画面を開く遷移先。 */
export const FEEDBACK_CONTACT_ROUTE = {
  pathname: "/(profile)/contact",
  params: { subject: FEEDBACK_CONTACT_SUBJECT },
} as const;
