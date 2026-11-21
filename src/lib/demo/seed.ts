import type { AssessmentRequest, Buyer, DemoState, ProductGuide, ProductId } from "./types";

export const PRODUCTS: { id: ProductId; name: string; local: string; hint: string }[] = [
  { id: "corn", name: "Corn", local: "Mais", hint: "Shelled yellow or white corn" },
  { id: "palay", name: "Palay", local: "Humay", hint: "Unmilled rice grain" },
  { id: "rubber", name: "Rubber", local: "Goma", hint: "Cup lumps from tapping" },
  { id: "banana", name: "Banana", local: "Saging", hint: "" },
  { id: "cassava", name: "Cassava", local: "Kamoteng kahoy", hint: "" },
  { id: "coconut", name: "Coconut", local: "Niyog", hint: "" },
  { id: "coffee", name: "Coffee", local: "Kape", hint: "" },
  { id: "cacao", name: "Cacao", local: "Kakaw", hint: "" },
  { id: "sweet-potato", name: "Sweet potato", local: "Kamote", hint: "" },
  { id: "tomato", name: "Tomato", local: "Kamatis", hint: "" },
];

export const AREAS = ["Banisilan", "Alamada", "Carmen", "Kabacan"] as const;

export const CONDITIONS = [
  "Dried and cleaned",
  "Dried, not yet cleaned",
  "Freshly harvested (still wet)",
  "Not sure",
] as const;

export const DEMO_ACCOUNT = { name: "Ramon", mobile: "09171234567", pin: "1234" };

const cornGuide = (price: number | null, strict: boolean): ProductGuide => ({
  requirements: [
    `Dry kernels — moisture ${strict ? "14%" : "15%"} or lower. Dry corn feels hard and cracks when bitten.`,
    "Fully shelled, with no cobs or husks mixed in.",
    "Clean — no stones, soil, or plastic in the sacks.",
    "Packed in clean, dry sacks of about 50 kg each.",
  ],
  defects: [
    "Mold (amag) — green, black, or white spots on kernels.",
    "Insect damage (bukbok) — small holes or powder in kernels.",
    "Discolored or rotten kernels.",
    "Many broken kernels or too much dust.",
    "Wet corn that has not been dried enough.",
  ],
  grades: [
    { name: "Grade 1", description: `Moisture ${strict ? "14%" : "15%"} or lower, almost no damaged kernels (2% or less).` },
    { name: "Grade 2", description: "Moisture up to 16%, a few damaged kernels (up to 5%). Lower price." },
    { name: "Not accepted", description: "Moisture above 18%, visible mold, or heavy insect damage." },
  ],
  price: price === null ? null : { amount: price, unit: "kg" },
  updatedAt: "2026-11-15",
});

const palayGuide = (price: number | null): ProductGuide => ({
  requirements: [
    "Dry palay — moisture 14% or lower. Dry grains break cleanly when bitten.",
    "Full, mature grains from one variety only.",
    "Cleaned — no straw, stones, or empty grains (ipa).",
    "Packed in clean sacks, kept off the ground.",
  ],
  defects: [
    "Empty or half-filled grains (hungkag).",
    "Yellow or discolored grains from late drying.",
    "Sprouted grains (got wet after harvest).",
    "Mixed varieties in one sack.",
    "Too much moisture — fresh palay is priced lower.",
  ],
  grades: [
    { name: "Premium dry", description: "Moisture 14% or lower, clean, one variety, very few defects." },
    { name: "Regular dry", description: "Moisture up to 16%, some empty or yellow grains." },
    { name: "Fresh (wet) palay", description: "Just harvested and not dried. Accepted by some buyers at a lower price." },
  ],
  price: price === null ? null : { amount: price, unit: "kg" },
  updatedAt: "2026-11-12",
});

const rubberGuide = (price: number | null): ProductGuide => ({
  requirements: [
    "Cup lumps only — the hardened rubber collected from tapping cups.",
    "Clean — no bark, leaves, soil, stones, or plastic.",
    "Allowed to set and drain for at least 3–5 days.",
    "Not soaked in water to add weight.",
  ],
  defects: [
    "Dirt, bark, or other things mixed inside the lumps.",
    "Very wet lumps — lower DRC (dry rubber content, the actual rubber in the lump).",
    "Bad smell from old or spoiled latex.",
  ],
  grades: [
    { name: "Grade A", description: "Clean, well-drained lumps. High rubber content (DRC around 55% or more)." },
    { name: "Grade B", description: "Some moisture or small amount of dirt. Lower price." },
    { name: "Not accepted", description: "Heavily contaminated or soaked lumps." },
  ],
  price: price === null ? null : { amount: price, unit: "kg" },
  updatedAt: "2026-11-10",
});

export const SEED_BUYERS: Buyer[] = [
  {
    id: "valley-harvest",
    name: "Valley Harvest Trading",
    municipality: "Banisilan",
    area: "Poblacion, Banisilan, Cotabato",
    about: "Buys corn and palay. Warehouse near the public market.",
    guides: { corn: cornGuide(17.5, true), palay: palayGuide(21) },
  },
  {
    id: "upland-farm",
    name: "Upland Farm Supply",
    municipality: "Alamada",
    area: "Brgy. Camansi, Alamada, Cotabato",
    about: "Buys corn and rubber cup lumps. Also sells farm inputs.",
    guides: { corn: cornGuide(17, false), rubber: rubberGuide(38) },
  },
  {
    id: "foothill-produce",
    name: "Foothill Produce Trading",
    municipality: "Carmen",
    area: "Brgy. Kibia, Carmen, Cotabato",
    about: "Buys palay, corn, and rubber from farms in the foothills.",
    guides: { palay: palayGuide(20.5), corn: cornGuide(16.8, false), rubber: rubberGuide(null) },
  },
  {
    id: "riverside-grains",
    name: "Riverside Grains Buying Station",
    municipality: "Kabacan",
    area: "Poblacion, Kabacan, Cotabato",
    about: "Buys dry palay and corn. Prices shared after inspection.",
    guides: { palay: palayGuide(null), corn: cornGuide(null, true) },
  },
];

const base = {
  remarks: null,
  photo: null,
  confirmed: false,
  schedule: null,
  declineReason: null,
  result: null,
  nextStep: null,
} satisfies Partial<AssessmentRequest>;

export const SEED_REQUESTS: AssessmentRequest[] = [
  {
    ...base,
    id: "AS-1042",
    farmerKey: "me",
    farmerName: "Ramon",
    product: "corn",
    buyerId: "valley-harvest",
    quantity: 30,
    unit: "sacks",
    condition: "Dried and cleaned",
    location: "Brgy. Kalawaig, Banisilan",
    remarks: "Dried for 3 days on the road.",
    submittedAt: "2026-11-18T08:30:00",
    status: "scheduled",
    confirmed: true,
    schedule: { date: "2026-11-24", time: "09:00", place: "Valley Harvest warehouse, Poblacion" },
  },
  {
    ...base,
    id: "AS-1047",
    farmerKey: "me",
    farmerName: "Ramon",
    product: "palay",
    buyerId: "foothill-produce",
    quantity: 20,
    unit: "sacks",
    condition: "Dried, not yet cleaned",
    location: "Brgy. Kalawaig, Banisilan",
    submittedAt: "2026-11-20T15:10:00",
    status: "pending",
  },
  {
    ...base,
    id: "AS-1031",
    farmerKey: "me",
    farmerName: "Ramon",
    product: "corn",
    buyerId: "upland-farm",
    quantity: 1200,
    unit: "kg",
    condition: "Dried and cleaned",
    location: "Brgy. Kalawaig, Banisilan",
    submittedAt: "2026-11-10T07:45:00",
    status: "completed",
    confirmed: true,
    schedule: { date: "2026-11-14", time: "10:00", place: "Farm, Brgy. Kalawaig" },
    result: {
      grade: "Grade 2",
      observations:
        "Moisture about 16% by meter. Around 4% of kernels have insect damage. A few small stones in two sacks.",
      deductions: "About 2% weight deduction for moisture.",
      price: { amount: 16.2, unit: "kg" },
      remarks: "Dry for 1–2 more days and sift out stones. It may reach Grade 1.",
      inspectedAt: "2026-11-14T10:20:00",
    },
  },
  {
    ...base,
    id: "AS-1025",
    farmerKey: "me",
    farmerName: "Ramon",
    product: "rubber",
    buyerId: "upland-farm",
    quantity: 150,
    unit: "kg",
    condition: "Dried and cleaned",
    location: "Brgy. Kalawaig, Banisilan",
    submittedAt: "2026-11-05T09:00:00",
    status: "unavailable",
    declineReason: "Our rubber storage is full this week. Please ask again after December 1.",
  },
  {
    ...base,
    id: "AS-1049",
    farmerKey: "linda",
    farmerName: "Linda M.",
    product: "palay",
    buyerId: "valley-harvest",
    quantity: 40,
    unit: "sacks",
    condition: "Freshly harvested (still wet)",
    location: "Brgy. Busaon, Banisilan",
    remarks: "Harvested yesterday. Can dry for 2 days if needed.",
    submittedAt: "2026-11-20T17:20:00",
    status: "pending",
  },
  {
    ...base,
    id: "AS-1038",
    farmerKey: "pedro",
    farmerName: "Pedro A.",
    product: "corn",
    buyerId: "valley-harvest",
    quantity: 2000,
    unit: "kg",
    condition: "Dried and cleaned",
    location: "Brgy. Malinao, Banisilan",
    submittedAt: "2026-11-12T10:00:00",
    status: "completed",
    confirmed: true,
    schedule: { date: "2026-11-15", time: "08:30", place: "Farm, Brgy. Malinao" },
    result: {
      grade: "Grade 1",
      observations: "Moisture 13.8%. Clean, very few broken kernels.",
      deductions: null,
      price: { amount: 17.5, unit: "kg" },
      remarks: "Good quality. Bring within 5 days to keep moisture low.",
      inspectedAt: "2026-11-15T09:00:00",
    },
  },
  {
    ...base,
    id: "AS-1044",
    farmerKey: "nena",
    farmerName: "Nena S.",
    product: "rubber",
    buyerId: "foothill-produce",
    quantity: 300,
    unit: "kg",
    condition: "Dried and cleaned",
    location: "Brgy. Kibia, Carmen",
    submittedAt: "2026-11-19T11:30:00",
    status: "scheduled",
    confirmed: true,
    schedule: { date: "2026-11-23", time: "14:00", place: "Foothill buying station, Kibia" },
  },
  {
    ...base,
    id: "AS-1048",
    farmerKey: "carlo",
    farmerName: "Carlo B.",
    product: "corn",
    buyerId: "valley-harvest",
    quantity: 800,
    unit: "kg",
    condition: "Dried, not yet cleaned",
    location: "Brgy. Pantar, Banisilan",
    submittedAt: "2026-11-21T06:50:00",
    status: "pending",
  },
];

export function createSeedState(): DemoState {
  return {
    version: 1,
    accounts: [DEMO_ACCOUNT],
    session: { role: "none" },
    buyers: structuredClone(SEED_BUYERS),
    requests: structuredClone(SEED_REQUESTS),
    traderBuyerId: "valley-harvest",
  };
}
