import { formatDate, formatPrice } from "@/lib/demo/format";
import type { AssessmentResult } from "@/lib/demo/types";

export function ResultView({ result }: { result: AssessmentResult }) {
  return (
    <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
      <Row label="Preliminary grade" value={result.grade} strong />
      <Row label="Observed quality issues" value={result.observations} />
      <Row label="Possible deductions" value={result.deductions ?? "None noted"} />
      <Row label="Indicative price" value={formatPrice(result.price) ?? "Not provided"} />
      <Row label="Buyer's remarks" value={result.remarks ?? "None"} />
      <Row label="Inspection date" value={formatDate(result.inspectedAt)} />
    </dl>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={strong ? "text-2xl font-bold" : "font-semibold"}>{value}</dd>
    </div>
  );
}
