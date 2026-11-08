---
id: low-precision-training
book: 3
order: "3.3.2"
title: Mixed and low-precision training
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [mixed-precision, fp8, fp4, training, microscaling]
visuals: []
prerequisites: [distributed-training]
---
> [!tldr]
> Low-precision training runs the large matrix multiplications in fewer bits (BF16, FP8 and now 4-bit formats) and keeps the operations that accumulate small errors in higher precision. It is how large runs cut memory and raise throughput on recent GPUs. Remember that a format works only together with its recipe (scaling, accumulation, which layers stay wide), so a low-precision run is trusted only after it tracks a higher-precision baseline.

## Key ideas

- **Mixed precision keeps a wide copy of the weights.** The original recipe trains in FP16 but keeps an FP32 master copy of the weights that accumulates every update, and scales the loss so that small gradients do not round to zero in half precision; it nearly halves memory ([Micikevicius et al., “Mixed Precision Training” (2017)](https://arxiv.org/abs/1710.03740)). The bit layouts of FP32, BF16, FP16 and FP8 are explained in [Floating-point formats and numerical precision](#floating-point-formats).
- **FP8 needs scaling, and finer scaling tolerates outliers.** FP8 has two encodings, E4M3 with more precision and E5M2 with more range, and FP8 training matched 16-bit quality on models up to 175B parameters without changing hyperparameters ([Micikevicius et al., “FP8 Formats for Deep Learning” (2022)](https://arxiv.org/abs/2209.05433)). Transformer Engine's delayed scaling uses one FP32 scale per tensor, predicted from a history of recent maximum values ([Transformer Engine docs](https://nvidia.github.io/TransformerEngine/features/low_precision_training/fp8_delayed_scaling/fp8_delayed_scaling.html)), while DeepSeek-V3 scaled activations per 1×128 tile and weights per 128×128 block, moved partial sums to higher-precision accumulation, and stayed within 0.25% relative loss of a BF16 baseline ([DeepSeek-AI, “DeepSeek-V3 Technical Report” (2024)](https://arxiv.org/html/2412.19437v2)).
- **Microscaling formats put a scale on every small block.** MX formats pair a shared scale per block with narrow element types, and their authors trained generative language models with weights, activations and gradients below 8 bits ([Rouhani et al., “Microscaling Data Formats for Deep Learning” (2023)](https://arxiv.org/abs/2310.10537)). NVFP4 shrinks the block from MXFP4's 32 elements to 16, stores block scales in E4M3 instead of a power-of-two E8M0, and adds an FP32 scale per tensor ([NVIDIA, “Pretraining Large Language Models with NVFP4” (2025)](https://arxiv.org/abs/2509.25149)).
- **4-bit pretraining works with a specific recipe.** NVIDIA trained a 12B hybrid Mamba-Transformer model on 10T tokens in NVFP4, with loss and downstream accuracy comparable to an FP8 baseline, using random Hadamard transforms on the inputs of the weight-gradient matrix multiplication, 16×16 two-dimensional scaling for weights so that the forward and backward passes see the same quantized weights, stochastic rounding for gradients, and about 16% of linear layers kept in BF16 (the first two and the last eight blocks; the final layers proved the most sensitive to FP4). Switching to higher precision shortly before the learning rate decays recovered most of the remaining loss gap ([NVIDIA, “Pretraining Large Language Models with NVFP4” (2025)](https://arxiv.org/html/2509.25149)).
- **Some operations stay wide.** DeepSeek-V3 keeps the embedding, the output head, MoE gating, normalization and attention in BF16 or FP32, and keeps master weights and weight gradients in FP32 and the AdamW moments in BF16 ([DeepSeek-AI, 2024](https://arxiv.org/html/2412.19437v2)). As of November 2026, a `MixedPrecisionPolicy` in PyTorch FSDP2 sets the compute dtype (`param_dtype`) and the gradient-reduction dtype (`reduce_dtype`) separately, while the optimizer step still runs on the sharded parameters in their original dtype ([PyTorch 2.15 docs](https://docs.pytorch.org/docs/2.15/distributed.fsdp.fully_shard.html)), and Transformer Engine supports FP8 training on Hopper, Ada, Blackwell and Rubin GPUs and MXFP8 and NVFP4 training on Blackwell, and is integrated in Megatron-LM ([NVIDIA/TransformerEngine](https://github.com/NVIDIA/TransformerEngine)).
- **Precision is a scaling-law variable.** Kumar et al. model low-precision training as a smaller effective parameter count and find that post-training quantization hurts more the more data a model was trained on; they fit their laws on over 465 pretraining runs and validated them on models up to 1.7B parameters trained on up to 26B tokens ([Kumar et al., “Scaling Laws for Precision” (2024)](https://arxiv.org/abs/2411.04330)). The validation practice follows from the reports above: compare against a higher-precision baseline trained on the same tokens. DeepSeek-V3 compared training loss with a BF16 baseline ([DeepSeek-AI, 2024](https://arxiv.org/html/2412.19437v2)), and NVIDIA compared loss and downstream accuracy with an FP8 baseline ([NVIDIA, 2025](https://arxiv.org/html/2509.25149)).

## Planned visuals

- **`diagram`:** one linear layer through a training step, with variants for BF16, FP8 with tile and block scaling, and NVFP4: master weights, the cast to low precision, the matrix multiplication with its accumulator, gradient reduction and the optimizer update, each labeled with its precision.
- **`compare`:** one scale per tensor versus one scale per block on the same tensor with a single large outlier, showing how the outlier wastes the range of every other value under a single scale (illustrative).
- **`matrix`:** a dated table of which operations open training reports keep in higher precision (embeddings, output head, normalization, attention, optimizer states, reductions), each row with its source.

## Talk like an expert

Experts describe a low-precision run by its recipe: the format, the scaling granularity (per tensor, per tile, per block), the accumulation precision and the list of layers kept in BF16. They do not say "we trained in FP4" without a baseline comparison over a long token horizon.

## Go deeper

- Micikevicius et al., [“Mixed Precision Training”](https://arxiv.org/abs/1710.03740) (2017).
- DeepSeek-AI, [“DeepSeek-V3 Technical Report”](https://arxiv.org/abs/2412.19437) (2024), section 3.3 on the FP8 framework.
- NVIDIA, [“Pretraining Large Language Models with NVFP4”](https://arxiv.org/abs/2509.25149) (2025).
- The [NVIDIA/TransformerEngine](https://github.com/NVIDIA/TransformerEngine) repository and its documentation.

## Related

- [Distributed training](#distributed-training)
- [Floating-point formats and numerical precision](#floating-point-formats)
- [Quantization](#quantization)
- [Training stability: loss spikes and divergence](#training-stability)
- [Hardware](#hardware)
