---
id: quantization
book: 15
order: "15.6"
title: Quantization
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [quantization, int4, fp8, gguf]
visuals:
  - weight-memory:chart
  - bitwidth-error:chart
  - quant-chooser:tree
---
> [!tldr]
> Quantization stores weights, activations or the KV cache in fewer bits: FP8 and INT8 are usually close to lossless, 4-bit weights are the common sweet spot for memory, and below that quality degrades quickly. Choose the format by hardware and serving engine, and always measure on your own tasks.

## Why it matters
Halving the bytes per weight halves the memory needed for weights and roughly doubles memory-bound decode speed. Quantization is how 70B-parameter models run on one GPU, how laptops run capable local models, and how serving costs fall. Done carelessly, it quietly degrades exactly the hard cases your users care about.

## Intuition
Quantization is saving photos at lower quality. At high settings nobody notices; at low settings fine detail blurs. Large models are like high-resolution photos: they survive more compression than small ones.

```viz
{"id":"weight-memory","component":"chart","type":"bar","title":"A 70B model needs 140 GB in BF16 and about 35 GB at 4 bits","caption":"Formula view: 70 billion parameters × bits per weight ÷ 8. Real 4-bit formats add a few percent for scale factors.","alt":"Bar chart of weight memory for a 70-billion-parameter model: 140 GB at 16 bits, 70 GB at 8 bits, 35 GB at 4 bits and about 26 GB at 3 bits.","data":"formula","categories":["16-bit (BF16)","8-bit (FP8, INT8)","4-bit","3-bit"],"y":{"label":"Weight memory","unit":"GB"},"series":[{"name":"70B model","points":[[0,140],[1,70],[2,35],[3,26.25]]}]}
```

## How it works
**What gets quantized.**
- **Weights only** (for example W4A16: 4-bit weights, 16-bit activations): saves memory and speeds memory-bound decode; arithmetic still runs in 16 bits after dequantizing.
- **Weights and activations** (W8A8, FP8): lets tensor cores run low-precision arithmetic, speeding compute-bound prefill too.
- **KV cache** (FP8 or INT8): more sequences and longer contexts per GPU. See [memory math](#memory-math).

**Post-training methods.**
- **LLM.int8()** (Dettmers et al., 2022) handles outlier features separately so 8-bit inference stays accurate.
- **SmoothQuant** (Xiao et al., 2022) moves outlier difficulty from activations into weights to enable W8A8.
- **GPTQ** (Frantar et al., 2022) quantizes weights layer by layer, compensating errors with second-order information.
- **AWQ** (Lin et al., 2023) protects the small share of weights that matter most for activations.

**Formats.** FP8 (E4M3 and E5M2) is native on recent NVIDIA and AMD accelerators. Microscaling formats such as MXFP4 and NVIDIA’s NVFP4 store 4-bit values with shared scales per small block; OpenAI’s gpt-oss models shipped with MXFP4 weights in 2025. GGUF, from the llama.cpp project, packages many integer quantization schemes for local inference.

**Quantization-aware training.** Training or fine-tuning with quantization in the loop recovers quality at very low bit widths; QLoRA (Dettmers et al., 2023) fine-tunes adapters on a 4-bit base model. See [fine-tuning in practice](#fine-tuning-practice).

**How quality degrades.** Loss is small down to about 8 bits, modest at 4 bits for most large models, and grows quickly below that:

```viz
{"id":"bitwidth-error","component":"chart","type":"line","title":"Quality holds to about 4 bits per weight, then falls off a cliff","caption":"Illustrative shape, not a measurement: relative benchmark score against bits per weight for a large and a small model. Small models degrade earlier. Measure your own model and tasks.","alt":"Illustrative line chart of relative quality against bits per weight for a large and a small model, flat to about 4 bits and dropping steeply below 3 bits.","data":"illustrative","x":{"label":"Bits per weight"},"y":{"label":"Relative score","unit":"pct","min":0.4,"max":1.02},"series":[{"name":"Large model","points":[[2,0.62],[3,0.9],[4,0.97],[5,0.99],[6,0.995],[8,1],[16,1]]},{"name":"Small model","points":[[2,0.45],[3,0.74],[4,0.92],[5,0.97],[6,0.985],[8,0.998],[16,1]]}]}
```

## In practice
```viz
{"id":"quant-chooser","component":"tree","title":"Hardware and serving target pick the format","caption":"Expand your situation. Whatever you choose, evaluate on your own tasks, including long-context and reasoning cases where quantization errors compound.","alt":"Decision tree for choosing a quantization approach by hardware and deployment target.","data":"illustrative","open":1,"root":{"label":"Where will the model run?","children":[
{"label":"Recent data-center GPUs with FP8 support","children":[{"label":"FP8 weights and activations, FP8 KV cache: near-lossless and fast"}]},
{"label":"GPUs with tight memory for a big model","children":[{"label":"4-bit weights (AWQ, GPTQ or a microscaling format) with 16-bit activations"}]},
{"label":"Laptops, desktops and CPUs","children":[{"label":"GGUF quantizations through llama.cpp or tools built on it, around 4 to 5 bits","link":"#edge-on-device"}]},
{"label":"Phones and edge devices","children":[{"label":"Vendor toolchains with 4-bit or lower weights; consider a smaller model instead","link":"#small-local-models"}]},
{"label":"Fine-tuning on limited hardware","children":[{"label":"QLoRA: adapters trained on a 4-bit base model","link":"#fine-tuning-practice"}]}]}}
```

Evaluation rules:
- Compare the quantized and original models on your eval set, not only on perplexity.
- Include long-context, math, code and multilingual cases, which often degrade first.
- Check that your serving engine has fast kernels for the format; slow kernels erase the gain.

## Numbers to know
> [!number]
> Formulas and rules of thumb. Weight GB ≈ parameters (billions) × bits ÷ 8. 8-bit is usually near-lossless; 4-bit costs a little on most large models; below 3 bits costs a lot. Memory-bound decode speeds up roughly in proportion to the bytes saved.

## Pitfalls and anti-patterns
> [!pitfall] Trusting perplexity alone
> Small perplexity changes can hide large drops on reasoning, code or rare languages. Evaluate on tasks.

- **Formats without fast kernels.** The model fits but runs slower.
- **Quantizing small models aggressively.** They lose quality faster than large ones.
- **Forgetting the KV cache.** At long contexts it can outweigh the weights.

## Talk like an expert
The vocabulary: **W4A16**, **W8A8**, **FP8 (E4M3, E5M2)**, **microscaling (MXFP4, NVFP4)**, **GPTQ**, **AWQ**, **SmoothQuant**, **GGUF**, **KV cache quantization**, **quantization-aware training**. Experts specify what is quantized (weights, activations, KV), the format, and the eval delta. The live debate is how low precision can go for training as well as inference, as hardware adds 4-bit tensor cores.

> [!hottake] A 4-bit large model usually beats a 16-bit small model of the same memory footprint.
> **The counterargument:** for latency-critical or very long-context workloads, the smaller full-precision model can be faster and more robust, and some tasks degrade sharply under 4-bit quantization.

## Check yourself
```quiz
quantization
```

## Go deeper
- Dettmers et al., “LLM.int8()” (2022); Xiao et al., “SmoothQuant” (2022).
- Frantar et al., “GPTQ” (2022); Lin et al., “AWQ” (2023).
- The Open Compute Project’s microscaling (MX) format specification.

## Related
- [Memory math](#memory-math)
- [Inference fundamentals](#inference-fundamentals)
- [Hardware](#hardware)
- [Edge and on-device AI](#edge-on-device)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Eigenvectors, SVD and PCA](#eigenvectors-svd-pca)
- [Automatic differentiation](#automatic-differentiation)
- [Floating-point formats and numerical precision](#floating-point-formats)
- [Mixed and low-precision training](#low-precision-training)
- [Pruning and structured compression](#llm-pruning)
- [How GPUs and accelerators run neural networks](#accelerator-architecture)
- [GPU kernels and ML compilers](#gpu-kernels-compilers)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Quantization methods in depth](#quantization-methods)
