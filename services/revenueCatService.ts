/**
 * RevenueCat SDK (react-native-purchases) の薄いラッパー。
 * configure 未実行時は logIn / logOut / 各取得系を no-op or null フォールバックにすることで、
 * 開発環境（API key 未設定）でクラッシュさせず、テストもしやすくする。
 */
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";

let configured = false;

/**
 * SDK を初期化する。
 * @param apiKey RevenueCat の Public API key（iOS / Android で別物）
 * 二重初期化は内部 flag で防ぐが、SDK 側も configure 自体は idempotent。
 */
export function configureRevenueCat(apiKey: string): void {
  if (configured) return;
  Purchases.configure({ apiKey });
  configured = true;
}

/**
 * アプリ起動後にユーザーがログインしたタイミングで呼ぶ。
 * back の UserResolver は app_user_id → User.id の文字列で解決するため、必ず `String(user.id)` を渡す。
 */
export async function loginRevenueCat(userId: string): Promise<void> {
  if (!configured) return;
  await Purchases.logIn(userId);
}

export async function logoutRevenueCat(): Promise<void> {
  if (!configured) return;
  await Purchases.logOut();
}

/** 現在の Offering（プラン一覧）を取得。未設定時は null。 */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!configured) return null;
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

/** RevenueCat 上の最新顧客情報（active entitlements 等）を取得。 */
export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!configured) return null;
  return Purchases.getCustomerInfo();
}

/**
 * App Store / Google Play の購入フローを起動する。
 * 成功時は購入後の CustomerInfo を返す。キャンセル時は SDK が `userCancelled: true` の例外を投げるため、
 * 呼び出し側で catch して UI 制御する想定（ここではそのまま re-throw）。
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return customerInfo;
}

// テスト用: テスト間で configured 状態をリセットするためだけに export。
export function __resetConfiguredForTest(): void {
  configured = false;
}
