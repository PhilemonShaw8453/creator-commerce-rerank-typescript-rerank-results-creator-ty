import { createDeliveryPlan, type CreatorItem } from "./creator_rerank_service.ts";

const items: CreatorItem[] = [
  { id: "creator-1", title: "Studio lighting", description: "A gear review for home creators" },
  { id: "creator-2", title: "Private health newsletter", description: "Privacy-first health updates from a clinician" },
  { id: "creator-3", title: "Ceramic practice", description: "Weekly notes from a working artist" }
];

const plan = await createDeliveryPlan("subscriber-demo", "privacy-first health updates from a creator", items);
console.log(JSON.stringify(plan, null, 2));
