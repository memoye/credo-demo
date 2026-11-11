"use client";

import { useState } from "react";
import { PayWithCredo } from "@/components/pay-with-credo";
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
  const formValid = /\S+@\S+\.\S+/.test(email) && firstName.trim() && lastName.trim();

  return (
    <div className="flex-1">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <span className="text-xl font-black tracking-tight">DevDrip<span className="text-violet-600">.</span></span>
          {IS_SANDBOX && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Sandbox mode</span>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1fr_380px]">
        <section>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Merch for people who ship.</h1>
          <p className="mt-2 text-zinc-600">Pick something, pay with Credo, done.</p>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {products.map((p) => (
              <article key={p.id} className="flex flex-col rounded-2xl border border-zinc-200 p-3">
                <div className={`flex aspect-square items-center justify-center rounded-xl text-6xl ${p.color}`}>{p.emoji}</div>
                <h2 className="mt-3 font-semibold leading-tight">{p.name}</h2>
                <p className="mt-1 flex-1 text-sm text-zinc-500">{p.tagline}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold">{formatNaira(p.price)}</span>
                  <button
                    onClick={() => add(p.id)}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700"
                  >
                    Add
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside id="checkout" className="h-fit rounded-2xl border border-zinc-200 p-5 lg:sticky lg:top-6">
          <h2 className="text-lg font-bold">Your bag {itemCount > 0 && <span className="text-zinc-400">({itemCount})</span>}</h2>

          {lines.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">Empty. Add something nice.</p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-100">
              {lines.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {p.emoji} {p.name}
                  </span>
                  <span className="flex items-center gap-2">
                    <button onClick={() => remove(p.id)} className="h-6 w-6 rounded border border-zinc-300" aria-label={`Remove one ${p.name}`}>−</button>
                    <span className="w-4 text-center">{cart[p.id]}</span>
                    <button onClick={() => add(p.id)} className="h-6 w-6 rounded border border-zinc-300" aria-label={`Add one ${p.name}`}>+</button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First name" value={firstName} onChange={setFirstName} />
              <Input placeholder="Last name" value={lastName} onChange={setLastName} />
            </div>
            <Input placeholder="Email" type="email" value={email} onChange={setEmail} />
            <PayWithCredo
              amount={total}
              email={email}
              firstName={firstName}
              lastName={lastName}
              disabled={total === 0 || !formValid}
            />
          </div>

          {IS_SANDBOX && (
            <div className="mt-5 rounded-xl bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
              <p className="font-semibold text-zinc-800">Test card (sandbox)</p>
              <p className="font-mono">5200 0000 0000 2151</p>
              <p>Any future expiry · any CVV · PIN 1111 · OTP 123456</p>
            </div>
          )}
        </aside>
      </main>

      {itemCount > 0 && (
        <a
          href="#checkout"
          className="fixed inset-x-4 bottom-4 rounded-xl bg-violet-600 py-3 text-center font-semibold text-white shadow-lg lg:hidden"
        >
          Checkout · {formatNaira(total)}
        </a>
      )}
    </div>
  );
}

function Input({ onChange, ...props }: { placeholder: string; value: string; type?: string; onChange: (v: string) => void }) {
  return (
    <input
      {...props}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-900"
    />
  );
}
