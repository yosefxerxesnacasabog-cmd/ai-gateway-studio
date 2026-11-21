import { PRODUCTS } from "./seed";
import type { ProductId, RequestStatus } from "./types";

export const asProduct = (v: unknown): ProductId | undefined =>
  PRODUCTS.find((product) => product.id === v)?.id;

export const asStatus = (v: unknown): RequestStatus | undefined =>
  v === "pending" || v === "scheduled" || v === "completed" || v === "unavailable" ? v : undefined;

export const asText = (v: unknown): string | undefined =>
  typeof v === "string" && v.length > 0 && v.length < 100 ? v : undefined;

/** Drop undefined keys so search objects satisfy exactOptionalPropertyTypes. */
export function compact<T extends Record<string, unknown>>(obj: T): { [K in keyof T]?: Exclude<T[K], undefined> } {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as {
    [K in keyof T]?: Exclude<T[K], undefined>;
  };
}
