---
id: mixture-of-experts
book: 2
order: "2.5"
title: Mixture of Experts
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [moe, routing, sparsity]
visuals:
  - moe-router:stepper
  - moe-params:chart
---
> [!tldr]
> Mixture-of-experts models replace each feed-forward layer with many experts and a router that sends every token to a few of them. Total parameters grow enormously while compute per token stays modest. The costs are memory for all experts, routing and load-balancing complexity, and communication across devices.

## Why it matters
Most frontier and many open models are now mixtures of experts. Their headline sizes (hundreds of billions of parameters) and their actual per-token compute (tens of billions) differ by an order of magnitude, which changes how you reason about cost, memory, speed and fine-tuning.

## Intuition
A hospital with many specialists. A triage nurse (the router) sends each patient to two relevant specialists; nobody sees every doctor. The hospital employs a large staff, but each visit uses only a little of it.

```viz
{"id":"moe-router","component":"stepper","title":"The router sends each token to its top two of eight experts and mixes their outputs","caption":"An illustrative top-2 routing step for three tokens. Expert choice varies by token; balancing keeps any one expert from being overloaded.","alt":"Stepper of mixture-of-experts routing: router scores, top-2 selection per token, expert computation and weighted combination.","data":"illustrative","frames":[
{"label":"Router scores","caption":"For each token, a small linear router scores all eight experts.","matrix":{"rows":["“refund”","“def”","“Lisboa”"],"cols":["E1","E2","E3","E4","E5","E6","E7","E8"],"values":[[0.02,0.41,0.05,0.03,0.33,0.06,0.04,0.06],[0.05,0.03,0.48,0.02,0.04,0.31,0.03,0.04],[0.29,0.04,0.03,0.05,0.04,0.03,0.47,0.05]],"min":0,"max":0.5}},
{"label":"Top 2","caption":"Each token keeps its two highest-scoring experts: “refund” goes to E2 and E5, “def” to E3 and E6, “Lisboa” to E7 and E1."},
{"label":"Compute","caption":"Only the selected experts run for each token: two of eight feed-forward networks, so about a quarter of the layer’s parameters are active."},
{"label":"Combine","caption":"Expert outputs are weighted by the renormalized router scores and added to the residual stream."},
{"label":"Balance","caption":"An auxiliary loss or bias adjustment during training keeps tokens spread across experts, so none sits idle or overloaded."}]}
```

## How it works
**Sparse activation.** Each MoE layer has N experts (feed-forward networks) and a router; each token uses the top k (often 1, 2 or a handful out of dozens or hundreds). Shazeer et al. (2017) introduced sparsely gated MoE at scale; Switch Transformer (Fedus et al., 2021) used top-1 routing; Mixtral 8x7B (2023) popularized open MoE models.

**Fine-grained and shared experts.** DeepSeek’s designs use many small experts plus always-on shared experts, and auxiliary-loss-free load balancing, as in DeepSeek-V3 (2024).

**Total versus active parameters.**

```viz
{"id":"moe-params","component":"chart","type":"bar","title":"MoE models activate a small fraction of their parameters for each token","caption":"Published total and active parameter counts, in billions, log scale. Memory scales with total; per-token compute with active.","alt":"Bar chart of total and active parameters for Mixtral 8x7B, DeepSeek-V3, Qwen3-235B-A22B, Llama 4 Maverick and gpt-oss-120b.","data":"real","source":"Published model cards and technical reports, 2023 to 2025","asof":"2025-08","depicts":"Published model cards, 2023 to 2025","categories":["Mixtral 8x7B","DeepSeek-V3","Qwen3-235B-A22B","Llama 4 Maverick","gpt-oss-120b"],"y":{"label":"Parameters (billions, log scale)","log":true},"series":[{"name":"Total","points":[[0,46.7],[1,671],[2,235],[3,400],[4,117]]},{"name":"Active per token","points":[[0,12.9],[1,37],[2,22],[3,17],[4,5.1]]}]}
```

**Costs.** All experts must be in memory; serving across GPUs needs expert parallelism with all-to-all communication; load imbalance creates hot spots; fine-tuning can disturb routing. See [disaggregated serving](#disaggregated-serving) and [memory math](#memory-math).

## In practice
- Size memory by total parameters and speed by active parameters plus communication.
- Prefer serving engines with mature MoE kernels and expert parallelism. See [serving engines](#serving-engines).
- When fine-tuning, follow the model’s recommended recipe; adapters often skip the router.

## Numbers to know
> [!number]
> Facts from model cards: DeepSeek-V3 has 671 billion total and 37 billion active parameters; Mixtral 8x7B 46.7 billion total and 12.9 billion active. Rule of thumb: per-token compute ≈ 2 × active parameters.

## Pitfalls and anti-patterns
> [!pitfall] Comparing an MoE’s total size with a dense model’s size
> A 400-billion-parameter MoE may compute like a 17-billion-parameter dense model and need memory like a 400-billion one.

- **Ignoring communication.** Expert parallelism across slow links erases the compute savings.

## Talk like an expert
The vocabulary: **expert**, **router** or **gate**, **top-k routing**, **load balancing**, **shared experts**, **fine-grained experts**, **active parameters**, **expert parallelism**, **capacity factor**. Experts quote MoE models as “total, active” pairs. The live debate is how far sparsity can go, and whether MoE’s memory cost limits it for local and edge use.

> [!hottake] Nearly every frontier model will be a mixture of experts.
> **The counterargument:** dense models are simpler to train, fine-tune and serve, and at small sizes or on memory-limited hardware they often win on cost and quality per gigabyte.

## Check yourself
```quiz
mixture-of-experts
```

## Go deeper
- Shazeer et al., “Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts Layer” (2017).
- Fedus, Zoph and Shazeer, “Switch Transformers” (2021).
- DeepSeek-AI, “DeepSeek-V3 Technical Report” (2024).

## Related
- [The transformer block](#transformer-block)
- [Parallelism and disaggregated serving](#disaggregated-serving)
- [Memory math](#memory-math)
- [Scaling laws and compute](#scaling-laws)
- [Frontier model families](#frontier-families)
- [Serving mixture-of-experts models](#moe-serving)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [MoE routing and load balancing](#moe-routing)
