import { Link, type LinkProps } from "@tanstack/react-router";
import { ArrowLeft, Info, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  intro,
  back,
  eyebrow,
}: {
  title: string;
  intro?: ReactNode;
  back?: { label: string; to: NonNullable<LinkProps["to"]>; params?: LinkProps["params"]; search?: LinkProps["search"] };
  eyebrow?: string;
}) {
  return (
    <header className="mb-6">
      {back && (
        <Link
          {...({ to: back.to, params: back.params, search: back.search } as LinkProps)}
          className="focus-ring -ml-2 mb-3 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-semibold text-primary hover:bg-accent"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      {eyebrow && (
        <p className="mb-1 text-sm font-bold uppercase tracking-wider text-leaf-foreground">{eyebrow}</p>
      )}
      <h1 className="text-[1.75rem] font-bold text-foreground md:text-3xl">{title}</h1>
      {intro && <div className="mt-2 text-lg text-muted-foreground">{intro}</div>}
    </header>
  );
}

export function TipPanel({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <aside className={cn("rounded-2xl border border-gold/40 bg-gold-soft p-4 text-gold-foreground", className)}>
      <p className="flex items-center gap-2 font-bold">
        <Lightbulb className="size-5 shrink-0" aria-hidden="true" />
        {title}
      </p>
      <div className="mt-1.5 text-base leading-relaxed">{children}</div>
    </aside>
  );
}

export function NoticePanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-3 rounded-2xl border border-border bg-muted p-4 text-base text-foreground", className)}>
      <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function Section({ title, children, className, action }: { title: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={cn("mt-8", className)}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-input bg-surface p-6 text-center">
      <p className="text-lg font-bold">{title}</p>
      {children && <div className="mt-1 text-muted-foreground">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function DemoBadge({ children = "Demo data" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-sm font-semibold text-muted-foreground">
      {children}
    </span>
  );
}
