import { ownsRequest } from "@/lib/demo/actions";
import { currentFarmerName } from "./actions";
import { formatPrice, productName, STATUS_INFO } from "./format";
import { PRODUCTS } from "./seed";
import type { DemoState } from "./types";

/** Compact, plain-text snapshot of the demo data the voice helper may read aloud. */
export function buildVoiceContext(state: DemoState): string {
  const lines: string[] = [];
  lines.push(`Farmer name: ${currentFarmerName(state)}`);
  lines.push("Participating buyers (demo sample data; the directory does not list every buyer):");
  for (const b of state.buyers) {
    lines.push(`- buyer_id ${b.id}: ${b.name}, ${b.area}.`);
    for (const p of PRODUCTS) {
      const g = b.guides[p.id];
      if (!g) continue;
      lines.push(
        `  * ${p.name} (product ${p.id}). Requirements: ${g.requirements.join(" ")} Defects: ${g.defects.join(" ")} Grades: ${g.grades
          .map((x) => `${x.name}: ${x.description}`)
          .join(" ")} Indicative price: ${formatPrice(g.price) ?? "not shared"}.`,
      );
    }
  }
  const mine = state.requests.filter((r) => ownsRequest(state, r));
  lines.push("This farmer's assessment requests:");
  if (mine.length === 0) lines.push("- none yet");
  for (const r of mine) {
    const buyer = state.buyers.find((b) => b.id === r.buyerId)?.name ?? r.buyerId;
    let extra = "";
    if (r.status === "scheduled" && r.schedule) extra = ` Inspection ${r.schedule.date} ${r.schedule.time} at ${r.schedule.place}.`;
    if (r.status === "completed" && r.result) extra = ` Preliminary grade ${r.result.grade}.`;
    if (r.status === "unavailable" && r.declineReason) extra = ` Reason: ${r.declineReason}`;
    lines.push(`- ${r.id}: ${productName(r.product)} for ${buyer}, status ${STATUS_INFO[r.status].label}.${extra}`);
  }
  return lines.join("\n").slice(0, 15_000);
}
