import Link from "next/link";
import { AppWindow, ArrowRight, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const flows = [
  {
    href: "/popup",
    icon: AppWindow,
    title: "Inline popup",
    description: "The customer never leaves your site. Credo's checkout opens in a popup on top of your page.",
    steps: [
      "Load Credo's inline.js",
      "CredoWidget.setup({ … }).openIframe()",
      "Verify the reference on your server",
    ],
    file: "components/pay-with-credo.tsx",
  },
  {
    href: "/redirect",
    icon: ArrowRightLeft,
    title: "Redirect",
    description: "Your server starts the transaction and sends the customer to Credo's hosted payment page, then back.",
    steps: [
      "POST /transaction/initialize from your server",
      "Redirect to the authorizationUrl",
      "Credo returns to your callbackUrl — verify there",
    ],
    file: "app/redirect/actions.ts",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 md:py-20">
      <div className="max-w-2xl space-y-3">
        <Badge variant="secondary">Credo checkout demo</Badge>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Pick a checkout flow</h1>
        <p className="text-lg text-muted-foreground">
          Same hoodie, same server-side verification — two ways to collect the payment.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {flows.map(({ href, icon: Icon, title, description, steps, file }) => (
          <Link key={href} href={href} className="group outline-none">
            <Card className="h-full transition group-hover:ring-primary group-focus-visible:ring-2 group-focus-visible:ring-primary">
              <CardHeader className="gap-3">
                <div className="flex size-11 items-center justify-center bg-secondary text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-xl font-semibold">{title}</CardTitle>
                <CardDescription className="text-base">{description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ol className="space-y-2">
                  {steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm">
                      <span className="flex size-5 shrink-0 items-center justify-center bg-muted text-xs font-medium tabular-nums">
                        {i + 1}
                      </span>
                      <span className="font-mono text-[13px] leading-5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>

              <CardFooter className="justify-between border-t bg-transparent">
                <span className="font-mono text-xs text-muted-foreground">{file}</span>
                <span className="flex items-center gap-1 font-medium text-primary">
                  Try it <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
