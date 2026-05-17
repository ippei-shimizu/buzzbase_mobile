import type { Feature } from "../../types/pro";
import { useState, type ReactNode } from "react";
import { PaywallModal } from "@components/pro/PaywallModal";
import { useEntitlement } from "@hooks/useEntitlement";

interface ProGateProps {
  feature: Feature;
  children: ReactNode;
  /**
   * Pro 未加入時に children の代わりに表示する静的ノード。
   * renderLockedTrigger と排他で使う想定（同時指定なら renderLockedTrigger を優先）。
   */
  fallback?: ReactNode;
  /**
   * タップで PaywallModal を開けるロックトリガーをレンダリングする関数。
   * 指定された場合のみ PaywallModal を Modal ツリーに用意する。
   */
  renderLockedTrigger?: (open: () => void) => ReactNode;
}

/**
 * Pro 機能をラップし、entitlement を持つときのみ children を表示する。
 * 未許可時の代替表示は renderLockedTrigger / fallback / なし の3パターン。
 */
export function ProGate({
  feature,
  children,
  fallback,
  renderLockedTrigger,
}: ProGateProps) {
  const { hasEntitlement, isLoading } = useEntitlement();
  const [isPaywallOpen, setPaywallOpen] = useState(false);

  // Pro 状態の初回取得中は判定不能なので、locked UI を一瞬出さないために何も描画しない。
  // 認可済み children も locked fallback も誤って表示しないことを優先する。
  if (isLoading) return null;

  if (hasEntitlement(feature)) return <>{children}</>;

  if (renderLockedTrigger) {
    return (
      <>
        {renderLockedTrigger(() => setPaywallOpen(true))}
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setPaywallOpen(false)}
          feature={feature}
        />
      </>
    );
  }

  return <>{fallback ?? null}</>;
}
