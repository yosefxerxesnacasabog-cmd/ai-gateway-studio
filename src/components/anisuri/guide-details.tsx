import { CircleAlert, ListChecks, Medal, Tag } from "lucide-react";

import { formatDate, formatPrice } from "@/lib/demo/format";
import type { ProductGuide } from "@/lib/demo/types";

export function GuideDetails({ guide }: { guide: ProductGuide }) {
  const price = formatPrice(guide.price);
  return (
    <div className="space-y-5">
      <div>
        <h4 className="flex items-center gap-2 font-bold">
          <ListChecks className="size-5 text-primary" aria-hidden="true" /> What the buyer looks for
        </h4>
        <ul className="mt-2 space-y-2">
          {guide.requirements.map((r) => (
            <li key={r} className="flex gap-2.5">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-leaf" aria-hidden="true" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="flex items-center gap-2 font-bold">
          <CircleAlert className="size-5 text-status-unavailable-foreground" aria-hidden="true" /> Common defects
        </h4>
        <p className="text-sm text-muted-foreground">These may lower the grade or lead to rejection.</p>
        <ul className="mt-2 space-y-2">
          {guide.defects.map((d) => (
            <li key={d} className="flex gap-2.5">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-status-unavailable-foreground" aria-hidden="true" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="flex items-center gap-2 font-bold">
          <Medal className="size-5 text-gold-foreground" aria-hidden="true" /> Grades
        </h4>
        <dl className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {guide.grades.map((g) => (
            <div key={g.name} className="bg-surface px-4 py-3">
              <dt className="font-bold">{g.name}</dt>
              <dd className="text-muted-foreground">{g.description}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <h4 className="flex items-center gap-2 font-bold">
          <Tag className="size-5 text-primary" aria-hidden="true" /> Indicative price
        </h4>
        {price ? (
          <p className="mt-1 text-xl font-bold">
            {price} <span className="text-base font-normal text-muted-foreground">(sample information)</span>
          </p>
        ) : (
          <p className="mt-1">This buyer has not shared a price. Prices are given after inspection.</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          Prices and acceptance can change after physical inspection. Last updated {formatDate(guide.updatedAt)}.
        </p>
      </div>
    </div>
  );
}
