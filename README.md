# Common Thread — Credo checkout demo

A single-product Next.js store that takes payments with [Credo](https://docs.credocentral.com), two ways.
Pick **Popup** or **Redirect** above the Pay button.

| Flow | File | What it does |
| --- | --- | --- |
| Popup | `src/components/pay-with-credo.tsx` | Loads Credo's `inline.js` and opens checkout on top of the page with `CredoWidget.setup(...).openIframe()` |
| Redirect | `src/app/actions.ts` | Server action: works out the price, calls `POST /transaction/initialize`, then redirects to Credo's hosted `authorizationUrl` |
| Both | `src/app/success/page.tsx` | **Server-side** verify: `GET /transaction/{reference}/verify` with your secret key. Payment is only "confirmed" if Credo says `status: 0` |

Both flows use a reference we generate ourselves (`DEMO…`) and verify by that reference, so nothing depends
on what the browser hands back.

Everything else is just a product page (shadcn/ui). Product data lives in `src/lib/product.ts`; photos are from Unsplash.

## Run it

```bash
cp .env.example .env.local   # add your sandbox keys (Credo dashboard → Settings → Developer → API Keys)
pnpm install
pnpm dev
```

Sandbox test card: `5200 0000 0000 2151`, any future expiry, any CVV. The bank screen asks for OTP `1234`
(it's printed on that screen). PIN `1111` if asked.

## Deploy (Vercel)

Import the repo in Vercel and add the same three env vars from `.env.example`. No database needed.

## Why verify on the server?

The popup's `callBack` and the redirect back to your site both happen in the browser — anyone can fake
them. The success page re-checks the transaction with Credo using the **secret key** (which never leaves
the server) before showing "confirmed".

In production you'd also listen for Credo **webhooks** (`transaction.successful`) so orders are
confirmed even if the customer closes the tab.
