import { Link } from "@tanstack/react-router";
import { ChevronRight, MapPin } from "lucide-react";

import { buyerProducts, productName } from "@/lib/demo/format";
import type { Buyer } from "@/lib/demo/types";

export function BuyerCard({ buyer }: { buyer: Buyer }) {
  const products = buyerProducts(buyer);
  return (
    <Link
      to="/farmer/buyers/$buyerId"
      params={{ buyerId: buyer.id }}
      className="focus-ring surface-card group flex items-center gap-4 p-4 transition-shadow hover:shadow-lift"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-leaf-foreground">Participating buyer · demo</p>
        <p className="text-lg font-bold leading-snug">{buyer.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {buyer.area}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {products.map((p) => (
            <span key={p} className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground">
              {productName(p)}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="size-6 shrink-0 text-muted-foreground group-hover:text-primary" aria-hidden="true" />
    </Link>
  );
}
