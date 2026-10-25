import assert from "node:assert/strict";
import { orderRankedItems, type CreatorItem } from "./creator_rerank_service.ts";

const items: CreatorItem[] = [
  { id: "a", title: "Studio lighting", description: "A gear review" },
  { id: "b", title: "Private health newsletter", description: "A privacy-first creator update" },
  { id: "c", title: "Ceramic practice", description: "Weekly workshop notes" }
];

const ranked = orderRankedItems(items, [0.18, 0.93, 0.41]);
assert.deepEqual(ranked.map((item) => item.id), ["b", "c", "a"]);
assert.equal(ranked[0].score, 0.93);
console.log("rerank decision: privacy-first health newsletter is first");
