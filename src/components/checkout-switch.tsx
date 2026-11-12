"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const modes = [
  { href: "/", label: "Popup" },
  { href: "/redirect", label: "Redirect" },
];

// Lets the presenter flip between the two Credo checkout styles.
export function CheckoutSwitch() {
  const pathname = usePathname();

  return (
    <nav aria-label="Checkout style" className="flex border text-sm">
      {modes.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          aria-current={pathname === m.href ? "page" : undefined}
          className={cn(
            "px-3 py-1.5 font-medium transition-colors",
            pathname === m.href ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {m.label}
        </Link>
      ))}
    </nav>
  );
}
