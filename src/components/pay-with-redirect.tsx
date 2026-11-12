"use client";

import { useEffect, useState } from "react";
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
    // On success the server action redirects to Credo, so this only returns on failure.
    const result = await startCheckout(order);
    if (result?.error) {
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
