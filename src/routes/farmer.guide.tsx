import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, SquarePen, Users } from "lucide-react";

import { GuideDetails } from "@/components/anisuri/guide-details";
import { EmptyState, NoticePanel, PageHeader } from "@/components/anisuri/page";
import { ProductPicker } from "@/components/anisuri/product-picker";
import { Button } from "@/components/ui/button";
import { productName } from "@/lib/demo/format";
import { asProduct, asText, compact } from "@/lib/demo/search";
import { useDemoState } from "@/lib/demo/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmer/guide")({
  validateSearch: (s: Record<string, unknown>) => compact({ product: asProduct(s["product"]), buyer: asText(s["buyer"]) }),
  head: () => ({
    meta: [
      { title: "Grading Guide — AniSuri" },
      { name: "description", content: "Read participating buyers' grading requirements for corn, palay and rubber." },
      { property: "og:title", content: "Grading Guide — AniSuri" },
      { property: "og:description", content: "Requirements, common defects, grades and indicative prices from participating buyers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidePage,
});

function GuidePage() {
  const { product = "corn", buyer: buyerId } = Route.useSearch();
  const navigate = useNavigate({ from: "/farmer/guide" });
  const state = useDemoState();
  const buyers = state.buyers.filter((b) => b.guides[product]);
  const selected = buyers.find((b) => b.id === buyerId) ?? buyers[0];
  const guide = selected?.guides[product];

  return (
    <div>
      <PageHeader
        title="Grading Guide"
        intro="Read what a participating buyer looks for. This is for learning — it does not send anything."
      />

      <ProductPicker
        label="1. Which product?"
        value={product}
        onChange={(p) => void navigate({ search: compact({ product: p ?? undefined }), replace: true })}
      />

      <fieldset className="mt-6">
        <legend className="mb-2 text-base font-bold">2. Which buyer?</legend>
        {buyers.length === 0 ? (
          <EmptyState title={`No participating buyer lists ${productName(product)} yet`}>
            Try another product, or check again later.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {buyers.map((b) => {
              const active = b.id === selected?.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => void navigate({ search: { product, buyer: b.id }, replace: true })}
                  className={cn(
                    "focus-ring flex min-h-12 items-center gap-2 rounded-xl border-2 px-4 py-2 text-left",
                    active ? "border-leaf bg-leaf-soft text-leaf-foreground" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <span className="font-bold">{b.name}</span>
                  <span className="text-sm text-muted-foreground">· {b.municipality}</span>
                </button>
              );
            })}
          </div>
        )}
        <Link
          to="/farmer/buyers"
          search={{ product }}
          className="focus-ring mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-primary underline underline-offset-4"
        >
          <Users className="size-5" aria-hidden="true" /> Find other buyers by area
        </Link>
      </fieldset>

      {selected && guide && (
        <article className="surface-card mt-6 p-5">
          <p className="text-sm font-semibold text-leaf-foreground">Participating buyer · demo data</p>
          <h2 className="text-2xl font-bold">
            {selected.name} — {productName(product)}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" /> {selected.area}
          </p>
          <div className="mt-5">
            <GuideDetails guide={guide} />
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/farmer/request" search={{ product, buyer: selected.id }}>
                <SquarePen /> Request assessment from this buyer
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/farmer/buyers/$buyerId" params={{ buyerId: selected.id }}>
                About this buyer
              </Link>
            </Button>
          </div>
        </article>
      )}

      <NoticePanel className="mt-6">
        <p>
          The guide is preliminary information. A buyer decides the final grade and price only after inspecting your
          product.
        </p>
      </NoticePanel>
    </div>
  );
}
