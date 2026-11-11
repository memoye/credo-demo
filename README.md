# Common Thread — Credo inline checkout demo

A single-product Next.js store that takes payments with the [Credo](https://docs.credocentral.com) inline popup.

The whole integration is two files:

| File | What it does |
| --- | --- |
| `src/components/pay-with-credo.tsx` | Loads Credo's `inline.js`, opens the popup with `CredoWidget.setup(...).openIframe()` |
| `src/app/success/page.tsx` | **Server-side** verify: `GET /transaction/{transRef}/verify` with your secret key. Payment is only "confirmed" if Credo says `status: 0` |

Everything else is just a product page (shadcn/ui). Product data lives in `src/lib/product.ts`; photos are from Unsplash.

## Run it

```bash
cp .env.example .env.local   # add your sandbox keys (Credo dashboard → Settings → Developer → API Keys)
pnpm install
pnpm dev
```

Sandbox test card: `5200 0000 0000 2151`, any future expiry, any CVV, PIN `1111`, OTP `123456`.

## Deploy (Vercel)

Import the repo in Vercel and add the same three env vars from `.env.example`. No database needed.

## Why verify on the server?

The popup's `callBack` runs in the browser — anyone can fake it. The success page re-checks the
transaction with Credo using the **secret key** (which never leaves the server) before showing "confirmed".

In production you'd also listen for Credo **webhooks** (`transaction.successful`) so orders are
confirmed even if the customer closes the tab.
