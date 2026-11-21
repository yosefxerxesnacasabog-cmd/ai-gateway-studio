export type ProductId = "corn" | "palay" | "rubber";

export type GradeDescription = { name: string; description: string };

export type IndicativePrice = { amount: number; unit: string };

export type ProductGuide = {
  requirements: string[];
  defects: string[];
  grades: GradeDescription[];
  price: IndicativePrice | null;
  updatedAt: string;
};

export type Buyer = {
  id: string;
  name: string;
  municipality: string;
  area: string;
  about: string;
  guides: Partial<Record<ProductId, ProductGuide>>;
};

export type RequestStatus = "pending" | "scheduled" | "completed" | "unavailable";

export type QuantityUnit = "kg" | "sacks";

export type InspectionSchedule = { date: string; time: string; place: string };

export type AssessmentResult = {
  grade: string;
  observations: string;
  deductions: string | null;
  price: IndicativePrice | null;
  remarks: string | null;
  inspectedAt: string;
};

export type NextStep = "deliver" | "prepare" | "other-buyer";

export type AssessmentRequest = {
  id: string;
  /** "me" marks requests made by the person using the farmer side of the demo. */
  farmerKey: string;
  farmerName: string;
  product: ProductId;
  buyerId: string;
  quantity: number;
  unit: QuantityUnit;
  condition: string;
  location: string;
  remarks: string | null;
  photo: string | null;
  submittedAt: string;
  status: RequestStatus;
  confirmed: boolean;
  schedule: InspectionSchedule | null;
  declineReason: string | null;
  result: AssessmentResult | null;
  nextStep: NextStep | null;
};

export type FarmerAccount = { name: string; mobile: string; pin: string };

export type Session =
  | { role: "none" }
  | { role: "farmer"; mobile: string }
  | { role: "guest" }
  | { role: "trader" };

export type DemoState = {
  version: 1;
  accounts: FarmerAccount[];
  session: Session;
  buyers: Buyer[];
  requests: AssessmentRequest[];
  traderBuyerId: string;
};
