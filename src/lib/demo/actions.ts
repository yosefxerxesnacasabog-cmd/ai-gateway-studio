import type {
  AssessmentRequest,
  AssessmentResult,
  DemoState,
  InspectionSchedule,
  NextStep,
  ProductGuide,
  ProductId,
  QuantityUnit,
} from "./types";

export type NewRequestInput = {
  product: ProductId;
  buyerId: string;
  quantity: number;
  unit: QuantityUnit;
  condition: string;
  location: string;
  remarks: string | null;
  photo: string | null;
};

export function currentFarmerName(state: DemoState): string {
  if (state.session.role === "farmer") {
    const mobile = state.session.mobile;
    return state.accounts.find((a) => a.mobile === mobile)?.name ?? "Farmer";
  }
  return "Guest farmer";
}

function nextRequestId(state: DemoState): string {
  const max = state.requests.reduce((n, r) => Math.max(n, Number(r.id.replace(/\D/g, "")) || 0), 1000);
  return `AS-${max + 1}`;
}

export function submitRequest(state: DemoState, input: NewRequestInput, now: Date): DemoState {
  const buyer = state.buyers.find((b) => b.id === input.buyerId);
  if (!buyer || !buyer.guides[input.product]) {
    throw new Error("This buyer does not accept the selected product.");
  }
  if (!(input.quantity > 0)) throw new Error("Quantity must be more than zero.");
  const request: AssessmentRequest = {
    id: nextRequestId(state),
    farmerKey: "me",
    farmerName: currentFarmerName(state),
    product: input.product,
    buyerId: input.buyerId,
    quantity: input.quantity,
    unit: input.unit,
    condition: input.condition,
    location: input.location.trim(),
    remarks: input.remarks?.trim() || null,
    photo: input.photo,
    submittedAt: now.toISOString(),
    status: "pending",
    confirmed: false,
    schedule: null,
    declineReason: null,
    result: null,
    nextStep: null,
  };
  return { ...state, requests: [request, ...state.requests] };
}

function patchRequest(
  state: DemoState,
  id: string,
  patch: (r: AssessmentRequest) => AssessmentRequest,
): DemoState {
  return { ...state, requests: state.requests.map((r) => (r.id === id ? patch(r) : r)) };
}

/** Buyer confirms they will arrange the inspection; status stays Pending until a time is set. */
export function confirmRequest(state: DemoState, id: string): DemoState {
  return patchRequest(state, id, (r) =>
    r.status === "pending" ? { ...r, confirmed: true } : r,
  );
}

export function scheduleInspection(state: DemoState, id: string, schedule: InspectionSchedule): DemoState {
  if (!schedule.date || !schedule.time || !schedule.place.trim()) {
    throw new Error("Date, time and meeting place are all needed.");
  }
  return patchRequest(state, id, (r) =>
    r.status === "pending" || r.status === "scheduled"
      ? { ...r, confirmed: true, status: "scheduled", schedule: { ...schedule, place: schedule.place.trim() } }
      : r,
  );
}

export function declineRequest(state: DemoState, id: string, reason: string): DemoState {
  if (!reason.trim()) throw new Error("Please give the farmer a reason.");
  return patchRequest(state, id, (r) =>
    r.status === "completed" ? r : { ...r, status: "unavailable", declineReason: reason.trim() },
  );
}

export function recordResult(
  state: DemoState,
  id: string,
  result: Omit<AssessmentResult, "inspectedAt">,
  sampleInspected: boolean,
  now: Date,
): DemoState {
  if (!sampleInspected) {
    throw new Error("Confirm that a representative sample was physically inspected.");
  }
  if (!result.grade.trim() || !result.observations.trim()) {
    throw new Error("Grade and quality observations are needed.");
  }
  return patchRequest(state, id, (r) => ({
    ...r,
    status: "completed",
    confirmed: true,
    result: { ...result, inspectedAt: now.toISOString() },
  }));
}

export function chooseNextStep(state: DemoState, id: string, step: NextStep): DemoState {
  return patchRequest(state, id, (r) => (r.status === "completed" ? { ...r, nextStep: step } : r));
}

export function saveGuide(
  state: DemoState,
  buyerId: string,
  product: ProductId,
  guide: ProductGuide | null,
): DemoState {
  return {
    ...state,
    buyers: state.buyers.map((b) => {
      if (b.id !== buyerId) return b;
      const guides = { ...b.guides };
      if (guide) guides[product] = guide;
      else delete guides[product];
      return { ...b, guides };
    }),
  };
}

export function farmerSummary(state: DemoState) {
  const mine = state.requests.filter((r) => r.farmerKey === "me");
  return {
    total: mine.length,
    inProgress: mine.filter((r) => r.status === "pending" || r.status === "scheduled").length,
    ready: mine.filter((r) => r.status === "completed").length,
    unavailable: mine.filter((r) => r.status === "unavailable").length,
  };
}
