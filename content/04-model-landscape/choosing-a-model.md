---
id: choosing-a-model
book: 4
order: "4.6"
title: Choosing a model
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [model-selection, routing, cost]
visuals:
  - model-choice-tree:tree
  - cost-per-correct:calculator
---
> [!tldr]
> Choose a model by evidence on your tasks: filter by hard constraints (data terms, regions, modalities, context, latency), shortlist by public results, then compare finalists on your eval set by quality, cost per correct answer and latency. Re-run the comparison whenever models or prices change.

## Why it matters
Model choice drives quality, cost and user experience, and it is revisited constantly as new models ship. A repeatable selection process makes switching a measured decision rather than a gamble.

## Intuition
Choosing a model is hiring for a specific role: check eligibility first, interview a shortlist on the actual work, and weigh salary against output.

```viz
{"id":"model-choice-tree","component":"tree","title":"Constraints first, then capability, then cost","caption":"Expand each stage. Most choices are decided by constraints before quality is even compared.","alt":"Decision tree for choosing a model: hard constraints, shortlisting, evaluation, and cost and latency.","data":"illustrative","open":1,"root":{"label":"Choosing a model","children":[
{"label":"1. Hard constraints","children":[{"label":"Data terms, regions, compliance, modalities, context length, on-device or self-hosted needs","link":"#enterprise-readiness"}]},
{"label":"2. Shortlist","children":[{"label":"Two or three families and tiers that fit, from public results","link":"#frontier-families"}]},
{"label":"3. Evaluate","children":[{"label":"Your eval set, several attempts, per-slice results","link":"#why-evals"}]},
{"label":"4. Cost and latency","children":[{"label":"Cost per correct answer, TTFT and throughput at your load","link":"#cost-engineering"}]},
{"label":"5. Route","children":[{"label":"Different models per task or difficulty through a gateway","link":"#gateways-routers"}]}]}}
```

## How it works
**Constraints.** Data retention and training terms, regional processing, certifications, modalities, context window, tool support, structured outputs, rate limits and whether weights must be self-hosted.

**Quality on your tasks.** Run the eval set on each finalist with its best prompt (prompts do not transfer perfectly; see [model-specific notes](#model-specific-notes)), several attempts per case, and compare per slice.

**Cost per correct answer.** Price alone misleads: a cheaper model that fails more often may cost more per success, especially when failures need retries or human review.

```viz
{"id":"cost-per-correct","component":"calculator","title":"A model three times cheaper per call can still lose on cost per correct answer","caption":"Enter cost per call and accuracy for two models. Optionally add the cost of handling each failure, such as a retry or human review.","alt":"Calculator comparing two models’ cost per correct answer including the cost of failures.","data":"formula","outputs":[{"id":"a_cpc","label":"Model A: cost per correct answer","expr":"(cost_a + (1 - acc_a) * failure_cost) / acc_a","unit":"usd"},{"id":"b_cpc","label":"Model B: cost per correct answer","expr":"(cost_b + (1 - acc_b) * failure_cost) / acc_b","unit":"usd"},{"id":"ratio","label":"B ÷ A","expr":"b_cpc / a_cpc","unit":"count","main":true}],"inputs":{"cost_a":0.012,"acc_a":0.92,"cost_b":0.004,"acc_b":0.7,"failure_cost":0.05},"input_meta":{"cost_a":{"label":"Model A cost per call","unit":"$"},"acc_a":{"label":"Model A accuracy","unit":"0 to 1"},"cost_b":{"label":"Model B cost per call","unit":"$"},"acc_b":{"label":"Model B accuracy","unit":"0 to 1"},"failure_cost":{"label":"Cost of handling a failure","unit":"$, review or retry"}},"assumptions":["Failures are detected and handled at the stated cost.","Accuracy measured on your eval set."],"tests":[{"inputs":{},"expect":{"a_cpc":0.0173913,"b_cpc":0.02714286,"ratio":1.5607143},"tol":0.0001},{"inputs":{"failure_cost":0},"expect":{"ratio":0.4380952},"tol":0.0001}]}
```

**Latency.** Time to first token and tokens per second at your expected load, measured from your region. See [latency and throughput](#latency-throughput).

**Ecosystem and stability.** SDKs, tooling, support, deprecation policy and how often the provider changes models.

## In practice
1. Write constraints and the eval set before testing models.
2. Evaluate two or three finalists with tuned prompts.
3. Compute cost per correct answer, including failure handling.
4. Choose per route; keep a tested fallback. See [reliability](#reliability-engineering).
5. Re-evaluate quarterly or when a major model ships.

## Numbers to know
> [!number]
> Formula. Cost per correct answer = (cost per call + failure rate × cost per failure) ÷ accuracy. Price differences between tiers often exceed ten times; accuracy differences on your tasks may be small or large.

## Pitfalls and anti-patterns
> [!pitfall] Choosing by price per token
> Cheaper calls that fail more often can cost more per success once retries and reviews are counted.

- **Testing finalists with one shared prompt.** Each model deserves its best prompt.
- **Never revisiting.** The best choice changes every few months.

## Talk like an expert
The vocabulary: **hard constraints**, **shortlist**, **eval set**, **cost per correct answer**, **per-route model**, **fallback**, **deprecation policy**. Experts present model choices as tables of quality, cost and latency per slice. The live debate is how much to optimize per route versus standardizing on one model for simplicity.

> [!hottake] The right question is never “which model is best?” but “which model is best for this route?”
> **The counterargument:** every additional model adds prompts to maintain, evals to run and behaviors to understand; many teams are better served by one strong default and a small model for bulk tasks.

## Check yourself
```quiz
choosing-a-model
```

## Go deeper
- The [benchmark literacy](#benchmark-literacy) and [cost engineering](#cost-engineering) chapters.

## Related
- [Frontier model families](#frontier-families)
- [Benchmark literacy](#benchmark-literacy)
- [Cost engineering](#cost-engineering)
- [Gateways and routers](#gateways-routers)
- [Specialist models](#specialist-models)
- [Model types: base, instruct, reasoning and omni](#model-types)
- [Model licenses and openness definitions](#model-licenses)
- [The benchmark catalog](#benchmark-catalog)
- [Arenas and leaderboards](#arenas-leaderboards)
- [Cloud AI platforms and inference providers](#cloud-ai-platforms)
- [Multilingual and low-resource language models](#multilingual-models)
- [The AI industry map: labs, clouds, chips and money](#ai-industry-map)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Model versions, previews and deprecations](#model-lifecycle)
