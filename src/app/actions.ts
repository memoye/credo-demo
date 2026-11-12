"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CREDO_API_URL, newReference, toCredoMetadata } from "@/lib/credo";
import { parseSelection, product } from "@/lib/product";

export type Order = {
  colorId: string;
  size: string;
  quantity: number;
  firstName: string;
  lastName: string;
  email: string;
  bearer: 0 | 1; // who pays Credo's fee: 0 = customer, 1 = merchant
};

export async function startCheckout(order: Order): Promise<{ error: string }> {
  const selection = parseSelection({ colour: order.colorId, size: order.size, qty: order.quantity });
  if (!selection) return { error: "Invalid order" };
  const { color, quantity } = selection;

  // The price is worked out here on the server — the browser can't tamper with it.
  const amount = product.price * quantity;
  const reference = newReference();

  const h = await headers();
  const origin = h.get("origin") ?? `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  // 1. Ask Credo to start a transaction.
  const res = await fetch(`${CREDO_API_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: process.env.NEXT_PUBLIC_CREDO_PUBLIC_KEY!, // initialize uses the public key
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amount * 100, // kobo
      currency: "NGN",
      email: order.email,
      customerFirstName: order.firstName,
      customerLastName: order.lastName,
      reference,
      callbackUrl: `${origin}/success?reference=${reference}`, // where Credo sends the customer back
      bearer: order.bearer === 1 ? 1 : 0,
      channels: ["CARD", "BANK"],
      metadata: toCredoMetadata({ product: product.name, colour: color.name, size: order.size, quantity }),
    }),
  });
  const body = await res.json().catch(() => null);
  const authorizationUrl: unknown = body?.data?.authorizationUrl;

  if (!res.ok || typeof authorizationUrl !== "string") {
    return { error: body?.message ?? `Credo returned HTTP ${res.status}` };
  }

  // 2. Send the customer to Credo's hosted payment page.
  redirect(authorizationUrl);
}
