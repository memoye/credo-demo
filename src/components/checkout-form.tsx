"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { PayWithCredo } from "@/components/pay-with-credo";
import { PayWithRedirect, useRedirectCancelledToast } from "@/components/pay-with-redirect";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { IS_SANDBOX } from "@/lib/credo";
import { formatNaira, product } from "@/lib/product";

const checkoutOptions = [
  { id: "popup", label: "Popup", hint: "Credo's checkout opens on top of this page." },
  { id: "redirect", label: "Redirect", hint: "You'll be taken to Credo's hosted payment page and back." },
] as const;

// Credo's `bearer`: who pays the transaction fee.
const feeOptions = [
  { id: 0, label: "Customer pays", hint: "Credo's fee is added to the customer's total at checkout." },
  { id: 1, label: "We pay", hint: "Credo's fee comes out of what the store receives." },
] as const;

type Props = { colorId: string; size: string; quantity: number };

export function CheckoutForm({ colorId, size, quantity }: Props) {
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];

  const [checkout, setCheckout] = useState<(typeof checkoutOptions)[number]["id"]>("popup");
  // Came back from Credo's hosted page with Back? Toast it and keep "Redirect" selected.
  useRedirectCancelledToast(() => setCheckout("redirect"));
  const [bearer, setBearer] = useState<(typeof feeOptions)[number]["id"]>(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const total = product.price * quantity;
  const ready = !!firstName.trim() && !!lastName.trim() && /\S+@\S+\.\S+/.test(email);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-x-10 gap-y-8 px-4 py-8 md:grid-cols-[1fr_380px] md:py-12 lg:gap-x-16">
      <div className="space-y-3 md:col-span-2">
        <Button variant="link" className="h-auto px-0 text-muted-foreground" render={<Link href="/" />} nativeButton={false}>
          <ArrowLeft /> Back to product
        </Button>
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      </div>

      {/* Order summary — first on mobile, right column on desktop */}
      <aside className="md:sticky md:top-24 md:order-last md:self-start">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-muted">
                <Image src={color.image} alt="" fill sizes="80px" placeholder="blur" className="object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-snug">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {color.name} · {size} · Qty {quantity}
                </p>
              </div>
              <p className="font-medium tabular-nums">{formatNaira(total)}</p>
            </div>
            <Separator />
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatNaira(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Transaction fee</dt>
                <dd>{bearer === 0 ? "Added by Credo" : "Paid by store"}</dd>
              </div>
            </dl>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatNaira(total)}</span>
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Payment form */}
      <section className="space-y-8">
        <div className="space-y-4">
          <h2 className="font-medium">Your details</h2>
          <div className="grid grid-cols-2 gap-3">
            <TextField id="first" label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <TextField id="last" label="Last name" value={lastName} onChange={setLastName} autoComplete="family-name" />
          </div>
          <TextField id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        </div>

        <Accordion className="border px-4">
          <AccordionItem value="more-settings">
            <AccordionTrigger className="py-4 hover:no-underline">
              <span className="flex flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-medium">More settings</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {checkoutOptions.find((o) => o.id === checkout)?.label} ·{" "}
                  {feeOptions.find((o) => o.id === bearer)?.label}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-6 pb-5 [&_p:not(:last-child)]:mb-0">
              <RadioCards label="Checkout" options={checkoutOptions} value={checkout} onChange={setCheckout} />
              <RadioCards label="Transaction fee" options={feeOptions} value={bearer} onChange={setBearer} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-3">
          {checkout === "popup" ? (
            <PayWithCredo
              amount={total}
              email={email}
              firstName={firstName}
              lastName={lastName}
              bearer={bearer}
              disabled={!ready}
              metadata={{ product: product.name, colour: color.name, size, quantity }}
            />
          ) : (
            <PayWithRedirect
              amount={total}
              disabled={!ready}
              order={{ colorId: color.id, size, quantity, firstName, lastName, email, bearer }}
            />
          )}
          <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="size-3.5" /> Payments secured by Credo
          </p>
        </div>

        {IS_SANDBOX && (
          <Alert>
            <AlertTitle>Sandbox — use a test card</AlertTitle>
            <AlertDescription>
              <p className="font-mono">5200 0000 0000 2151</p>
              <p>Any future expiry · any CVV · OTP 1234 (PIN 1111 if asked)</p>
            </AlertDescription>
          </Alert>
        )}
      </section>
    </main>
  );
}

function RadioCards<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string; hint: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-sm font-medium">{label}</p>
      <RadioGroup
        aria-label={label}
        value={value}
        onValueChange={(v) => onChange(v as T)}
        className="grid gap-3 sm:grid-cols-2"
      >
        {options.map((o) => (
          <label
            key={o.id}
            className="flex cursor-pointer items-start gap-3 border p-4 transition-colors hover:bg-muted/60 has-[[data-checked]]:border-primary has-[[data-checked]]:bg-secondary/50"
          >
            <RadioGroupItem value={o.id} className="mt-0.5" />
            <span className="space-y-1">
              <span className="block text-sm font-medium leading-none">{o.label}</span>
              <span className="block text-sm text-muted-foreground">{o.hint}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}

function TextField({
  id,
  label,
  onChange,
  ...props
}: { id: string; label: string; value: string; type?: string; autoComplete?: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-10" onChange={(e) => onChange(e.target.value)} {...props} />
    </div>
  );
}
