"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import { Field } from "@/components/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { checkoutHref, formatNaira, MAX_QUANTITY, product } from "@/lib/product";
import { cn } from "@/lib/utils";

export function ProductPage() {
  const router = useRouter();
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string>();
  const [quantity, setQuantity] = useState(1);

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

      {/* Details */}
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                aria-label="Increase quantity"
              >
                <Plus />
              </Button>
            </div>
          </Field>
        </div>

        <div className="space-y-2">
          <Button
            size="lg"
            className="h-12 w-full text-base"
            disabled={!size}
            onClick={() => size && router.push(checkoutHref(color.id, size, quantity))}
          >
            Continue to checkout · {formatNaira(product.price * quantity)} <ArrowRight />
          </Button>
          {!size && <p className="text-center text-sm text-muted-foreground">Select a size to continue</p>}
        </div>

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
