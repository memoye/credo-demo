import type { StaticImageData } from "next/image";
import sand from "../../public/products/hoodie-sand.jpg";
import black from "../../public/products/hoodie-black.jpg";

// Photos: Unsplash (free to use under the Unsplash License).
export const product = {
  name: "Everyday Heavyweight Hoodie",
  price: 28000, // in Naira
  description:
    "Brushed 400gsm cotton fleece, a relaxed fit and a hood that actually holds its shape. Made to be worn on repeat.",
  colors: [
    { id: "sand", name: "Sand", swatch: "#cbbba9", image: sand },
    { id: "black", name: "Black", swatch: "#1c1c1c", image: black },
  ] satisfies { id: string; name: string; swatch: string; image: StaticImageData }[],
  sizes: ["S", "M", "L", "XL", "XXL"],
  details: ["400gsm brushed cotton fleece", "Relaxed fit — size down for a closer cut", "Ships in 3–5 working days"],
};

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);

export const MAX_QUANTITY = 10;

// The product page passes the selection to /checkout in the URL. Check it before trusting it.
export function parseSelection(input: { colour?: string; size?: string; qty?: string | number }) {
  const color = product.colors.find((c) => c.id === input.colour);
  const size = product.sizes.find((s) => s === input.size);
  const quantity = Math.trunc(Number(input.qty));
  if (!color || !size || !(quantity >= 1 && quantity <= MAX_QUANTITY)) return null;
  return { color, size, quantity };
}

export const checkoutHref = (colour: string, size: string, qty: number) =>
  `/checkout?${new URLSearchParams({ colour, size, qty: String(qty) })}`;
