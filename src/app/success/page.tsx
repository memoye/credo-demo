import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, CircleCheck, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDO_API_URL } from "@/lib/credo";
import { formatNaira } from "@/lib/product";

type CredoTransaction = {
  transRef: string;
  businessRef: string;
  transAmount: number;
  transFeeAmount: number;
  currencyCode: string;
  customerId: string;
  transactionDate: string;
  status: number; // 0 = successful
  statusMessage?: string;
};

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function SuccessPage({ searchParams }: PageProps<"/success">) {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center text-muted-foreground">Verifying payment with Credo…</main>
      }
    >
      <VerifiedResult searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifiedResult({ searchParams }: Pick<PageProps<"/success">, "searchParams">) {
  const params = await searchParams;
  // Our own reference (or Credo's transRef). Keep only the alphanumeric part in case
  // anything gets appended to the callback URL.
  const ref = (first(params.reference) || first(params.transRef) || "").match(/^[A-Za-z0-9]+/)?.[0];

  if (!ref) return <Result ok={false} title="No transaction reference" />;

  // 🔐 Runs on the server. The secret key never reaches the browser.
  const res = await fetch(`${CREDO_API_URL}/transaction/${ref}/verify`, {
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
          : tx?.statusMessage || body?.message || `Credo returned HTTP ${res.status}`
      }
      raw={body}
    />
  );
}

function Result({ ok, title, subtitle, raw }: { ok: boolean; title: string; subtitle?: string; raw?: unknown }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Card>
        <CardHeader>
          {ok ? <CircleCheck className="size-10 text-success" /> : <CircleX className="size-10 text-destructive" />}
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>

        {raw !== undefined && (
          <CardContent>
            <p className="mb-2 font-medium">Server-side verify response from Credo</p>
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">{JSON.stringify(raw, null, 2)}</pre>
          </CardContent>
        )}
      </Card>

      <Button variant="outline" render={<Link href="/" />} nativeButton={false} className="self-start">
        <ArrowLeft /> Back to the store
      </Button>
    </main>
  );
}
