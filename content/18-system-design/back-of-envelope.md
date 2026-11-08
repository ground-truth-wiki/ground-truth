---
id: back-of-envelope
book: 18
order: "18.3"
title: Back-of-the-envelope estimation
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [estimation, capacity, cost]
visuals:
  - qps-to-gpus:calculator
  - estimate-steps:stepper
---
> [!tldr]
> Estimate any AI system in a few lines: users × requests per user gives traffic; traffic × tokens gives volume; volume × price gives API cost; peak traffic × output tokens ÷ throughput per GPU gives hardware. Round aggressively, state assumptions, and check the result against a known reference.

## Why it matters
Estimates decide whether a design is viable before anyone builds it, and they are a staple of design reviews and interviews. Most surprises in AI costs come from skipping the arithmetic: agents multiplying calls, long contexts multiplying tokens, peaks multiplying capacity.

## Intuition
A back-of-the-envelope estimate is a pilot’s fuel calculation: distance, burn rate, reserve. It does not need decimals; it needs the right order of magnitude and a safety margin.

```viz
{"id":"qps-to-gpus","component":"calculator","title":"From users to tokens, dollars and GPUs in five lines","caption":"Enter your assumptions. Defaults: 50,000 daily users, 6 requests each, 2,500 input and 400 output tokens, a peak of 3 times average, illustrative prices and a measured 2,500 output tokens per second per GPU.","alt":"Calculator from daily users and requests to average and peak requests per second, monthly tokens, monthly API cost and GPUs needed at peak.","data":"formula","outputs":[{"id":"rps_avg","label":"Average requests per second","expr":"users * req_per_user / 86400","unit":"count"},{"id":"rps_peak","label":"Peak requests per second","expr":"rps_avg * peak_factor","unit":"count"},{"id":"mtok_month","label":"Tokens per month (millions)","expr":"users * req_per_user * 30 * (in_tok + out_tok) / 1000000","unit":"count"},{"id":"api_month","label":"API cost per month","expr":"users * req_per_user * 30 * (in_tok * price_in + out_tok * price_out) / 1000000","unit":"usd","main":true},{"id":"gpus","label":"GPUs at peak, if self-hosted","expr":"ceil(rps_peak * out_tok / gpu_tok_s - 0.000000001)","unit":"count"}],"inputs":{"users":50000,"req_per_user":6,"in_tok":2500,"out_tok":400,"price_in":3,"price_out":15,"peak_factor":3,"gpu_tok_s":2500},"input_meta":{"users":{"label":"Daily active users"},"req_per_user":{"label":"Requests per user per day"},"in_tok":{"label":"Input tokens per request"},"out_tok":{"label":"Output tokens per request"},"price_in":{"label":"Input price","unit":"$ per million, illustrative"},"price_out":{"label":"Output price","unit":"$ per million, illustrative"},"peak_factor":{"label":"Peak ÷ average traffic"},"gpu_tok_s":{"label":"Output tokens per second per GPU","unit":"measured at your SLO"}},"assumptions":["No caching or batch discounts; caching would cut input cost substantially.","GPU estimate covers decode only, at full utilization; add headroom and spares."],"tests":[{"inputs":{},"expect":{"rps_avg":3.4722222,"rps_peak":10.416667,"mtok_month":26100,"api_month":121500,"gpus":2},"tol":0.0001},{"inputs":{"users":500000},"expect":{"api_month":1215000,"gpus":17},"tol":0.0001}]}
```

## How it works
**Traffic.** Daily users × requests per user ÷ 86,400 seconds gives average requests per second; multiply by a peak factor (often 2 to 5) for capacity. For agents, multiply by model calls per task.

**Volume and cost.** Requests × tokens per request gives tokens; multiply by price, adjusting for cached input and batch discounts. See [cost engineering](#cost-engineering).

**Hardware.** Peak output tokens per second ÷ measured tokens per second per GPU gives decode GPUs; add memory checks for KV cache at your concurrency. See [memory math](#memory-math).

**Sanity checks.** Compare with a reference: a known product’s scale, your current bill, a published benchmark. If the estimate is off by more than an order of magnitude from intuition, find the wrong assumption.

```viz
{"id":"estimate-steps","component":"stepper","title":"A worked estimate for an agent feature, out loud","caption":"Step through. Each line rounds to keep the arithmetic in your head.","alt":"Stepper of a worked back-of-the-envelope estimate for an agentic feature from users to monthly cost.","data":"illustrative","frames":[
{"label":"Users","caption":"10,000 daily users each run 3 agent tasks: 30,000 tasks a day."},
{"label":"Calls","caption":"Each task averages 15 model calls: 450,000 calls a day, about 5 per second on average, 15 at peak."},
{"label":"Tokens","caption":"Context grows over the task; average 20,000 input and 500 output tokens per call: 9 billion input and 225 million output tokens a day."},
{"label":"Caching","caption":"Most input is a repeated prefix; assume 80% is cached at a tenth of the price: effective input is like 2.5 billion full-price tokens."},
{"label":"Cost","caption":"At illustrative prices of $3 and $15 per million: about $7,500 input plus $3,400 output, roughly $11,000 a day, $330,000 a month. Caching saved about $20,000 a day."},
{"label":"Decision","caption":"About $1.10 per user per day, over $30 a month, is too much for this product. Cut calls per task, trim context, or route easy steps to a small model, then re-estimate."}]}
```

## In practice
- Write assumptions as a short list; estimates are only as good as them.
- Round to one or two significant figures.
- Estimate the agentic multiplier explicitly: calls per task and context growth.
- Re-estimate when any assumption changes by more than a factor of two.

## Numbers to know
> [!number]
> Facts and rules of thumb. A day has 86,400 seconds, so 1 million requests a day is about 12 per second on average. Peak-to-average ratios of 2 to 5 are common. See [numbers to know](#numbers-to-know) for more constants.

## Pitfalls and anti-patterns
> [!pitfall] Forgetting the agent multiplier
> One user request can mean dozens of model calls with growing contexts; estimates per request then understate cost by an order of magnitude.

- **Average-only capacity.** Peaks decide whether users wait.
- **False precision.** Five significant figures on guessed inputs mislead.

## Talk like an expert
The vocabulary: **QPS**, **peak factor**, **tokens per request**, **calls per task**, **effective tokens**, **cost per user**, **order of magnitude**, **sanity check**. Experts estimate out loud, state assumptions and update quickly. The live debate is how to estimate agent costs when calls per task vary widely between users.

> [!hottake] Every AI design review should start with a cost estimate per user per month.
> **The counterargument:** early in discovery, fixating on cost can kill valuable ideas before they are proven; estimate early, but optimize after value is clear.

## Check yourself
```quiz
back-of-envelope
```

## Go deeper
- The [numbers to know](#numbers-to-know) and [cost and capacity](#cost-capacity) chapters.

## Related
- [Numbers every AI engineer should know](#numbers-to-know)
- [Cost engineering](#cost-engineering)
- [Cost and capacity](#cost-capacity)
- [Memory math](#memory-math)
- [The AI system design method](#system-design-method)
- [AI pricing and unit economics](#ai-pricing-unit-economics)
