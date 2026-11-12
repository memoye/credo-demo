"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CREDO_SCRIPT_URL } from "@/lib/credo";
import { formatNaira } from "@/lib/product";

// The Credo inline script adds `CredoWidget` to window.
declare global {
  interface Window {
    CredoWidget?: {
      setup(options: Record<string, unknown>): { openIframe(): void };
    };
  }
}

type Props = {
  amount: number; // in Naira
  email: string;
  firstName: string;
  lastName: string;
  metadata?: Record<string, string | number>;
  disabled?: boolean;
};

export function PayWithCredo({ amount, email, firstName, lastName, metadata = {}, disabled }: Props) {
  const router = useRouter();
  const [scriptReady, setScriptReady] = useState(false);
  const [paying, setPaying] = useState(false);

  function pay() {
    if (!window.CredoWidget) return;
    setPaying(true);

    // Our own order reference. Credo's verify endpoint accepts it, so we never
    // depend on what the popup hands back.
    const reference = `DEMO${Date.now()}${Math.floor(Math.random() * 1000)}`; // alphanumeric only
    const successUrl = `/success?reference=${reference}`;

    const handler = window.CredoWidget.setup({
      key: process.env.NEXT_PUBLIC_CREDO_PUBLIC_KEY, // public key — safe in the browser
      email,
      customerFirstName: firstName,
      customerLastName: lastName,
      amount: Math.round(amount * 100), // Credo wants the lowest unit: kobo
      currency: "NGN",
      reference,
      callbackUrl: `${window.location.origin}${successUrl}`,

      // Your own order data travels with the payment.
      metadata: {
        customFields: Object.entries(metadata).map(([key, value]) => ({
          variable_name: key,
          value: String(value),
          display_name: key[0].toUpperCase() + key.slice(1),
        })),
      },

      onClose: () => setPaying(false),

      // Payment finished in the popup. Don't trust the browser —
      // go to /success, which verifies the reference on the server.
      callBack: () => router.push(successUrl),
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
