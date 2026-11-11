"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { PayWithCredo } from "@/components/pay-with-credo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { IS_SANDBOX } from "@/lib/credo";
import { formatNaira, products } from "@/lib/products";

export default function Store() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart(({ [id]: qty = 0, ...rest }) => (qty > 1 ? { ...rest, [id]: qty - 1 } : rest));

  const lines = products.filter((p) => cart[p.id]);
  const itemCount = lines.reduce((n, p) => n + cart[p.id], 0);
  const total = lines.reduce((sum, p) => sum + p.price * cart[p.id], 0);
  const formValid = /\S+@\S+\.\S+/.test(email) && !!firstName.trim() && !!lastName.trim();

  return (
    <div className="flex-1 pb-24 lg:pb-0">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold tracking-tight">DevDrip.</span>
          {IS_SANDBOX && <Badge variant="secondary">Sandbox mode</Badge>}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1fr_380px]">
        <section>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Merch for people who ship.</h1>
          <p className="mt-1 text-muted-foreground">Pick something, pay with Credo, done.</p>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {products.map((p) => (
              <Card key={p.id} className="pt-0">
                <div className="flex aspect-square items-center justify-center bg-muted text-6xl">{p.emoji}</div>
                <CardHeader>
                  <CardTitle>{p.name}</CardTitle>
                  <CardDescription>{p.tagline}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto justify-between">
                  <span className="font-semibold">{formatNaira(p.price)}</span>
                  <Button size="sm" onClick={() => add(p.id)}>
                    <Plus /> Add
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <aside id="checkout" className="h-fit space-y-4 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-4" /> Your bag
                {itemCount > 0 && <Badge variant="secondary">{itemCount}</Badge>}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {lines.length === 0 ? (
                <p className="text-muted-foreground">Empty. Add something nice.</p>
              ) : (
                <ul className="space-y-2">
                  {lines.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2">
                      <span className="truncate">
                        {p.emoji} {p.name}
                      </span>
                      <span className="flex shrink-0 items-center gap-1">
                        <Button variant="outline" size="icon-xs" onClick={() => remove(p.id)} aria-label={`Remove one ${p.name}`}>
                          <Minus />
                        </Button>
                        <span className="w-5 text-center tabular-nums">{cart[p.id]}</span>
                        <Button variant="outline" size="icon-xs" onClick={() => add(p.id)} aria-label={`Add one ${p.name}`}>
                          <Plus />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <Separator />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

              <PayWithCredo
                amount={total}
                email={email}
                firstName={firstName}
                lastName={lastName}
                disabled={total === 0 || !formValid}
              />
            </CardContent>
          </Card>

          {IS_SANDBOX && (
            <Alert>
              <AlertTitle>Test card (sandbox)</AlertTitle>
              <AlertDescription>
                <p className="font-mono">5200 0000 0000 2151</p>
                <p>Any future expiry · any CVV · PIN 1111 · OTP 123456</p>
              </AlertDescription>
            </Alert>
          )}
        </aside>
      </main>

      {itemCount > 0 && (
        <div className="fixed inset-x-4 bottom-4 lg:hidden">
          <Button size="lg" className="w-full shadow-lg" render={<a href="#checkout" />} nativeButton={false}>
            Checkout · {formatNaira(total)}
          </Button>
        </div>
      )}
    </div>
  );
}
