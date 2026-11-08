---
id: cost-capacity
book: 16
order: "16.7"
title: Cost and capacity
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [budgets, quotas, capacity]
visuals:
  - budget-dashboard:chart
  - gpu-capacity:calculator
---
> [!tldr]
> Cost and capacity management means attributing spend to features and customers, forecasting, enforcing budgets and rate limits per tenant, planning provider quotas and GPU capacity for peaks, and alerting on anomalies such as runaway agents before they become invoices.

## Why it matters
AI spend scales with usage in ways that surprise finance: one enthusiastic customer, one looping agent or one viral feature can multiply the bill in days. Provider rate limits and GPU capacity also cap growth. Teams that plan capacity and enforce budgets avoid both the surprise invoice and the outage at launch.

## Intuition
Running AI features is running a utility. You meter every customer, forecast demand, provision for the peak, cap anyone who suddenly uses ten times their share, and watch for leaks.

```viz
{"id":"budget-dashboard","component":"chart","type":"line","title":"At the current rate, this month’s spend crosses its budget around day 24","caption":"Illustrative cumulative spend with a one-day spike on day 12 from a looping agent, and a linear forecast for the rest of the month.","alt":"Illustrative line chart of cumulative monthly spend against a budget line, with a forecast crossing the budget around day 24.","data":"illustrative","x":{"label":"Day of month"},"y":{"label":"Cumulative spend","unit":"usd","min":0},"series":[{"name":"Actual","points":[[1,1100],[3,3300],[6,6600],[9,9900],[12,16200],[15,19500],[18,22800]]},{"name":"Forecast","points":[[18,22800],[22,27200],[26,31600],[30,36000]]}],"bands":[{"y":30000,"label":"Monthly budget"}]}
```

## How it works
**Attribution.** Tag every model call with feature, tenant and user; aggregate tokens and cost by tag. Cost per task (not per call) is the unit that matters for agents. See [observability](#observability-tracing).

**Budgets and quotas.** Set limits per tenant, feature and user: tokens per minute, requests per day, dollars per month. Enforce them at the API or model gateway, with clear errors and graceful degradation when exceeded. See [gateways and routers](#gateways-routers).

**Anomaly detection.** Alert on spend or token rates far above a tenant’s normal pattern. A runaway agent loop shows up as a spike in calls per session; a step budget stops it. See [guardrails](#guardrails-control).

**Provider capacity.** API rate limits are per organization and model; request increases ahead of launches, spread load across regions or providers, and keep fallbacks ready. Provisioned or reserved throughput offerings trade commitment for guaranteed capacity.

**GPU capacity.** For self-hosting, size for peak demand with headroom, using measured tokens per second per GPU at your latency target:

```viz
{"id":"gpu-capacity","component":"calculator","title":"Peak demand, output length and measured GPU throughput set how many GPUs you need","caption":"A first estimate from decode demand only, with a utilization target and spare capacity. Measure tokens per second per GPU on your engine at your SLO; prefill-heavy traffic needs more.","alt":"Calculator for the number of GPUs needed from peak requests per second, output tokens, measured throughput per GPU, target utilization and spare GPUs.","data":"formula","outputs":[{"id":"demand","label":"Output tokens per second at peak","expr":"peak_rps * out_tokens","unit":"count"},{"id":"gpus","label":"GPUs at target utilization","expr":"ceil(demand / (gpu_tok_s * util) - 0.000000001)","unit":"count"},{"id":"total","label":"With spare capacity","expr":"gpus + spare","unit":"count","main":true}],"inputs":{"peak_rps":20,"out_tokens":400,"gpu_tok_s":2500,"util":0.7,"spare":1},"input_meta":{"peak_rps":{"label":"Peak requests per second"},"out_tokens":{"label":"Average output tokens per request"},"gpu_tok_s":{"label":"Output tokens per second per GPU","unit":"measured at your SLO"},"util":{"label":"Target utilization","unit":"0 to 1"},"spare":{"label":"Spare GPUs","unit":"for failures and deploys"}},"assumptions":["Decode-dominated traffic; add capacity for long prompts.","Throughput measured at your latency target, not at maximum batch.","Even load across GPUs."],"tests":[{"inputs":{},"expect":{"demand":8000,"gpus":5,"total":6}},{"inputs":{"peak_rps":50},"expect":{"gpus":12,"total":13}}]}
```

**Forecasting.** Combine growth in users, usage per user and tokens per task. New features, model switches and reasoning settings change tokens per task abruptly; re-forecast after each.

**Cost reviews.** A monthly review of the top spenders by feature, with the levers in [cost engineering](#cost-engineering).

## In practice
- Tag every call with feature, tenant and user, and build a cost dashboard on those tags.
- Set per-tenant budgets with alerts at 50%, 80% and 100%.
- Add step and dollar budgets per agent run.
- Request provider quota increases weeks before launches.
- Size self-hosted capacity from measured throughput at your SLO, with spare GPUs.
- Re-forecast after every model, prompt or feature change.

## Numbers to know
> [!number]
> Formulas. GPUs ≈ peak output tokens per second ÷ (tokens per second per GPU × target utilization), plus spares. Monthly cost ≈ users × tasks per user × cost per task.

## Pitfalls and anti-patterns
> [!pitfall] No per-tenant limits
> One customer’s automation can consume your whole provider quota and budget, taking the product down for everyone.

- **Monthly bills as the only signal.** By then the money is spent.
- **Sizing GPUs from averages.** Peaks decide whether users wait.
- **Ignoring rate limits until launch day.** Quota increases take time.

## Talk like an expert
The vocabulary: **cost attribution**, **unit economics**, **cost per task**, **budget**, **quota**, **rate limit**, **provisioned throughput**, **capacity planning**, **headroom**. Experts can state cost per task for each feature and the headroom before the next limit. The live debate is pricing: how to price AI features when cost per task varies widely by user and task.

> [!hottake] Per-tenant budgets are a reliability feature, not a finance feature.
> **The counterargument:** hard limits can block high-value customers at the worst moment; soft limits with alerts and human review may serve the business better for key accounts.

## Check yourself
```quiz
cost-capacity
```

## Go deeper
- Your providers’ documentation on rate limits, usage tiers and provisioned throughput.
- FinOps Foundation material on cloud cost management, adapted for AI.

## Related
- [Cost engineering](#cost-engineering)
- [Gateways and routers](#gateways-routers)
- [Observability and tracing](#observability-tracing)
- [Back-of-envelope estimation](#back-of-envelope)
- [Guardrails and control](#guardrails-control)
