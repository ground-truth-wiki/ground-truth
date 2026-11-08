---
id: test-time-scaling
book: 19
order: "19.2"
title: Reasoning and test-time scaling
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [reasoning, test-time-compute]
visuals:
  - ttc-chart:chart
  - sequential-parallel:compare
---
> [!tldr]
> Test-time scaling spends more compute per question to get better answers: longer reasoning (sequential), more samples with voting or verification (parallel), and search over candidate solutions. Gains are large on checkable problems and diminish quickly elsewhere; verifiers decide how far parallel scaling goes.

## Why it matters
Reasoning modes, “deep think” settings and best-of-n strategies are now product features with real costs. Knowing which kind of test-time compute helps which task lets teams buy accuracy efficiently.

## Intuition
Sequential scaling is thinking longer about one attempt; parallel scaling is asking many people and taking the best or most common answer; search is exploring a maze with a map of which corridors look promising.

```viz
{"id":"ttc-chart","component":"chart","type":"line","title":"With a good verifier, best-of-n keeps improving; majority voting levels off","caption":"Illustrative curves on a checkable task; not real measurements. Without a reliable verifier, best-of-n can even get worse as samples increase.","alt":"Illustrative line chart of accuracy against number of samples for majority voting and best-of-n with a verifier.","data":"illustrative","x":{"label":"Samples per question (log scale)","log":true},"y":{"label":"Accuracy","unit":"pct","min":0.4,"max":1},"series":[{"name":"Best-of-n with verifier","points":[[1,0.55],[2,0.63],[4,0.71],[8,0.78],[16,0.84],[32,0.88],[64,0.91]]},{"name":"Majority vote","points":[[1,0.55],[2,0.57],[4,0.63],[8,0.67],[16,0.69],[32,0.7],[64,0.7]]}]}
```

## How it works
**Sequential.** Reasoning models think for longer when allowed; accuracy grows roughly with the logarithm of thinking tokens on hard tasks. See [reasoning models](#reasoning-models).

**Parallel.** Sample several solutions; take the majority answer (self-consistency) or choose with a verifier or reward model (best-of-n). Verifiers can be tests, checkers or trained process reward models.

**Search.** Tree search over reasoning steps with value estimates, as in game-playing systems, applied to math and code.

**Compute-optimal allocation.** Snell et al. (2024) showed that adapting the strategy to problem difficulty can match much larger models on some tasks at equal compute.

```viz
{"id":"sequential-parallel","component":"compare","title":"Think longer or try more times?","caption":"Hover the marks. Many systems combine both.","alt":"Comparison of sequential test-time scaling with longer reasoning and parallel scaling with many samples.","data":"illustrative","mono":false,"a":{"title":"Sequential: think longer","text":"One attempt with a larger thinking budget. Good when the model can check and revise its own work. Latency grows with tokens; cost is one long call.","mono":false},"b":{"title":"Parallel: try more times","text":"Many independent attempts, chosen by vote or verifier. Good when a reliable checker exists. Latency stays flat with parallel calls; cost grows with the number of samples.","mono":false},"links":[{"a":"Latency grows with tokens","b":"Latency stays flat with parallel calls","note":"Parallel scaling suits latency-sensitive settings if you can afford the calls."},{"b":"Good when a reliable checker exists.","note":"Without a verifier, picking the best of many is hard."}]}
```

## In practice
- Use more test-time compute only on routes where accuracy gains justify cost; measure the curve on your eval.
- Pair parallel sampling with real verifiers such as tests or schema checks.
- Cap budgets and log tokens per request. See [cost engineering](#cost-engineering).

## Numbers to know
> [!number]
> Rules of thumb. Doubling samples or thinking tokens buys a roughly constant accuracy increment on hard checkable tasks, until a ceiling. Costs grow linearly with samples.

## Pitfalls and anti-patterns
> [!pitfall] Best-of-n with a weak judge
> The judge picks persuasive wrong answers more often as n grows.

## Talk like an expert
The vocabulary: **test-time compute**, **sequential scaling**, **parallel scaling**, **self-consistency**, **best-of-n**, **verifier**, **process reward model**, **compute-optimal inference**. Experts quote accuracy at a stated compute budget. The live debate is how far test-time scaling extends to tasks without verifiers.

> [!hottake] Verifiers, not bigger models, are the bottleneck for test-time scaling.
> **The counterargument:** stronger models produce better candidates and better self-verification, so model scale and test-time compute compound.

## Check yourself
```quiz
test-time-scaling
```

## Go deeper
- Snell et al., “Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters” (2024).
- Wang et al., “Self-Consistency” (2022); Lightman et al., “Let’s Verify Step by Step” (2023).

## Related
- [Reasoning models and test-time compute](#reasoning-models)
- [RL with verifiable rewards](#rlvr-reasoning)
- [Scaling laws and compute](#scaling-laws)
- [Reasoning prompts](#reasoning-prompts)
- [Cost engineering](#cost-engineering)
- [Model-based RL, planning and Monte Carlo tree search](#planning-mcts)
- [Reward models and preference data](#reward-modeling)
- [Training reasoning models: cold starts, distillation and length control](#reasoning-training-recipes)
- [Latent reasoning and recurrent depth](#latent-reasoning)
- [AI for mathematics and formal theorem proving](#ai-for-mathematics)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Test-time search, sampling and verification](#test-time-search)
