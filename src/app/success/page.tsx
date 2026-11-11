import Link from "next/link";
import { Suspense } from "react";
import { CREDO_API_URL } from "@/lib/credo";
import { formatNaira } from "@/lib/products";

type CredoTransaction = {
  transRef: string;
  businessRef: string;
  transAmount: number;
  transFeeAmount: number;
  currencyCode: string;
  customerId: string;
  transactionDate: string;
  status: number; // 0 = successful
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function SuccessPage({ searchParams }: PageProps<"/success">) {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center text-zinc-500">Verifying payment with Credo…</main>
      }
    >
      <VerifiedResult searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifiedResult({ searchParams }: Pick<PageProps<"/success">, "searchParams">) {
  const params = await searchParams;
  const transRef = first(params.transRef) ?? first(params.trans_ref) ?? first(params.reference);

  if (!transRef) return <Result ok={false} title="No transaction reference" />;

  // 🔐 Runs on the server. The secret key never reaches the browser.
  const res = await fetch(`${CREDO_API_URL}/transaction/${encodeURIComponent(transRef)}/verify`, {
    headers: { Authorization: process.env.CREDO_SECRET_KEY! },
    cache: "no-store",
  });
  const body = await res.json().catch(() => null);
  const tx: CredoTransaction | undefined = body?.data;

  const paid = res.ok && tx?.status === 0;

  return (
    <Result
      ok={paid}
      title={paid ? "Payment confirmed 🎉" : "Payment not confirmed"}
      subtitle={
        paid
          ? `${formatNaira(tx!.transAmount)} received from ${tx!.customerId}`
          : body?.message ?? `Credo returned HTTP ${res.status}`
      }
      raw={body}
    />
  );
}

function Result({ ok, title, subtitle, raw }: { ok: boolean; title: string; subtitle?: string; raw?: unknown }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-4 py-16">
      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl ${ok ? "bg-emerald-100" : "bg-rose-100"}`}>
        {ok ? "✓" : "✕"}
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-2 text-zinc-600">{subtitle}</p>}

      {raw !== undefined && (
        <details className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4" open>
          <summary className="cursor-pointer text-sm font-medium text-zinc-700">
            Server-side verify response from Credo
          </summary>
          <pre className="mt-3 overflow-x-auto text-xs leading-relaxed text-zinc-800">{JSON.stringify(raw, null, 2)}</pre>
        </details>
      )}

      <Link href="/" className="mt-8 inline-block font-semibold text-zinc-900 underline underline-offset-4">
        ← Back to the store
      </Link>
    </main>
  );
}
