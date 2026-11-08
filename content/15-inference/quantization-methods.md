---
id: quantization-methods
book: 15
order: "15.6.1"
title: Quantization methods in depth
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [quantization, gptq, awq, gguf, fp4]
visuals: []
prerequisites: [quantization, memory-math]
---
> [!tldr]
> Every quantization method maps many high-precision values onto a few low-bit levels, and they differ in how they keep the rounding error away from what matters: smaller groups with their own scales, calibration on real activations, special handling of outliers, or training with the rounding in the loop. Which method wins depends as much on the kernels your hardware and engine provide as on accuracy. Remember to name what is quantized, at what granularity, and with which kernels, then measure the result against the original model.

## Key ideas

- **The affine map and its granularity.** Affine quantization stretches the integer range over a tensor's minimum and maximum with a scale S = (max − min) ÷ (q_max − q_min) and a zero point Z, so x ≈ S × (q − Z); mapping values from −1.8 to 2.4 onto int8 gives S ≈ 0.0165 and Z = −19, and 0.5 becomes 11, which dequantizes to about 0.494 ([Hugging Face, Quantization concepts](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide)). Symmetric quantization fixes Z at 0, and one scale can cover a whole tensor, each output channel, or each group of consecutive values such as 128 weights (GPTQ's default in Transformers), where smaller groups stop one outlier from stretching the range for every other weight ([Hugging Face](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide)).
- **Outliers make activations hard.** LLM.int8() found systematic outlier features in large transformers and moves those dimensions into a 16-bit matrix multiplication while more than 99.9% of values stay in 8 bits (Dettmers et al., [“LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale”](https://arxiv.org/abs/2208.07339) (2022)), and SmoothQuant migrates the difficulty offline from activations to weights to enable W8A8 (Xiao et al., [“SmoothQuant: Accurate and Efficient Post-Training Quantization for Large Language Models”](https://arxiv.org/abs/2211.10438) (2022)). Rotation methods go further: QuaRot rotates the model so the hidden state loses its outliers without changing the output, then quantizes all weights, activations and the KV cache to 4 bits, and its 4-bit LLaMa2-70B loses at most 0.47 WikiText-2 perplexity (Ashkboos et al., [“QuaRot: Outlier-Free 4-Bit Inference in Rotated LLMs”](https://arxiv.org/abs/2404.00456) (2024)).
- **GPTQ and AWQ use calibration data differently.** GPTQ quantizes a layer one column at a time and adjusts the remaining columns to absorb each column's rounding error, using approximate second-order information, and reached 3 or 4 bits on 175-billion-parameter models in about four GPU hours (Frantar et al., [“GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers”](https://arxiv.org/abs/2210.17323) (2022)). AWQ finds the roughly 1% of salient weight channels from activation statistics and scales them up before rounding, without backpropagation (Lin et al., [“AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration”](https://arxiv.org/abs/2306.00978) (2023)); calibration like this usually helps at 4 bits and below but takes minutes to hours, while methods such as bitsandbytes, HQQ and torchao need no data and quantize while the model loads ([Hugging Face](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide)).
- **Four-bit floats need block scales.** FP4 (E2M1) can only represent 0, 0.5, 1, 1.5, 2, 3, 4 and 6 with a sign, so its formats attach a scale to every small block: MXFP4 uses blocks of 32 values with a power-of-two (E8M0) scale, while NVFP4 uses blocks of 16 with an FP8 scale plus one FP32 scale per tensor, which keeps more accuracy ([Hugging Face](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide)); the bit layouts are in [floating-point formats](#floating-point-formats). Below 4 bits, codebook methods store groups of weights as indices into learned vectors (AQLM's default of 8 weights per 16-bit index works out to 2 bits per weight), and quantization-aware training keeps the rounding in the training loop, as BitNet models do with 1.58-bit weights ([Hugging Face](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide)).
- **GGUF k-quants and i-quants.** For Llama-3.1-8B, llama.cpp's README lists Q8_0 at 8.50 bits per weight (7.95 GiB), Q4_K_M at 4.89 (4.58 GiB) and IQ2_XXS at 2.38 (2.23 GiB), so a type's real bits per weight sit above the width in its name ([llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)). K-quants mix tensor types within one model unless `--pure` is set, and an importance matrix (`--imatrix`) reduces the accuracy loss, usually measured as perplexity or KL divergence ([llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)).
- **Kernels decide the speedup.** Weight-only formats dequantize the weights before every matmul, so they save memory but run faster mainly when decoding is memory-bound, while weight-and-activation formats such as FP8 W8A8 speed up compute-bound prefill and large batches but need hardware support, such as NVIDIA compute capability 8.9 or higher or AMD Instinct MI300 ([Hugging Face](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide)); llama.cpp's table shows Q4_K_M generating text about 2.5 times faster than F16 on Llama-3.1-8B while processing prompts slightly slower ([llama.cpp quantize README](https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md)). As of November 2026, vLLM's support table lists Marlin kernels for GPTQ, AWQ, FP8 and FP4 on NVIDIA Turing (except MXFP4) through Hopper, always with 16-bit activations, and vLLM supports checkpoints from LLM Compressor, NVIDIA Model Optimizer, AMD Quark, TorchAO, GPTQModel and bitsandbytes ([vLLM quantization docs](https://docs.vllm.ai/en/latest/features/quantization/)).

## Planned visuals

- **`calculator`:** affine quantization of one value from a range, a bit width and a symmetric toggle, showing S, Z, the integer and the rounding error, with a test against the Hugging Face example (−1.8 to 2.4 in int8, where 0.5 maps to 11 and back to about 0.494).
- **`compare`:** per-tensor and per-group (128) scales on a weight row with one outlier, highlighting how many levels the ordinary weights keep under each.
- **`stepper`:** the outlier remedies on one activation matrix, step by step: mixed-precision decomposition, smoothing the outlier into the weights, and a rotation that spreads it across channels before 4-bit rounding.

## Talk like an expert

Experts name a scheme by what is quantized and how (W4A16 with group size 128, FP8 W8A8, NVFP4, Q4_K_M with an imatrix) and talk about outlier features, smoothing, rotations, calibration sets, block scales, codebooks and kernel support. They report the eval delta against the original model on their own tasks, not a perplexity number alone.

## Go deeper

- Nagel et al., [“A White Paper on Neural Network Quantization”](https://arxiv.org/abs/2106.08295) (2021).
- Frantar et al., [“GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers”](https://arxiv.org/abs/2210.17323) (2022).
- Ashkboos et al., [“QuaRot: Outlier-Free 4-Bit Inference in Rotated LLMs”](https://arxiv.org/abs/2404.00456) (2024).
- [Hugging Face Transformers: Quantization concepts](https://huggingface.co/docs/transformers/main/en/quantization/concept_guide).

## Related

- [Quantization](#quantization)
- [Memory math](#memory-math)
- [Floating-point formats and numerical precision](#floating-point-formats)
- [How GPUs and accelerators run neural networks](#accelerator-architecture)
- [GPU kernels and ML compilers](#gpu-kernels-compilers)
- [Running models locally](#local-inference)
