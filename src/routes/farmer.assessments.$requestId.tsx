import { ownsRequest } from "@/lib/demo/actions";
import { FarmerPost } from "@/components/anisuri/harvest-posts";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, Users, Wrench } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, NoticePanel, PageHeader, Section } from "@/components/anisuri/page";
import { ResultView } from "@/components/anisuri/result-view";
import { StatusBadge } from "@/components/anisuri/status-badge";
import { Button } from "@/components/ui/button";
import { chooseNextStep } from "@/lib/demo/actions";
import { formatDate, formatQuantity, formatTime, productName, STATUS_INFO } from "@/lib/demo/format";
import { updateDemo, useDemoState } from "@/lib/demo/store";
import type { NextStep } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/assessments/$requestId")({
  head: ({ params }) => ({
    meta: [
      { title: `Assessment ${params.requestId} — AniSuri` },
      { name: "description", content: "Status, details and preliminary results of your assessment request." },
      { property: "og:title", content: `Assessment ${params.requestId} — AniSuri` },
      { property: "og:description", content: "Preliminary assessment request details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssessmentDetail,
});

const STEPS: { id: NextStep; label: string; icon: typeof Truck }[] = [
  { id: "deliver", label: "Proceed with delivery", icon: Truck },
  { id: "prepare", label: "Prepare the product further", icon: Wrench },
  { id: "other-buyer", label: "Consider another buyer", icon: Users },
];

function AssessmentDetail() {
  const { requestId } = Route.useParams();
  const state = useDemoState();
  const r = state.requests.find((x) => x.id === requestId && ownsRequest(state, x));
  if (!r) {
    return (
      <EmptyState
        title="This request was not found"
        action={
          <Button asChild>
            <Link to="/farmer/assessments" search={{}}>Back to My Assessments</Link>
          </Button>
        }
      />
    );
  }
  if (r.responses) return <FarmerPost post={r} />;
  const buyer = state.buyers.find((b) => b.id === r.buyerId);

  return (
    <div>
      <PageHeader
        title={`${productName(r.product)} · ${formatQuantity(r)}`}
        eyebrow={`Request ${r.id}`}
        back={{ label: "My Assessments", to: "/farmer/assessments", search: {} }}
      />
      <div className="-mt-3 flex flex-wrap items-center gap-3">
        <StatusBadge status={r.status} />
        <span className="text-muted-foreground">{STATUS_INFO[r.status].meaning}</span>
      </div>
      {r.status === "pending" && r.confirmed && (
        <p className="mt-3 font-semibold">The buyer confirmed your request and will set an inspection time.</p>
      )}
      {r.schedule && r.status !== "unavailable" && (
        <div className="mt-4 rounded-2xl bg-status-scheduled p-4 text-status-scheduled-foreground">
          <p className="font-bold">Inspection</p>
          <p>
            {formatDate(r.schedule.date)}, {formatTime(r.schedule.time)} · {r.schedule.place}
          </p>
        </div>
      )}
      {r.status === "unavailable" && (
        <div className="mt-4 rounded-2xl bg-status-unavailable p-4 text-status-unavailable-foreground">
          <p className="font-bold">Buyer's reason</p>
          <p>{r.declineReason}</p>
          <Button asChild className="mt-3">
            <Link to="/farmer/buyers" search={{ product: r.product }}>
              <Users /> Explore other buyers
            </Link>
          </Button>
        </div>
      )}

      {r.status === "completed" && r.result && (
        <Section title="Preliminary results">
          <ResultView result={r.result} />
          <NoticePanel className="mt-3">
            <p>This result is preliminary. The buyer may make the final decision after inspecting the delivered product.</p>
          </NoticePanel>
          <h3 className="mt-6 text-lg font-bold">What would you like to do next?</h3>
          <p className="text-muted-foreground">This is your choice. Nothing is sent to the buyer.</p>
          <div className="mt-3 grid gap-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const chosen = r.nextStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={chosen}
                  onClick={() => {
                    updateDemo((st) => chooseNextStep(st, r.id, s.id));
                    toast.success(`Saved your choice: ${s.label}`);
                  }}
                  className={cn(
                    "focus-ring flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 text-left font-bold",
                    chosen ? "border-leaf bg-leaf-soft text-leaf-foreground" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" /> {s.label}
                </button>
              );
            })}
          </div>
          {r.nextStep === "other-buyer" && (
            <Button asChild variant="outline" className="mt-3">
              <Link to="/farmer/buyers" search={{ product: r.product }}>Go to Find Buyers</Link>
            </Button>
          )}
        </Section>
      )}

      <Section title="Your request details">
        <dl className="divide-y divide-border rounded-xl border border-border bg-card">
          {[
            ["Buyer", buyer ? `${buyer.name}, ${buyer.municipality}` : r.buyerId],
            ["Product", productName(r.product)],
            ["Estimated quantity", formatQuantity(r)],
            ["Condition", r.condition],
            ["Farm location", r.location],
            ["Remarks", r.remarks ?? "None"],
            ["Sent on", formatDate(r.submittedAt)],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-3">
              <dt className="text-sm text-muted-foreground">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        {r.photo && <img src={r.photo} alt="Your supporting photo" className="mt-3 h-32 rounded-lg border border-border object-cover" />}
      </Section>
    </div>
  );
}
