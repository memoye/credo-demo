export type Product = {
  id: string;
  name: string;
  tagline: string;
  price: number; // in Naira
  emoji: string;
  color: string;
};

export const products: Product[] = [
  { id: "hoodie", name: "Ship It Hoodie", tagline: "Heavyweight. Deploys on Fridays.", price: 25000, emoji: "🧥", color: "bg-violet-100" },
  { id: "tee", name: "Works On My Machine Tee", tagline: "100% cotton, 0% reproducible.", price: 12000, emoji: "👕", color: "bg-amber-100" },
  { id: "cap", name: "404 Cap", tagline: "Hair not found.", price: 8000, emoji: "🧢", color: "bg-sky-100" },
  { id: "mug", name: "git commit -m \"coffee\"", tagline: "Holds 350ml of fuel.", price: 6500, emoji: "☕", color: "bg-rose-100" },
  { id: "tote", name: "node_modules Tote", tagline: "Surprisingly heavy.", price: 5000, emoji: "👜", color: "bg-emerald-100" },
  { id: "stickers", name: "Sticker Pack", tagline: "For the laptop lid.", price: 2000, emoji: "✨", color: "bg-orange-100" },
];

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
