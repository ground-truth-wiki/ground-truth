---
id: online-evaluation
book: 14
order: "14.9"
title: Online evaluation
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [ab-tests, feedback, monitoring]
visuals:
  - online-loop:diagram
  - canary-chart:chart
  - ab-sample:calculator
---
> [!tldr]
> Offline evals predict; online evaluation confirms. Sample production traces, score them with judges and user signals, ship changes behind canaries and A/B tests, and feed what you learn back into the offline set.

## Why it matters
Real users send inputs no eval set anticipated, and quality drifts as content, users and upstream models change. Online evaluation catches what offline evals miss and measures what users actually experience. It is also how you learn whether an offline improvement mattered at all.

## Intuition
Offline evals are the flight simulator; online evaluation is the instruments on a real flight. You trust the simulator for training and checklists, and you still watch the instruments the whole way.

```viz
{"id":"online-loop","component":"diagram","title":"Production feeds the offline eval set, and the offline set protects production","caption":"The online half of the eval flywheel. Click a stage for its chapter.","alt":"Loop diagram: production traffic is sampled, scored by judges and user signals, shown on dashboards with alerts, and turned into new offline eval cases.","data":"illustrative","w":600,"h":210,"nodes":[
{"id":"prod","label":"Production traffic","role":"external","x":0,"y":0,"w":170,"h":56},
{"id":"sample","label":"Sample traces","sub":"stratified, anonymized","role":"data","x":215,"y":0,"w":170,"h":56,"link":"#observability-tracing"},
{"id":"score","label":"Score","sub":"judges, user signals","role":"model","x":430,"y":0,"w":170,"h":56,"link":"#llm-as-judge"},
{"id":"dash","label":"Dashboards and alerts","role":"agent","x":430,"y":150,"w":170,"h":56},
{"id":"offline","label":"Offline eval set","sub":"new cases from failures","role":"data","x":215,"y":150,"w":170,"h":56,"link":"#eval-datasets"},
{"id":"ship","label":"Canary or A/B","sub":"gated rollout","role":"tool","x":0,"y":150,"w":170,"h":56,"link":"#ci-cd-for-ai"}],
"edges":[{"from":"prod","to":"sample"},{"from":"sample","to":"score"},{"from":"score","to":"dash"},{"from":"dash","to":"offline","label":"failures"},{"from":"offline","to":"ship","label":"gate"},{"from":"ship","to":"prod"}]}
```

## How it works
**Sampling and scoring traces.** Score a sample of production traces with reference-free checks: faithfulness to retrieved context, format and policy checks, judge ratings with calibrated rubrics. Stratify the sample so rare but important traffic is included.

**User signals.** Explicit feedback (thumbs, ratings, reports) is sparse and biased toward extremes. Implicit signals are richer: copy and paste, edits to drafts, retries, abandonment, escalation to a human, conversion. Define which ones mean success for your product.

**Shadow traffic.** Run a new version on copies of real requests without showing its outputs, then compare it with production offline. Safe and realistic; costs double the inference.

**Canaries.** Send a small share of traffic to the new version, watch error rates, latency, cost and quality signals, and roll back automatically if thresholds are crossed:

```viz
{"id":"canary-chart","component":"chart","type":"line","title":"A canary’s thumbs-down rate crosses the rollback line within hours, before most users see the change","caption":"Illustrative. Five percent of traffic moves to the canary at hour 3; its thumbs-down rate rises past the threshold at hour 5 and it is rolled back at hour 6.","alt":"Illustrative line chart of thumbs-down rate over twelve hours for control and canary traffic, with the canary crossing a rollback threshold and returning to baseline after rollback.","data":"illustrative","x":{"label":"Hours since deploy started"},"y":{"label":"Thumbs-down rate","unit":"pct","min":0,"max":0.1},"series":[{"name":"Control","points":[[0,0.05],[1,0.051],[2,0.049],[3,0.05],[4,0.05],[5,0.051],[6,0.05],[7,0.049],[8,0.05],[9,0.05],[10,0.051],[11,0.05],[12,0.05]]},{"name":"Canary","points":[[3,0.052],[4,0.061],[5,0.072],[6,0.078],[7,0.052],[8,0.05],[9,0.05],[10,0.051],[11,0.05],[12,0.05]]}],"bands":[{"y":0.065,"label":"Rollback threshold"}]}
```

**A/B tests.** Randomize users between versions and compare a primary metric with enough traffic to detect the difference you care about. Decide the metric, the minimum effect and the duration before starting. See [statistics for evals](#eval-statistics).

**Drift.** Monitor input distributions (topics, lengths, languages) and quality signals over time. A shift in either is a reason to refresh the offline set.

## In practice
Estimate the traffic an A/B test needs before you run it:

```viz
{"id":"ab-sample","component":"calculator","title":"Detecting a 2-point change in a 10% rate needs about 3,600 users per arm","caption":"A rule of thumb for 80% power at a two-sided 5% significance level: n per arm ≈ 16 p(1 − p) ÷ δ². Use a proper power calculation for decisions that matter.","alt":"Calculator for A/B test sample size per arm, total sample and days needed, from a baseline rate, minimum detectable change and daily traffic.","data":"formula","outputs":[{"id":"n_arm","label":"Users per arm","expr":"ceil(16 * p * (1 - p) / (delta * delta) - 0.000000001)","unit":"count","main":true},{"id":"total","label":"Total users","expr":"2 * n_arm","unit":"count"},{"id":"days","label":"Days at your traffic","expr":"ceil(total / daily_users)","unit":"count"}],"inputs":{"p":0.1,"delta":0.02,"daily_users":1000},"input_meta":{"p":{"label":"Baseline rate","unit":"0 to 1, e.g. thumbs-down rate"},"delta":{"label":"Smallest change worth detecting","unit":"absolute, 0 to 1"},"daily_users":{"label":"Users per day entering the test"}},"assumptions":["Two equal arms, a binary metric, independent users.","80% power, two-sided α = 0.05 (Lehr’s rule of thumb)."],"tests":[{"inputs":{},"expect":{"n_arm":3600,"total":7200,"days":8}},{"inputs":{"p":0.5,"delta":0.05},"expect":{"n_arm":1600,"total":3200,"days":4}}]}
```

Online evaluation checklist:
- A sampled, anonymized trace stream with reference-free scores.
- Defined implicit success signals for your product.
- Canary rollout with automatic rollback thresholds on quality, latency and cost.
- A/B tests sized before they start, with one primary metric.
- A weekly routine of turning online failures into offline cases.

## Numbers to know
> [!number]
> Formulas and rules of thumb. n per arm ≈ 16 p(1 − p) ÷ δ² for 80% power at α = 0.05. Detecting half the change needs four times the users. Canaries of 1% to 10% of traffic are common.

## Pitfalls and anti-patterns
> [!pitfall] Peeking at an A/B test until it looks significant
> Stopping the moment the p-value dips below 0.05 inflates false positives badly. Fix the sample size or use sequential methods designed for peeking.

- **Thumbs as the only signal.** Sparse and biased; add implicit signals.
- **Judges on production without calibration.** Their errors become your dashboards.
- **No rollback automation.** Bad canaries run all night.
- **Online findings that never reach the offline set.** The same failure returns.

## Talk like an expert
The vocabulary: **online evaluation**, **trace sampling**, **implicit feedback**, **shadow traffic**, **canary**, **A/B test**, **minimum detectable effect**, **drift**. Experts ask “what’s the primary metric and the minimum effect?” before an experiment starts. The live debate is how well offline judge scores predict online outcomes; teams that measure both learn which offline checks matter.

> [!hottake] A canary with automatic rollback is worth more than another week of offline evals.
> **The counterargument:** canaries only catch failures that move aggregate metrics quickly; rare but severe failures, such as one leaked record, need offline safety evals because they never show up in averages.

## Check yourself
```quiz
online-evaluation
```

## Go deeper
- Kohavi, Tang and Xu, *Trustworthy Online Controlled Experiments* (2020).
- Your observability platform’s documentation on sampling traces and online scoring.

## Related
- [Observability and tracing](#observability-tracing)
- [CI/CD for AI](#ci-cd-for-ai)
- [Statistics for evals](#eval-statistics)
- [Building eval datasets](#eval-datasets)
- [Incident response](#incidents-on-call)
