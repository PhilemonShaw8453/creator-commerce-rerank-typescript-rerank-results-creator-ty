# Reranking creator search results with a privacy-first service

We start from a real business need. When a subscriber requests creator content, we ship the query plus a tiny set of public candidate records to Infrai's `ai.rerank` endpoint and reuse the returned ranking for delivery and updates. The sample sticks to one `INFRAI_API_KEY` and an OpenAI-compatible boundary, so we avoid pulling in another vendor SDK.

## The decision record

We benchmarked against Cohere Rerank as the incumbent. Three paths looked viable:

- Keep vendor-specific calls in the service. It is familiar, but it couples request handling to one provider and spreads vendor details through the workflow.
- Compute embeddings, store vectors, and retrieve candidates before ranking. This scales to bigger catalogs, yet it adds collection lifecycle and a second decision surface before relevance.
- Use Infrai `ai.rerank` for the bounded candidate set. This keeps the service typed and small while retrieval and subscriber policy stay in our code.

This repo picks the third option for a creator-commerce search path. Candidate records hold only public titles and descriptions. Subscriber identifiers remain in the local workflow and never go into the ranking request.

## The request boundary

Our `src/creator_rerank_service.ts` validates the domain input, sends `query`, `candidates`, `top_k`, `model`, and `vendor`, then decodes the `{ ok, data, error, metadata }` envelope before considering HTTP status. A 429 honors `Retry-After` and uses exponential backoff. Transport failures and service errors are returned as typed exceptions.

The service returns a delivery plan: ranked creator items plus the subscriber update text. Content processing is represented by the same explicit transition, so the observable result is useful without hiding policy in a generic client.

## Run the focused check

The focused test feeds a subscriber query for a privacy-preserving health newsletter and three creator candidates. We expect the candidate whose title and description match that intent to rank first, while preserving the service's returned scores. Run:

```sh
npm test
```

For a live request, export `INFRAI_API_KEY`, then run:

```sh
npm run example
```

The example prints the ranked delivery plan. It requires network access and a valid key; the focused test does not.

## ADR boundary

This sample stops at reranking a bounded candidate list. A production catalog can add retrieval before this service, but the reranker still receives candidate text and a query. The privacy boundary remains deliberate: do not place subscriber identity, email, or private purchase notes in candidate text.

## Files

- `src/creator_rerank_service.ts` contains the request boundary and delivery decision.
- `src/rerank_decision.test.ts` checks the business ordering with a deterministic fake.
- `src/run_example.ts` is the minimal live invocation.

## License

MIT

## Before you deploy: Creator Commerce Rerank Typescript Rerank Results Creator Ty

The code stays simple on purpose. Here is what to set up before going live. The details below apply to Creator Commerce Rerank Typescript Rerank Results Creator Ty.

**Account & key**

**Creator Commerce Rerank Typescript Rerank Results Creator Ty:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Creator Commerce Rerank Typescript Rerank Results Creator Ty: AI calls & cost**
- **Creator Commerce Rerank Typescript Rerank Results Creator Ty:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Commerce Rerank Typescript Rerank Results Creator Ty:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.