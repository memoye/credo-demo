import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";
import { parseSelection } from "@/lib/product";

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <Checkout searchParams={searchParams} />
    </Suspense>
  );
}

async function Checkout({ searchParams }: Pick<PageProps<"/checkout">, "searchParams">) {
  const params = await searchParams;
  const selection = parseSelection({ colour: first(params.colour), size: first(params.size), qty: first(params.qty) });

  // Bad or missing selection (e.g. someone opened /checkout directly) — back to the product.
  if (!selection) redirect("/");

  return <CheckoutForm colorId={selection.color.id} size={selection.size} quantity={selection.quantity} />;
}
