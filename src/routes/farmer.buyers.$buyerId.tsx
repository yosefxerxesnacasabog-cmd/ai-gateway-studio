import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, MapPin, SquarePen } from "lucide-react";

import { GuideDetails } from "@/components/anisuri/guide-details";
import { DemoBadge, EmptyState, NoticePanel, PageHeader } from "@/components/anisuri/page";
import { Button } from "@/components/ui/button";
import { buyerProducts, productLocal, productName } from "@/lib/demo/format";
import { getDemoState, useDemoState } from "@/lib/demo/store";

export const Route = createFileRoute("/farmer/buyers/$buyerId")({
  loader: ({ params }) => {
    const buyer = getDemoState().buyers.find((b) => b.id === params.buyerId);
    if (!buyer) throw notFound();
    return { name: buyer.name };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Buyer"} — AniSuri` },
      { name: "description", content: `Grading guide, common defects and indicative prices from ${loaderData?.name ?? "this buyer"}.` },
      { property: "og:title", content: `${loaderData?.name ?? "Buyer"} — AniSuri` },
      { property: "og:description", content: "Participating buyer details and grading requirements." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  notFoundComponent: () => (
    <EmptyState
      title="This buyer was not found"
      action={
        <Button asChild>
          <Link to="/farmer/buyers" search={{}}>Back to Find Buyers</Link>
        </Button>
      }
    />
  ),
  component: BuyerPage,
});

function BuyerPage() {
  const { buyerId } = Route.useParams();
  const state = useDemoState();
  const buyer = state.buyers.find((b) => b.id === buyerId);
  if (!buyer) return null;
  const products = buyerProducts(buyer);

  return (
    <div>
      <PageHeader title={buyer.name} back={{ label: "Find Buyers", to: "/farmer/buyers", search: {} }} eyebrow="Participating buyer" />
      <div className="-mt-3 mb-6 space-y-2">
        <p className="flex items-center gap-1.5 text-lg">
          <MapPin className="size-5 text-primary" aria-hidden="true" /> {buyer.area}
        </p>
        <p className="text-muted-foreground">{buyer.about}</p>
        <DemoBadge>Demo data · participating buyer</DemoBadge>
      </div>

      {products.length === 0 && <EmptyState title="This buyer has not listed any products yet" />}

      <div className="space-y-5">
        {products.map((p) => {
          const guide = buyer.guides[p];
          if (!guide) return null;
          return (
            <article key={p} className="surface-card p-5">
              <h2 className="text-2xl font-bold">
                {productName(p)} <span className="text-lg font-normal text-muted-foreground">({productLocal(p)})</span>
              </h2>
              <div className="mt-4">
                <GuideDetails guide={guide} />
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/farmer/request" search={{ product: p, buyer: buyer.id }}>
                    <SquarePen /> Request {productName(p).toLowerCase()} assessment
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/farmer/guide" search={{ product: p, buyer: buyer.id }}>
                    <BookOpen /> Open in Grading Guide
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <NoticePanel className="mt-6">
        <p>Prices are indicative sample information. Acceptance and price can change after physical inspection.</p>
      </NoticePanel>
    </div>
  );
}
