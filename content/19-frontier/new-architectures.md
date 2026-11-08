---
id: new-architectures
book: 19
order: "19.5"
title: New architectures and efficiency
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [architectures, efficiency, hybrids]
visuals:
  - efficiency-map:diagram
  - efficiency-tree:tree
---
> [!tldr]
> Efficiency gains come from many directions at once: sparse mixtures of experts, hybrid attention and state-space layers, lower-precision training and inference, better kernels, distillation, speculative decoding and smarter serving. Algorithmic progress has cut the compute needed for a given capability by large factors every year.

## Why it matters
The cost of a given level of capability falls quickly, which changes build-versus-buy decisions, on-device feasibility and product margins. Knowing where efficiency comes from helps you anticipate which constraints will loosen next.

## Intuition
Efficiency is fuel economy improving on every part of the car at once: lighter body, better engine, smarter transmission and better roads.

```viz
{"id":"efficiency-map","component":"diagram","title":"Efficiency comes from five layers of the stack at once","caption":"Click a layer for the chapter that covers it.","alt":"Layered diagram of efficiency sources: serving, decoding, precision, architecture and training data and methods.","data":"illustrative","w":560,"layer_h":46,"layers":[
{"id":"serve","label":"Serving","sub":"batching, caching, disaggregation","role":"tool","link":"#batching-scheduling"},
{"id":"decode","label":"Decoding","sub":"speculative decoding, distilled drafters","role":"model","link":"#speculative-decoding"},
{"id":"prec","label":"Precision","sub":"FP8 and FP4 training and inference","role":"data","link":"#quantization"},
{"id":"arch","label":"Architecture","sub":"MoE, hybrids, efficient attention","role":"agent","link":"#beyond-transformers"},
{"id":"train","label":"Data and training","sub":"better data, distillation, RL","role":"context","link":"#pretraining-data"}]}
```

## How it works
```viz
{"id":"efficiency-tree","component":"tree","title":"Six efficiency trends to watch","caption":"Expand a trend for what it changes.","alt":"Tree of efficiency trends: sparsity, hybrids, low precision, kernels, distillation and diffusion language models.","data":"illustrative","open":1,"root":{"label":"Efficiency trends","children":[
{"label":"Sparsity","children":[{"label":"More, finer-grained experts; fewer active parameters per token","link":"#mixture-of-experts"}]},
{"label":"Hybrid architectures","children":[{"label":"Few attention layers plus recurrent or windowed layers for long context","link":"#beyond-transformers"}]},
{"label":"Low precision","children":[{"label":"FP8 training and FP4 inference on new hardware","link":"#quantization"}]},
{"label":"Kernels and compilers","children":[{"label":"FlashAttention-style IO-aware kernels and fused operations","link":"#long-context"}]},
{"label":"Distillation","children":[{"label":"Small models trained on frontier outputs","link":"#distillation-merging"}]},
{"label":"Parallel generation","children":[{"label":"Diffusion language models and speculative methods"}]}]}}
```

**Algorithmic progress.** Epoch AI estimated (Ho et al., 2024) that the compute needed to reach a given language-model performance has halved roughly every eight months from algorithmic improvements alone, on top of hardware gains.

**Price trends.** Prices per token for a fixed capability level have fallen steeply year over year, though frontier prices stay high and tokens per task rise.

## In practice
- Revisit cost-driven design decisions yearly; yesterday’s too-expensive option may now be cheap.
- Prefer architectures and serving stacks that can adopt new efficiency gains easily.

## Numbers to know
> [!number]
> Rules of thumb. Algorithmic efficiency for a fixed capability has improved by large factors per year (Epoch AI estimates compute halving about every eight months). Combined with hardware, the cost of a given capability falls much faster than Moore’s law.

## Pitfalls and anti-patterns
> [!pitfall] Locking in today’s cost structure
> Long contracts or architectures built around current prices can age badly.

## Talk like an expert
The vocabulary: **algorithmic progress**, **effective compute**, **sparsity**, **hybrid architecture**, **low-precision training**, **cost per capability**. Experts separate efficiency gains from capability gains. The live debate is whether efficiency gains will make frontier-level capability cheap enough to run locally.

> [!hottake] Within a few years, today’s frontier capability will run on a laptop.
> **The counterargument:** memory capacity and bandwidth on consumer devices grow slowly, and frontier models keep growing; laptops will run today’s mid-tier, not today’s frontier.

## Check yourself
```quiz
new-architectures
```

## Go deeper
- Ho et al., “Algorithmic progress in language models” (Epoch AI, 2024).

## Related
- [Beyond the transformer](#beyond-transformers)
- [Mixture of Experts](#mixture-of-experts)
- [Quantization](#quantization)
- [Hardware](#hardware)
- [Cost engineering](#cost-engineering)
