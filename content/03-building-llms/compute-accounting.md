---
id: compute-accounting
book: 3
order: "3.2.1"
title: "Compute accounting: FLOP, GPU-hours and utilization"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [compute, flop, mfu, gpu-hours, training-cost]
visuals: []
prerequisites: [scaling-laws]
---
> [!tldr]
> Compute accounting turns a training run into numbers you can compare: total FLOP, GPU-hours, utilization and dollars. The core estimate is about 6 FLOP per parameter per token, cross-checked against hardware time multiplied by peak throughput and utilization. Remember that a headline cost can cover only the final run, while regulators count compute cumulatively and by their own rules.

## Key ideas

- **FLOP is an amount; FLOP/s is a rate.** Kaplan et al. estimate non-embedding training compute as C ≈ 6NBS (N parameters, a batch of B tokens, S steps) and quote it in petaflop/s-days, where one PF-day is 10¹⁵ × 24 × 3600 = 8.64 × 10¹⁹ FLOP (Kaplan et al., [“Scaling Laws for Neural Language Models”](https://arxiv.org/abs/2001.08361) (2020)). The GPT-3 paper gives its 175B model 3.14 × 10²³ FLOP, or about 3,640 PF-days, and ignores attention because it used less than 10% of the compute for the models it analyzed (Brown et al., [“Language Models are Few-Shot Learners”](https://arxiv.org/abs/2005.14165) (2020)).
- **Count per token, then adjust.** A dense decoder needs about 6N matmul FLOP per token (2N forward, 4N backward), and dense self-attention adds 6LH(2QT) FLOP per token for L layers, H heads, head dimension Q and sequence length T (Chowdhery et al., [“PaLM: Scaling Language Modeling with Pathways”](https://arxiv.org/abs/2204.02311) (2022)). For mixture-of-experts models use active parameters: DeepSeek-V3 has 671B parameters but activates 37B per token, so the rule gives about 6 × 37B × 14.8T tokens ≈ 3.3 × 10²⁴ FLOP for its pretraining, a rough estimate rather than a figure the report gives (DeepSeek-AI, [“DeepSeek-V3 Technical Report”](https://arxiv.org/abs/2412.19437) (2024)).
- **Or estimate from hardware time.** Training compute ≈ number of devices × peak FLOP/s × utilization × time, and Epoch AI suggests a utilization of 0.3 for large language models when the real value is unknown (Sevilla et al., [“Estimating training compute of deep learning models”](https://epoch.ai/blog/estimating-training-compute) (2022)). Epoch AI applies these methods in a public database of over 3,700 models as of November 2026, labeling each estimate confident, likely or speculative ([Epoch AI, “Data on AI models”](https://epoch.ai/data/ai-models)).
- **Quote MFU, not HFU.** Model FLOPs utilization (MFU) divides observed tokens per second by the maximum a system could reach at peak FLOP/s counting only the forward and backward pass, while hardware FLOPs utilization (HFU) also counts recomputed activations, so PaLM 540B reported 46.2% MFU but 57.8% HFU ([Chowdhery et al., 2022](https://arxiv.org/abs/2204.02311)). Llama 3 405B reports 3.8 × 10²⁵ FLOP on 15.6T tokens, consistent with 6 × 405B × 15.6T, at 38 to 43% BF16 MFU on up to 16K H100 GPUs (Grattafiori et al., [“The Llama 3 Herd of Models”](https://arxiv.org/abs/2407.21783) (2024)).
- **From FLOP to dollars, and what is left out.** DeepSeek-V3 reports 2.788M H800 GPU-hours for pretraining, context extension and post-training, or $5.576M at an assumed rental price of $2 per GPU-hour, and states that this excludes the costs of prior research and ablation experiments ([DeepSeek-AI, 2024](https://arxiv.org/abs/2412.19437)). Such experiments are not small: FineWeb's data ablations alone trained over 70 models for an estimated 80,000 H100 GPU-hours (Penedo et al., [“The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale”](https://arxiv.org/abs/2406.17557) (2024)).
- **Regulators count cumulative compute.** Under Article 51 of the EU AI Act, a general-purpose AI model is presumed to have high-impact capabilities when its cumulative training compute exceeds 10²⁵ FLOP ([EU AI Act, Article 51](https://artificialintelligenceact.eu/article/51/)). As of November 2026, the Commission's guidelines count the generation of non-public synthetic data (including discarded samples) and the training of merged or reused weights, say that evaluations, red-teaming, recomputed activations and training the parent (teacher) model in distillation need not be counted, and accept estimates within an overall error margin of 30% ([European Commission, “Guidelines on the scope of obligations for providers of general-purpose AI models under the AI Act”](https://digital-strategy.ec.europa.eu/en/library/guidelines-scope-obligations-providers-general-purpose-ai-models-under-ai-act)).

## Planned visuals

- **`calculator`:** training FLOP from parameters (active parameters for MoE) and tokens, converted to GPU-hours from peak FLOP/s and MFU and to dollars from an hourly price, with the 10²⁵ FLOP line flagged.
- **`chart`:** reported training compute of GPT-3, Chinchilla, Llama 3 405B and other models with published figures, on a log axis with the EU AI Act threshold as a band (`data: real`, each point with its source).
- **`compare`:** MFU versus HFU for the same run, showing where recomputation FLOP sit and why only one of them tracks training speed.

## Talk like an expert

Experts quote runs in FLOP, GPU-hours and MFU, say whether an MoE count uses active parameters, and ask what a cost figure leaves out. "6ND" is the opening move; hardware time is the cross-check.

## Go deeper

- Kaplan et al., [“Scaling Laws for Neural Language Models”](https://arxiv.org/abs/2001.08361) (2020).
- Chowdhery et al., [“PaLM: Scaling Language Modeling with Pathways”](https://arxiv.org/abs/2204.02311) (2022), appendix B on MFU.
- Sevilla et al., [“Estimating training compute of deep learning models”](https://epoch.ai/blog/estimating-training-compute) (2022).
- European Commission, [“Guidelines on the scope of obligations for providers of general-purpose AI models under the AI Act”](https://digital-strategy.ec.europa.eu/en/library/guidelines-scope-obligations-providers-general-purpose-ai-models-under-ai-act) (2025), the annex on training compute.

## Related

- [Scaling laws and compute](#scaling-laws)
- [Distributed training](#distributed-training)
- [Numbers every AI engineer should know](#numbers-to-know)
- [Hardware](#hardware)
- [Back-of-the-envelope estimation](#back-of-envelope)
- [Governance, regulation and law](#governance-regulation)
