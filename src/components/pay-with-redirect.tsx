"use client";

import { useState, useTransition } from "react";
import { startCheckout, type Order } from "@/app/redirect/actions";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/product";

type Props = { order: Order; amount: number; disabled?: boolean };

export function PayWithRedirect({ order, amount, disabled }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function pay() {
    setError(undefined);
    startTransition(async () => {
      // On success the server action redirects to Credo, so this only returns on failure.
      const result = await startCheckout(order);
      if (result?.error) setError(result.error);
    });
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
