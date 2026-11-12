import { ProductPage } from "@/components/product-page";

// Checkout opens Credo's inline popup on top of this page.
export default function PopupCheckout() {
  return <ProductPage checkout="popup" />;
}
