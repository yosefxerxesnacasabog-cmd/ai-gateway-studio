import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { BuyerCard } from "@/components/anisuri/buyer-card";
import { EmptyState, NoticePanel, PageHeader } from "@/components/anisuri/page";
import { ProductPicker } from "@/components/anisuri/product-picker";
import { fieldClass } from "@/components/anisuri/form";
import { Button } from "@/components/ui/button";
import { AREAS } from "@/lib/demo/seed";
import { asProduct, asText, compact } from "@/lib/demo/search";
import { useDemoState } from "@/lib/demo/store";

export const Route = createFileRoute("/farmer/buyers/")({
  validateSearch: (s: Record<string, unknown>) => compact({ product: asProduct(s["product"]), area: asText(s["area"]) }),
  head: () => ({
    meta: [
      { title: "Find Buyers — AniSuri" },
      { name: "description", content: "Browse participating buyers by area and product, and read their grading guides." },
      { property: "og:title", content: "Find Buyers — AniSuri" },
      { property: "og:description", content: "A directory of participating buyers around Banisilan, Cotabato." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuyersPage,
});

function BuyersPage() {
  const { product, area } = Route.useSearch();
  const navigate = useNavigate({ from: "/farmer/buyers/" });
  const state = useDemoState();
  const list = state.buyers.filter(
    (b) => (!product || Boolean(b.guides[product])) && (!area || b.municipality === area),
  );

  return (
    <div>
      <PageHeader
        title="Find Buyers"
        back={{ label: "Grading Guide", to: "/farmer/guide" }}
        intro="Look at other participating buyers if your first buyer declines or offers a low price. You choose whom to contact."
      />

      <div className="space-y-5">
        <div>
          <label htmlFor="area" className="mb-2 block text-base font-bold">
            Area or municipality
          </label>
          <select
            id="area"
            className={fieldClass}
            value={area ?? ""}
            onChange={(e) => void navigate({ search: compact({ product, area: e.target.value || undefined }), replace: true })}
          >
            <option value="">All areas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <ProductPicker
          label="Product accepted"
          allowAll
          value={product ?? null}
          onChange={(p) => void navigate({ search: compact({ area, product: p ?? undefined }), replace: true })}
        />
      </div>

      <p className="mt-6 text-muted-foreground" aria-live="polite">
        {list.length} participating buyer{list.length === 1 ? "" : "s"} shown
      </p>
      <div className="mt-2 grid gap-3">
        {list.length === 0 ? (
          <EmptyState
            title="No participating buyers match"
            action={
              <Button variant="outline" onClick={() => void navigate({ search: {}, replace: true })}>
                Show all buyers
              </Button>
            }
          >
            Try a different area or product.
          </EmptyState>
        ) : (
          list.map((b) => <BuyerCard key={b.id} buyer={b} />)
        )}
      </div>

      <NoticePanel className="mt-6">
        <p>
          This list only shows participating buyers using demo data. It does not include every buyer in the area, and
          being listed does not mean a buyer will accept your produce.
        </p>
      </NoticePanel>
    </div>
  );
}
