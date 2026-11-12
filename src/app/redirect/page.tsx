import { ProductPage } from "@/components/product-page";

// Checkout sends the customer to Credo's hosted payment page and back.
export default function RedirectCheckout() {
  return <ProductPage checkout="redirect" />;
}
