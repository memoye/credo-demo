"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { CredoWidget, FeeBearer } from "credo-types";
import { Button } from "@/components/ui/button";
import { CREDO_SCRIPT_URL, newReference, toCredoMetadata } from "@/lib/credo";
import { formatNaira } from "@/lib/product";

// Credo's inline.js adds `CredoWidget` to window — typed by credo-types.
declare global {
  interface Window {
    CredoWidget?: CredoWidget;
  }
}

type Props = {
  amount: number; // in Naira
  email: string;
  firstName: string;
  lastName: string;
  bearer: FeeBearer; // who pays Credo's fee: 0 = customer, 1 = merchant
  metadata?: Record<string, string | number>;
  disabled?: boolean;
};

export function PayWithCredo({ amount, email, firstName, lastName, bearer, metadata = {}, disabled }: Props) {
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const [paying, setPaying] = useState(false);

  function pay() {
    if (!window.CredoWidget) return;
    setPaying(true);

    // Our own order reference. Credo's verify endpoint accepts it, so we never
    // depend on what the popup hands back.
    const reference = newReference();
    const successUrl = `/success?reference=${reference}`;

    const handler = window.CredoWidget.setup({
      key: process.env.NEXT_PUBLIC_CREDO_PUBLIC_KEY!, // public key — safe in the browser
      email,
      customerFirstName: firstName,
      customerLastName: lastName,
      amount: Math.round(amount * 100), // Credo wants the lowest unit: kobo
      currency: "NGN",
      bearer,
      reference,
      callbackUrl: `${window.location.origin}${successUrl}`,

      // Your own order data travels with the payment.
      metadata: toCredoMetadata(metadata),

      // Customer cancelled inside the popup.
      onClose: () => {
        setPaying(false);
        toast.info("Payment cancelled", { description: "No money was taken. You can try again any time." });
      },

      // Payment finished in the popup. Don't trust the browser —
      // go to /success, which verifies the reference on the server.
      callBack: () => {
        // Next keeps this page alive in the background (cacheComponents), so reset
        // the button now or it's still "paying" when the customer comes back.
        setPaying(false);
        router.push(successUrl);
      },
    });

    handler.openIframe();
  }

  return (
    <>
      <Script src={CREDO_SCRIPT_URL} onReady={() => setScriptReady(true)} />
      <Button size="lg" className="h-12 w-full text-base" onClick={pay} disabled={disabled || !scriptReady || paying}>
        {!scriptReady ? "Loading checkout…" : paying ? "Complete payment in popup…" : `Pay ${formatNaira(amount)}`}
      </Button>
    </>
  );
}
