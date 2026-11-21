import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, ChevronDown, Pencil, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { describedBy, Field, fieldClass } from "@/components/anisuri/form";
import { NoticePanel, PageHeader, TipPanel } from "@/components/anisuri/page";
import { ProductPicker } from "@/components/anisuri/product-picker";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { submitRequest } from "@/lib/demo/actions";
import { formatQuantity, productName } from "@/lib/demo/format";
import { CONDITIONS } from "@/lib/demo/seed";
import { asProduct, asText, compact } from "@/lib/demo/search";
import { updateDemo } from "@/lib/demo/store";
import type { ProductId, QuantityUnit } from "@/lib/demo/types";
import { resizePhoto } from "@/lib/photo";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/farmer/request")({
  validateSearch: (s: Record<string, unknown>) => compact({ product: asProduct(s["product"]), buyer: asText(s["buyer"]) }),
  head: () => ({
    meta: [
      { title: "Request a Preliminary Assessment — AniSuri" },
      { name: "description", content: "Ask a participating buyer to physically inspect a sample of your harvest." },
      { property: "og:title", content: "Request a Preliminary Assessment — AniSuri" },
      { property: "og:description", content: "A simple step-by-step form for corn, palay and rubber farmers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RequestPage,
});
type Draft = {
  product: ProductId | null;
  quantity: string;
  unit: QuantityUnit;
  conditions: string[];
  other: string;
  location: string;
  remarks: string;
  photo: string | null;
};
type Errors = Partial<Record<"product" | "buyerId" | "quantity" | "condition" | "location" | "photo", string>>;
const STEPS = ["Product", "Your harvest", "Review and send"] as const;
function validateStep(step: number, d: Draft): Errors {
  const e: Errors = {};
  if (step >= 0) {
    if (!d.product) e.product = "Choose a product.";
  }
  if (step >= 1) {
    const q = Number(d.quantity);
    if (!d.quantity.trim() || !Number.isFinite(q) || q <= 0) e.quantity = "Enter an estimated quantity more than 0.";
    else if (q > 1_000_000) e.quantity = "That quantity looks too large. Please check it.";
    if (!d.conditions.length || (d.conditions.includes("Other") && !d.other.trim())) e.condition = "Select a condition and describe Other if selected.";
    if (d.location.trim().length < 3) e.location = "Enter your barangay and municipality.";
  }
  return e;
}
function RequestPage() {
  const search = Route.useSearch();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    product: search.product ?? null,
    quantity: "",
    unit: "sacks",
    conditions: [], other: "",
    location: "",
    remarks: "",
    photo: null,
  }));
  // The voice helper or a guide link can open this page with a new product/buyer.
  useEffect(() => {
    if (!search.product) return;
    setDraft((d) => ({ ...d, product: search.product ?? d.product }));
  }, [search.product]);
  useEffect(() => {
    headingRef.current?.focus();
  }, [step, submittedId]);
  const conditionText = draft.conditions.map(c => c === "Other" ? draft.other.trim() : c).join("; ");
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const next = () => {
    const e = validateStep(step, draft );
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(2, s + 1));
  };
  const send = () => {
    const e = validateStep(1, draft );
    if (Object.keys(e).length || !draft.product) {
      setErrors(e);
      setStep(e.product || e.buyerId ? 0 : 1);
      return;
    }
    const product = draft.product;
    let newId = "";
    updateDemo((s) => {
      const nextState = submitRequest(
        s,
        {
          product,
          buyerId: "",
          quantity: Number(draft.quantity),
          unit: draft.unit,
          condition: conditionText,
          location: draft.location,
          remarks: draft.remarks,
          photo: draft.photo,
        },
        new Date(),
      );
      newId = nextState.requests[0]?.id ?? "";
      return nextState;
    });
    setSubmittedId(newId);
  };
  if (submittedId) {
    return (
      <div className="pt-4 text-center">
        <CheckCircle2 className="mx-auto size-16 text-leaf" aria-hidden="true" />
        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl font-bold outline-none">
          Request sent
        </h1>
        <p className="mx-auto mt-2 max-w-md text-lg text-muted-foreground">
          Participating buyers can now respond to your post {submittedId}. Check My Assessments for replies.
        </p>
        <NoticePanel className="mx-auto mt-6 max-w-md text-left">
          <p>This request does not guarantee an assessment will be arranged, or that your product will be accepted.</p>
        </NoticePanel>
        <div className="mx-auto mt-6 flex max-w-md flex-col gap-2">
          <Button asChild size="lg">
            <Link to="/farmer/assessments/$requestId" params={{ requestId: submittedId }}>
              Track this request
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/farmer">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <PageHeader
        title="Request Assessment"
        intro="Share your harvest details once and review responses from participating buyers."
      />
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Form steps">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-border")} />
            <p className={cn("mt-1.5 text-sm", i === step ? "font-bold text-foreground" : "text-muted-foreground")}>
              {i + 1}. {label}
            </p>
          </li>
        ))}
      </ol>
      <h2 ref={headingRef} tabIndex={-1} className="mb-4 text-xl font-bold outline-none">
        Step {step + 1} of 3: {STEPS[step]}
      </h2>
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <ProductPicker
              label="Product (required)"
              idPrefix="req-product"
              value={draft.product}
              invalid={Boolean(errors.product)}
              onChange={(p) => set("product", p)}
            />
            {errors.product && <p role="alert" className="mt-1.5 text-sm font-semibold text-destructive">{errors.product}</p>}
          </div>
          <NoticePanel>Post once for participating buyers. You can choose a buyer after reading their responses.</NoticePanel>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-6">
          <Field id="quantity" label="Estimated quantity" hint="A rough number is fine." error={errors.quantity}>
            <div className="flex gap-2">
              <input
                id="quantity"
                inputMode="decimal"
                className={cn(fieldClass, "flex-1")}
                value={draft.quantity}
                onChange={(e) => set("quantity", e.target.value.replace(/[^\d.]/g, ""))}
                aria-invalid={Boolean(errors.quantity)}
                aria-describedby={describedBy("quantity", true, errors.quantity)}
              />
              <div role="group" aria-label="Unit" className="flex overflow-hidden rounded-xl border border-input">
                {(["sacks", "kg"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    aria-pressed={draft.unit === u}
                    onClick={() => set("unit", u)}
                    className={cn(
                      "focus-ring min-w-16 px-3 font-bold",
                      draft.unit === u ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                    )}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </Field>
          <fieldset>
            <legend className="text-base font-bold">
              Product condition <span className="font-normal text-muted-foreground">(required)</span>
            </legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[...CONDITIONS, "Other"].map((c) => (
                <label
                  key={c}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-2",
                    draft.conditions.includes(c) ? "border-leaf bg-leaf-soft" : errors.condition ? "border-destructive/60 bg-card" : "border-border bg-card hover:bg-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    name="condition"
                    value={c}
                    checked={draft.conditions.includes(c)}
                    onChange={() => set("conditions", draft.conditions.includes(c) ? draft.conditions.filter(value => value !== c) : [...draft.conditions, c])}
                    className="size-5 accent-primary"
                  />
                  <span className="font-semibold">{c}</span>
                </label>
              ))}
            </div>
            {draft.conditions.includes("Other") && <label className="block font-semibold">Describe the other condition<input className="mt-2 block w-full rounded-xl border p-3" value={draft.other} maxLength={300} onChange={e => set("other", e.target.value)} /></label>}
            {errors.condition && <p role="alert" className="mt-1.5 text-sm font-semibold text-destructive">{errors.condition}</p>}
          </fieldset>
          <Field id="location" label="Farm location" hint="Barangay and municipality, e.g. Brgy. Kalawaig, Banisilan" error={errors.location}>
            <input
              id="location"
              className={fieldClass}
              value={draft.location}
              onChange={(e) => set("location", e.target.value)}
              autoComplete="address-level3"
              aria-invalid={Boolean(errors.location)}
              aria-describedby={describedBy("location", true, errors.location)}
            />
          </Field>
          <Collapsible open={optionalOpen} onOpenChange={setOptionalOpen} className="rounded-2xl border border-border bg-card">
            <CollapsibleTrigger className="focus-ring flex min-h-14 w-full items-center justify-between rounded-2xl px-4 text-left font-bold">
              <span>
                Optional: remarks and photo
                {(draft.remarks || draft.photo) && <span className="ml-2 text-sm font-normal text-leaf-foreground">· added</span>}
              </span>
              <ChevronDown className={cn("size-5 transition-transform", optionalOpen && "rotate-180")} aria-hidden="true" />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-5 px-4 pb-4">
              <Field id="remarks" label="Additional remarks" optional hint="Anything the buyer should know.">
                <textarea
                  id="remarks"
                  rows={3}
                  className={fieldClass}
                  value={draft.remarks}
                  onChange={(e) => set("remarks", e.target.value.slice(0, 500))}
                  aria-describedby="remarks-hint"
                />
              </Field>
              <PhotoField
                photo={draft.photo}
                error={errors.photo}
                onChange={(p) => set("photo", p)}
                onError={(m) =>
                  setErrors((e) => {
                    const n = { ...e };
                    if (m) n.photo = m;
                    else delete n.photo;
                    return n;
                  })
                }
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
      {step === 2 && draft.product && (
        <div className="space-y-4">
          <ReviewBlock title="Product" onEdit={() => setStep(0)}>
            <ReviewRow label="Product" value={productName(draft.product)} />
          </ReviewBlock>
          <ReviewBlock title="Your harvest" onEdit={() => setStep(1)}>
            <ReviewRow label="Estimated quantity" value={formatQuantity({ quantity: Number(draft.quantity), unit: draft.unit })} />
            <ReviewRow label="Condition" value={conditionText} />
            <ReviewRow label="Farm location" value={draft.location} />
            <ReviewRow label="Remarks" value={draft.remarks.trim() || "None"} />
            <div className="py-2">
              <dt className="text-sm text-muted-foreground">Photo</dt>
              <dd className="mt-1">
                {draft.photo ? (
                  <img src={draft.photo} alt="Your supporting photo" className="h-28 rounded-lg border border-border object-cover" />
                ) : (
                  "None"
                )}
              </dd>
            </div>
          </ReviewBlock>
          <NoticePanel>
            <p>A buyer or authorized evaluator must physically inspect a representative sample.</p>
            <p>Sending this does not guarantee an assessment will be arranged, product acceptance, or a final price.</p>
          </NoticePanel>
        </div>
      )}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="outline" size="lg" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft /> Back
          </Button>
        )}
        {step < 2 ? (
          <Button size="lg" className="flex-1" onClick={next}>
            Continue <ArrowRight />
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={send}>
            <Send /> Send request
          </Button>
        )}
      </div>
      {step === 0 && (
        <TipPanel title="Guide or request?" className="mt-6">
          The Grading Guide is for reading. This form asks a buyer to come and inspect your harvest.
        </TipPanel>
      )}
    </div>
  );
}
function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="surface-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <Button variant="soft" size="sm" onClick={onEdit}>
          <Pencil /> Edit
        </Button>
      </div>
      <dl className="mt-2 divide-y divide-border">{children}</dl>
    </section>
  );
}
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
function PhotoField({
  photo,
  error,
  onChange,
  onError,
}: {
  photo: string | null;
  error: string | undefined;
  onChange: (p: string | null) => void;
  onError: (m: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-base font-bold">
        Supporting photo <span className="font-normal text-muted-foreground">(optional)</span>
      </p>
      <p id="photo-hint" className="text-sm text-muted-foreground">
        A photo is extra information only. It does not decide a grade.
      </p>
      <input
        ref={inputRef}
        id="photo"
        type="file"
        accept="image/*"
        className="sr-only"
        aria-describedby="photo-hint"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          try {
            onError(undefined);
            onChange(await resizePhoto(file));
          } catch (err) {
            onError(err instanceof Error ? err.message : "This photo could not be added.");
          }
        }}
      />
      {photo ? (
        <div className="mt-2 flex items-center gap-3">
          <img src={photo} alt="Your supporting photo" className="h-24 w-24 rounded-lg border border-border object-cover" />
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Camera /> Change photo
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
              <Trash2 /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="mt-2" onClick={() => inputRef.current?.click()}>
          <Camera /> Add a photo
        </Button>
      )}
      {error && <p role="alert" className="mt-1.5 text-sm font-semibold text-destructive">{error}</p>}
    </div>
  );
}