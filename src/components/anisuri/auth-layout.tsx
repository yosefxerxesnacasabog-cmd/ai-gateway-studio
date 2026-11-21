import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "./logo";

export function AuthLayout({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-5 py-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="focus-ring -ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold text-primary hover:bg-accent"
          >
            <ArrowLeft className="size-5" aria-hidden="true" /> Back
          </Link>
          <Logo />
        </div>
        <h1 className="mt-8 text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-lg text-muted-foreground">{intro}</p>
        <div className="mt-4 flex gap-2.5 rounded-xl border border-border bg-muted p-3 text-sm">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p>
            This is a demonstration. No text message (SMS) is sent and this is not secure sign-in. Your details stay
            on this device only.
          </p>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </main>
  );
}
