"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";
import { startCheckout, type Order } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/product";

type Props = { order: Order; amount: number; disabled?: boolean };

export function PayWithRedirect({ order, amount, disabled }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  // If the customer hits Back on Credo's page, the browser may restore this page
  // from its cache exactly as they left it — still "redirecting". Reset it.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => e.persisted && setPending(false);
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function pay() {
    setError(undefined);
    setPending(true);
    pendingRedirect.set();
    // On success the server action redirects to Credo, so this only returns on failure.
    const result = await startCheckout(order);
    if (result?.error) {
      pendingRedirect.clear();
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <>
      <Button size="lg" className="h-12 w-full text-base" onClick={pay} disabled={disabled || pending}>
        {pending ? "Redirecting to Credo…" : `Pay ${formatNaira(amount)}`}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </>
  );
}

// Credo's hosted page has no cancel button — customers cancel by pressing Back.
// We remember that we sent them to Credo, and if they come back with Back
// (instead of finishing on /success) we tell them the payment was cancelled.
const KEY = "credo:redirect-pending";
const pendingRedirect = {
  set: () => { try { sessionStorage.setItem(KEY, "1"); } catch {} },
  clear: () => { try { sessionStorage.removeItem(KEY); } catch {} },
  take: () => {
    try {
      const was = sessionStorage.getItem(KEY) === "1";
      sessionStorage.removeItem(KEY);
      return was;
    } catch {
      return false;
    }
  },
};

export function useRedirectCancelledToast(onCancelled?: () => void) {
  const handleReturn = useEffectEvent((cameBack: boolean) => {
    if (!cameBack || !pendingRedirect.take()) return;
    onCancelled?.();
    toast.info("Payment cancelled", { description: "You left Credo's payment page. No money was taken." });
  });

  useEffect(() => {
    // Back without the page cache: the page reloads as a "back_forward" navigation.
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    handleReturn(nav?.type === "back_forward");
    // Back with the page cache: the old page is restored and fires `pageshow`.
    const onPageShow = (e: PageTransitionEvent) => handleReturn(e.persisted);
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);
}

// Rendered on /success: the customer finished on Credo, so it wasn't a cancellation.
export function ForgetPendingRedirect() {
  useEffect(() => pendingRedirect.clear(), []);
  return null;
}
