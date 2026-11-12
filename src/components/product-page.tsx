"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, Lock, Minus, Plus } from "lucide-react";
import { PayWithCredo } from "@/components/pay-with-credo";
import { PayWithRedirect, useRedirectCancelledToast } from "@/components/pay-with-redirect";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { IS_SANDBOX } from "@/lib/credo";
import { formatNaira, product } from "@/lib/product";
import { cn } from "@/lib/utils";

const checkoutOptions = [
  { id: "popup", label: "Popup", hint: "Credo's checkout opens on top of this page." },
  { id: "redirect", label: "Redirect", hint: "You'll be taken to Credo's hosted payment page and back." },
] as const;

export function ProductPage() {
  const [checkout, setCheckout] = useState<(typeof checkoutOptions)[number]["id"]>("popup");
  // Came back from Credo's hosted page with Back? Toast it and keep "Redirect" selected.
  useRedirectCancelledToast(() => setCheckout("redirect"));
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const total = product.price * quantity;
  const ready = !!size && !!firstName.trim() && !!lastName.trim() && /\S+@\S+\.\S+/.test(email);

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-8 md:grid-cols-2 md:py-12 lg:gap-16">
      {/* Gallery */}
      <div className="space-y-3 md:sticky md:top-24 md:self-start">
        <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-muted">
          <Image
            src={color.image}
            alt={`${product.name} in ${color.name}`}
            fill
            priority
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex gap-3">
          {product.colors.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(c)}
              aria-label={`Show ${c.name}`}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-lg bg-muted ring-offset-2 ring-offset-background transition",
                c.id === color.id ? "ring-2 ring-primary" : "opacity-70 hover:opacity-100",
              )}
            >
              <Image src={c.image} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Details + checkout */}
      <div className="space-y-8">
        <div className="space-y-3">
          <Badge variant="secondary">New drop</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1>
          <p className="text-2xl">{formatNaira(product.price)}</p>
          <p className="leading-relaxed text-muted-foreground">{product.description}</p>
        </div>

        <div className="space-y-6">
          <Field label="Colour" value={color.name}>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c)}
                  aria-label={c.name}
                  aria-pressed={c.id === color.id}
                  style={{ backgroundColor: c.swatch }}
                  className={cn(
                    "size-9 border ring-offset-2 ring-offset-background transition",
                    c.id === color.id && "ring-2 ring-primary",
                  )}
                />
              ))}
            </div>
          </Field>

          <Field label="Size" value={size}>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((s) => (
                <Button
                  key={s}
                  variant={s === size ? "default" : "outline"}
                  aria-pressed={s === size}
                  onClick={() => setSize(s)}
                  className="h-11"
                >
                  {s}
                </Button>
              ))}
            </div>
          </Field>

          <Field label="Quantity">
            <div className="flex w-fit items-center rounded-lg border">
              <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                <Minus />
              </Button>
              <span className="w-10 text-center tabular-nums">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity((q) => Math.min(10, q + 1))} aria-label="Increase quantity">
                <Plus />
              </Button>
            </div>
          </Field>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="font-medium">Your details</h2>
          <div className="grid grid-cols-2 gap-3">
            <TextField id="first" label="First name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
            <TextField id="last" label="Last name" value={lastName} onChange={setLastName} autoComplete="family-name" />
          </div>
          <TextField id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />

          <Field label="Checkout">
            <div className="grid grid-cols-2 gap-2">
              {checkoutOptions.map((o) => (
                <Button
                  key={o.id}
                  variant={o.id === checkout ? "default" : "outline"}
                  aria-pressed={o.id === checkout}
                  onClick={() => setCheckout(o.id)}
                  className="h-10"
                >
                  {o.label}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{checkoutOptions.find((o) => o.id === checkout)?.hint}</p>
          </Field>

          {checkout === "popup" ? (
            <PayWithCredo
              amount={total}
              email={email}
              firstName={firstName}
              lastName={lastName}
              disabled={!ready}
              metadata={{ product: product.name, colour: color.name, size: size ?? "", quantity }}
            />
          ) : (
            <PayWithRedirect
              amount={total}
              disabled={!ready}
              order={{ colorId: color.id, size: size ?? "", quantity, firstName, lastName, email }}
            />
          )}
          {!size && <p className="text-center text-sm text-muted-foreground">Select a size to continue</p>}
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

        <ul className="space-y-2 text-sm text-muted-foreground">
          {product.details.map((d) => (
            <li key={d} className="flex items-center gap-2">
              <Check className="size-4 text-foreground" /> {d}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium">
        {label}
        {value && <span className="font-normal text-muted-foreground"> — {value}</span>}
      </p>
      {children}
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
