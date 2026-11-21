import { format, parseISO } from "date-fns";

import { PRODUCTS } from "./seed";
import type { AssessmentRequest, Buyer, IndicativePrice, ProductId, RequestStatus } from "./types";

export const STATUS_INFO: Record<RequestStatus, { label: string; meaning: string }> = {
  pending: { label: "Pending", meaning: "The buyer is reviewing the request." },
  scheduled: { label: "Scheduled", meaning: "An inspection date or arrangement is set." },
  completed: { label: "Completed", meaning: "The buyer recorded preliminary sample inspection results." },
  unavailable: { label: "Unavailable", meaning: "The buyer cannot arrange the assessment." },
};

export function productName(id: ProductId) {
  return PRODUCTS.find((p) => p.id === id)?.name ?? id;
}

export function productLocal(id: ProductId) {
  return PRODUCTS.find((p) => p.id === id)?.local ?? "";
}

export function formatDate(iso: string) {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (h === undefined || m === undefined || Number.isNaN(h)) return hhmm;
  const d = new Date(2000, 0, 1, h, m);
  return format(d, "h:mm a");
}

export function formatPrice(price: IndicativePrice | null) {
  if (!price) return null;
  return `₱${price.amount.toFixed(2)} per ${price.unit}`;
}

export function formatQuantity(r: Pick<AssessmentRequest, "quantity" | "unit">) {
  return `${r.quantity.toLocaleString("en-PH")} ${r.unit === "kg" ? "kg" : r.quantity === 1 ? "sack" : "sacks"}`;
}

export function buyerProducts(buyer: Buyer): ProductId[] {
  return PRODUCTS.map((p) => p.id).filter((id) => Boolean(buyer.guides[id]));
}
