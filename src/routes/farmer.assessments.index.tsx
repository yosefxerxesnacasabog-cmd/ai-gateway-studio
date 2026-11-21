import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { EmptyState, PageHeader } from "@/components/anisuri/page";
import { StatusBadge } from "@/components/anisuri/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatQuantity, productName, STATUS_INFO } from "@/lib/demo/format";
import { asStatus, compact } from "@/lib/demo/search";
import { useDemoState } from "@/lib/demo/store";
import type { RequestStatus } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/assessments/")({
  validateSearch: (s: Record<string, unknown>) => compact({ status: asStatus(s["status"]) }),
  head: () => ({
    meta: [
      { title: "My Assessments — AniSuri" },
      { name: "description", content: "Track the status and results of your preliminary assessment requests." },
      { property: "og:title", content: "My Assessments — AniSuri" },
      { property: "og:description", content: "Pending, scheduled, completed and unavailable requests in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssessmentsPage,
});

const FILTERS: (RequestStatus | null)[] = [null, "pending", "scheduled", "completed", "unavailable"];

function AssessmentsPage() {
  const { status } = Route.useSearch();
  const navigate = useNavigate({ from: "/farmer/assessments/" });
  const state = useDemoState();
  const mine = state.requests.filter((r) => r.farmerKey === "me" && (!status || r.status === status));

  return (
    <div>
      <PageHeader title="My Assessments" intro="Requests you have sent. Open one to see details or results." />
      <div role="group" aria-label="Filter by status" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f ?? "all"}
            type="button"
            aria-pressed={status === (f ?? undefined)}
            onClick={() => void navigate({ search: compact({ status: f ?? undefined }), replace: true })}
            className={cn(
              "focus-ring min-h-11 shrink-0 rounded-full border px-4 font-bold",
              status === (f ?? undefined) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
            )}
          >
            {f ? STATUS_INFO[f].label : "All"}
          </button>
        ))}
      </div>
      {status && <p className="mt-3 text-muted-foreground">{STATUS_INFO[status].meaning}</p>}
      <div className="mt-4 grid gap-3">
        {mine.length === 0 ? (
          <EmptyState
            title="No requests here"
            action={
              <Button asChild>
                <Link to="/farmer/request" search={{}}>Request an assessment</Link>
              </Button>
            }
          />
        ) : (
          mine.map((r) => (
            <Link
              key={r.id}
              to="/farmer/assessments/$requestId"
              params={{ requestId: r.id }}
              className="focus-ring surface-card block p-4 hover:shadow-lift"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-bold">
                  {productName(r.product)} · {formatQuantity(r)}
                </p>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-1 text-muted-foreground">
                {state.buyers.find((b) => b.id === r.buyerId)?.name} · Sent {formatDate(r.submittedAt)} · {r.id}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
