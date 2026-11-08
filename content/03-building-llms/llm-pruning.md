---
id: llm-pruning
book: 3
order: "3.9.3"
title: Pruning and structured compression
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [pruning, sparsity, compression, small-models, inference]
visuals: []
prerequisites: [distillation-merging]
---
> [!tldr]
> Pruning removes parts of a trained model: single weights anywhere (unstructured), weights in a fixed pattern such as two of every four (semi-structured), or whole neurons, attention heads, channels and layers (structured). It makes a model smaller, and with the right pattern faster, but only some patterns run faster on real kernels and hardware. The one thing to remember: sparsity saves time only when a kernel or chip exploits its pattern, and quality loss has to be measured on tasks, not on perplexity alone.

## Key ideas

- **Which sparsity actually runs faster.** NVIDIA's sparse tensor cores, from the Ampere generation on, exploit a 2:4 pattern (at most two nonzero weights in every group of four) for "twice the math throughput of dense matrix units" ([Mishra et al., “Accelerating Sparse Deep Neural Networks” (2021)](https://arxiv.org/abs/2104.08378)). In a preliminary study with off-the-shelf tools, matrix multiplications with the layer shapes of OPT-175B ran 1.54 to 1.79 times faster with 2:4 sparsity (NVIDIA's CUTLASS kernels) than dense cuBLAS on GPUs, while unstructured sparsity of 40 to 60 percent sped up OPT-2.7B end to end by 1.57 to 2.16 times on a CPU with the DeepSparse engine ([Frantar and Alistarh, “SparseGPT” (2023), appendix E](https://arxiv.org/abs/2301.00774)).
- **One-shot pruning without retraining.** SparseGPT chooses a mask and reconstructs the remaining weights layer by layer; it prunes GPT-family models to at least 50% sparsity in one shot, reaches 60% unstructured sparsity with a negligible rise in perplexity, prunes OPT-175B and BLOOM-176B in under 4.5 hours, and extends to 2:4 and 4:8 patterns ([Frantar and Alistarh, “SparseGPT: Massive Language Models Can be Accurately Pruned in One-Shot” (2023)](https://proceedings.mlr.press/v202/frantar23a)). Wanda skips the reconstruction: it removes the weights with the smallest magnitude times input activation, compared per output, with "no retraining or weight update" ([Sun et al., “A Simple and Effective Pruning Approach for Large Language Models” (2024)](https://arxiv.org/abs/2306.11695)).
- **Per-layer speedups are not end-to-end speedups.** In a simulation with NVIDIA's CUTLASS kernels, 2:4 sparsity sped up the linear layers of LLaMA-65B by about 1.6 times, while end-to-end latency of LLaMA-7B improved by 1.24 times (251 ms against 312 ms) ([Sun et al. (2024), section 4.3](https://arxiv.org/html/2306.11695)). The SparseGPT authors expected end-to-end gains to fall below layer gains because of extra overheads, for example from attention ([Frantar and Alistarh (2023), appendix E](https://arxiv.org/abs/2301.00774)).
- **Width versus depth, then distill.** Minitron prunes depth (layers) and width (feed-forward neurons, attention heads and embedding channels), ranks them by activations on 1,024 calibration samples, and recommends width over depth at the scales it studied (up to 15B). Retraining the pruned model by distillation from the original turned Nemotron-4 15B into 8B and 4B models with "up to 40× fewer training tokens per model" than training from scratch and up to 16% better MMLU scores ([Muralidharan et al., “Compact Language Models via Pruning and Knowledge Distillation” (2024)](https://arxiv.org/html/2407.14679v2)).
- **Depth pruning and healing.** For some open-weight models, up to half the layers, chosen as a block by their similarity across layers, could be removed with minimal loss on question-answering benchmarks after a little QLoRA fine-tuning to heal the damage ([Gromov et al., “The Unreasonable Ineffectiveness of the Deeper Layers” (2024)](https://arxiv.org/abs/2403.17887)). SparseGPT is also "compatible with weight quantization approaches", so pruning and quantization can stack ([Frantar and Alistarh (2023)](https://proceedings.mlr.press/v202/frantar23a)).
- **Evaluate beyond perplexity.** Perplexity can "fail to capture subtle change in their true capabilities": on a knowledge-intensive benchmark (LLM-KICK), all pruning methods tested lost significant quality, "sometimes at trivial sparsity ratios (e.g., 25-30%)", N:M sparsity failed on knowledge-intensive tasks, quantization held up better, and pruned models at 50% sparsity still did well on in-context retrieval and summarization ([Jaiswal et al., “Compressing LLMs: The Truth is Rarely Pure and Never Simple” (2024)](https://arxiv.org/abs/2310.01382)).

## Planned visuals

- **`heatmap`: one weight matrix, pruned three ways.** The same small matrix after unstructured, 2:4 and structured (whole rows removed) pruning, with a label on each saying what hardware or kernel can turn its zeros into speed.
- **`chart`: per-layer versus end-to-end speedups.** A bar chart (`data: real`) of the published 2:4 layer speedups for OPT-175B and LLaMA-65B next to the LLaMA-7B end-to-end figure and the CPU results for unstructured sparsity, each bar with its source.
- **`diagram`: the prune-then-distill pipeline.** A teacher model goes through importance estimation on calibration data, width or depth pruning, and distillation from the teacher; an iterative loop takes the student down another size step.

## Talk like an expert

Experts state the sparsity level and pattern ("50% unstructured", "2:4"), separate one-shot pruning from prune-and-retrain, and say "width" or "depth" for structured pruning. Before believing a compression claim, they ask "faster on which kernel and hardware?" and "what did it cost on knowledge-heavy tasks?"

## Go deeper

- Frantar and Alistarh, [“SparseGPT: Massive Language Models Can be Accurately Pruned in One-Shot”](https://proceedings.mlr.press/v202/frantar23a) (ICML 2023).
- Sun et al., [“A Simple and Effective Pruning Approach for Large Language Models”](https://arxiv.org/abs/2306.11695) (ICLR 2024).
- Muralidharan et al., [“Compact Language Models via Pruning and Knowledge Distillation”](https://arxiv.org/html/2407.14679v2) (2024).
- Jaiswal et al., [“Compressing LLMs: The Truth is Rarely Pure and Never Simple”](https://arxiv.org/abs/2310.01382) (ICLR 2024).

## Related

- [Distillation, merging and compression](#distillation-merging)
- [Quantization](#quantization)
- [Distillation for LLMs: soft labels, on-policy and multi-teacher](#llm-distillation)
- [Small and local models](#small-local-models)
- [Edge and on-device AI](#edge-on-device)
