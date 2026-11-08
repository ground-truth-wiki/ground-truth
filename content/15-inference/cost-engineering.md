---
id: cost-engineering
book: 15
order: "15.10"
title: Cost engineering
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [cost, pricing, self-hosting]
visuals:
  - token-cost-calc:calculator
  - breakeven:chart
---
> [!tldr]
> AI cost is tokens × price, plus everything around it. The big levers are choosing the smallest model that passes your evals, prompt caching, shorter contexts, batch APIs for offline work, routing easy requests to cheaper models, and self-hosting only when volume justifies the fixed costs.

## Why it matters
Costs that look trivial per request become serious at scale, and agentic and reasoning workloads multiply tokens per task. Teams that do not engineer costs discover them on the invoice; teams that do often cut spend several times with no quality loss.

## Intuition
A delivery business pays per kilometer. It saves by choosing the right vehicle for each parcel, packing efficiently, avoiding repeated trips and buying its own trucks only when the routes are busy enough.

```viz
{"id":"token-cost-calc","component":"calculator","title":"At 5,000 requests a day, caching half the input saves about a quarter of the bill","caption":"Enter your own traffic and prices; defaults are illustrative. Output tokens often dominate cost even when they are fewer, because they are priced higher.","alt":"Calculator for cost per request and monthly cost from request volume, input and output tokens, prices and the cached share of input.","data":"formula","outputs":[{"id":"per_request","label":"Cost per request","expr":"(in_tokens * price_in * (cached_share * cached_mult + (1 - cached_share)) + out_tokens * price_out) / 1000000","unit":"usd"},{"id":"per_1k","label":"Cost per 1,000 requests","expr":"per_request * 1000","unit":"usd"},{"id":"monthly","label":"Monthly cost","expr":"per_request * requests_per_day * 30","unit":"usd","main":true}],"inputs":{"requests_per_day":5000,"in_tokens":3000,"out_tokens":500,"price_in":3,"price_out":15,"cached_share":0.5,"cached_mult":0.1},"input_meta":{"requests_per_day":{"label":"Requests per day"},"in_tokens":{"label":"Input tokens per request"},"out_tokens":{"label":"Output tokens per request","unit":"including reasoning tokens"},"price_in":{"label":"Input price","unit":"$ per million, illustrative"},"price_out":{"label":"Output price","unit":"$ per million, illustrative"},"cached_share":{"label":"Share of input served from cache","unit":"0 to 1"},"cached_mult":{"label":"Cached input price multiplier","unit":"× input price"}},"assumptions":["Cache writes billed at the normal input price; some providers charge a premium.","30-day month; no batch discounts.","Tool calls and retries are not included."],"tests":[{"inputs":{},"expect":{"per_request":0.01245,"per_1k":12.45,"monthly":1867.5}},{"inputs":{"cached_share":0},"expect":{"monthly":2475}}]}
```

## How it works
**Know your cost per task.** Measure tokens per request and requests per task (agents and chains make many calls), split by input, cached input, output and reasoning tokens. Dashboards by feature and customer show where money goes. See [cost and capacity](#cost-capacity).

**The levers, roughly in order of effort:**
- **Right-size the model.** The smallest model that passes your evals; often a small model for routing, extraction and classification, and a frontier model only where needed. See [choosing a model](#choosing-a-model).
- **Prompt caching.** Stable prefixes billed at a fraction of normal input. See [prompt caching](#prompt-caching).
- **Shorter contexts.** Retrieve less, summarize history, trim tool output. See [context engineering](#context-engineering).
- **Limit output.** Ask for concise answers and set maximum tokens; output usually costs several times more per token than input.
- **Reasoning effort.** Use low effort or thinking budgets where tasks are easy.
- **Batch APIs** for offline jobs, usually at a substantial discount in exchange for delayed results.
- **Routing and cascades.** Send easy requests to cheap models and escalate when a check fails. See [gateways and routers](#gateways-routers).
- **Caching answers** for repeated questions, with care about freshness.
- **Distillation or fine-tuning** a small model on a narrow task. See [distillation](#distillation-merging).
- **Self-hosting** open models when volume is high and steady.

**API versus self-hosting.** APIs cost per token with no fixed cost; self-hosting costs per GPU-hour whether used or not, plus engineering. The break-even depends on volume and utilization:

```viz
{"id":"breakeven","component":"chart","type":"line","title":"Self-hosting pays off only above a steady volume, here a few billion tokens a month","caption":"Illustrative assumptions: an API at $1 per million blended tokens; self-hosting at about $1,460 per GPU-month, each GPU handling about 2 billion tokens a month at realistic utilization, plus $2,000 a month of operations. Your numbers will differ; plug them in.","alt":"Illustrative line chart of monthly cost against monthly token volume for an API and for self-hosting, crossing at about 3.5 billion tokens per month.","data":"illustrative","x":{"label":"Tokens per month (billions, log scale)","log":true},"y":{"label":"Monthly cost","unit":"usd","log":true},"series":[{"name":"API","points":[[0.1,100],[0.5,500],[1,1000],[2,2000],[5,5000],[10,10000],[20,20000]]},{"name":"Self-hosted","points":[[0.1,3460],[0.5,3460],[1,3460],[2,3460],[5,6380],[10,9300],[20,16600]]}]}
```

## In practice
A cost review in one afternoon:
1. Pull a week of usage by feature: requests, tokens by type, cost.
2. Find the top three features by spend.
3. For each, test a smaller model, prompt caching and context trimming against your evals.
4. Move offline workloads to batch APIs.
5. Set budgets and alerts per feature and per customer.

## Numbers to know
> [!number]
> Formulas and rules of thumb. Cost per request = input tokens × input price + output tokens × output price, adjusted for cached input. Output tokens are commonly priced several times higher than input. Reasoning tokens are billed as output.

## Pitfalls and anti-patterns
> [!pitfall] One frontier model for everything
> Classification, routing and extraction rarely need the largest model. Right-sizing is usually the biggest single saving.

- **Ignoring reasoning tokens.** They can dwarf visible output.
- **Self-hosting at low utilization.** Idle GPUs cost the same as busy ones.
- **Optimizing cost without evals.** A cheaper model that fails users costs more.

## Talk like an expert
The vocabulary: **cost per task**, **blended price**, **cached input**, **batch API**, **cascade**, **routing**, **break-even volume**, **utilization**, **unit economics**. Experts quote cost per successful task, not per token. The live debate is how falling prices per token interact with rising tokens per task as agents and reasoning spread.

> [!hottake] Cost per token keeps falling, and cost per task keeps rising.
> **The counterargument:** for many established workloads, cost per task has fallen dramatically as cheaper models reached the quality bar; the rise is concentrated in new agentic uses that did not exist before.

## Check yourself
```quiz
cost-engineering
```

## Go deeper
- Your providers’ pricing pages for current prices, caching and batch discounts.
- Chen et al., “FrugalGPT” (2023), on model cascades.

## Related
- [Cost and capacity](#cost-capacity)
- [Prompt caching](#prompt-caching)
- [Choosing a model](#choosing-a-model)
- [Gateways and routers](#gateways-routers)
- [Back-of-envelope estimation](#back-of-envelope)
- [Gateway keys, routing and failover in depth](#gateway-routing-in-depth)
- [Energy, power and AI data centers](#ai-energy)
- [Asynchronous and batch AI workloads](#async-batch-workloads)
- [AI pricing and unit economics](#ai-pricing-unit-economics)
