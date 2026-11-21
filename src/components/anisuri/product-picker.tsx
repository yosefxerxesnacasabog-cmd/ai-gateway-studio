import { Check } from "lucide-react";

import { PRODUCTS } from "@/lib/demo/seed";
import type { ProductId } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export function ProductPicker({
  value,
  onChange,
  label = "Choose a product",
  allowAll = false,
  idPrefix = "product",
  invalid = false,
}: {
  value: ProductId | null;
  onChange: (value: ProductId | null) => void;
  label?: string;
  allowAll?: boolean;
  idPrefix?: string;
  invalid?: boolean;
}) {
  const options: { id: ProductId | null; name: string; local: string }[] = [
    ...(allowAll ? [{ id: null, name: "All", local: "Lahat" }] : []),
    ...PRODUCTS,
  ];
  return (
    <fieldset>
      <legend className="mb-2 text-base font-bold">{label}</legend>
      <div className={cn("grid gap-2", allowAll ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
        {options.map((p) => {
          const selected = value === p.id;
          return (
            <button
              key={p.id ?? "all"}
              id={`${idPrefix}-${p.id ?? "all"}`}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(p.id)}
              className={cn(
                "focus-ring relative flex min-h-16 flex-col items-center justify-center rounded-xl border-2 px-2 py-2 text-center transition-colors",
                selected
                  ? "border-leaf bg-leaf-soft text-leaf-foreground"
                  : invalid
                    ? "border-destructive/60 bg-card hover:bg-muted"
                    : "border-border bg-card hover:bg-muted",
              )}
            >
              {selected && <Check className="absolute right-2 top-2 size-4" aria-hidden="true" />}
              <span className="text-base font-bold">{p.name}</span>
              <span className="text-sm text-muted-foreground">{p.local}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
