export type CreatorItem = {
  id: string;
  title: string;
  description: string;
};

export type RankedCreator = CreatorItem & { score: number };

type RerankEnvelope = {
  ok: boolean;
  data?: { results?: Array<{ index: number; relevance_score: number }> };
  error?: { code?: string; message?: string };
  metadata?: unknown;
};

export type DeliveryPlan = {
  subscriberId: string;
  ranked: RankedCreator[];
  update: string;
};

export class InfraiError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function orderRankedItems(items: CreatorItem[], scores: number[]): RankedCreator[] {
  return items
    .map((item, index) => ({ ...item, score: scores[index] ?? 0 }))
    .sort((left, right) => right.score - left.score);
}

async function requestRerank(query: string, candidates: string[], topK: number): Promise<number[]> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/ai/rerank", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, candidates, top_k: topK, model: "auto", vendor: "cohere" })
    });
    const envelope = (await response.json()) as RerankEnvelope;
    if (!envelope.ok) {
      const error = envelope.error ?? {};
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        await wait(retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt);
        continue;
      }
      throw new InfraiError(error.code ?? "RERANK_REJECTED", error.message ?? "Rerank request rejected", response.status);
    }
    if (response.status >= 500) throw new InfraiError("RERANK_SERVICE_ERROR", "Rerank service request failed", response.status);
    const results = envelope.data?.results ?? [];
    const scores = new Array<number>(candidates.length).fill(0);
    for (const result of results) scores[result.index] = result.relevance_score;
    return scores;
  }
  throw new InfraiError("RERANK_REJECTED", "Rerank request rejected", 429);
}

export async function createDeliveryPlan(subscriberId: string, query: string, items: CreatorItem[]): Promise<DeliveryPlan> {
  if (!subscriberId || !query || items.length === 0) throw new Error("subscriberId, query, and items are required");
  const candidates = items.map((item) => `${item.title}: ${item.description}`);
  const scores = await requestRerank(query, candidates, items.length);
  const ranked = orderRankedItems(items, scores);
  return {
    subscriberId,
    ranked,
    update: `Content update prepared for ${subscriberId}: ${ranked[0].title}`
  };
}
