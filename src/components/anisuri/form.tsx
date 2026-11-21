import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fieldClass =
  "focus-ring block w-full rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/80 aria-[invalid=true]:border-destructive";

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null | undefined;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-base font-bold">
        {label}{" "}
        {optional ? (
          <span className="font-normal text-muted-foreground">(optional)</span>
        ) : (
          <span className="font-normal text-muted-foreground">(required)</span>
        )}
      </label>
      {hint && <p id={`${id}-hint`} className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, hint: boolean, error: unknown) {
  return cn(hint && `${id}-hint`, Boolean(error) && `${id}-error`) || undefined;
}
