---
id: memory-math
book: 15
order: "15.3"
title: Memory math
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [vram, memory, kv-cache]
visuals:
  - serving-memory:calculator
  - kv-bytes:chart
---
> [!tldr]
> GPU memory holds weights, KV cache, activations and framework overhead. Weights are parameters × bytes per parameter; KV cache is 2 × layers × KV heads × head dimension × bytes × tokens, per sequence. Whatever is left after weights decides how many sequences, of what length, you can serve at once.

## Why it matters
Memory, not compute, usually limits how many users one GPU can serve. A model that fits comfortably with short prompts may serve only a handful of users at 32K context. Knowing the arithmetic lets you size hardware, pick quantization, choose context limits and predict costs before you deploy.

## Intuition
A GPU is a warehouse. The model’s weights are the shelving, fixed and large. Each active conversation needs its own storage bins (its KV cache), and long conversations need many bins. Once the floor is full, new customers wait outside.

```viz
{"id":"serving-memory","component":"calculator","title":"An 8B model in BF16 on an 80 GB GPU fits about 48 sequences at 8K context, and 12 at 32K","caption":"Enter your model’s architecture and GPU. Defaults are a Llama-3-8B-like configuration with grouped-query attention. Real engines also reserve memory for activations and fragmentation, modeled here as fixed overhead.","alt":"Calculator for weight memory, KV cache per sequence and maximum concurrent sequences from model architecture, context length and GPU memory.","data":"formula","outputs":[{"id":"weights_gb","label":"Weights","expr":"params_b * bytes_param","unit":"GB"},{"id":"kv_seq_gb","label":"KV cache per sequence","expr":"2 * layers * kv_heads * head_dim * kv_bytes * context / 1000000000","unit":"GB"},{"id":"free_gb","label":"Memory left for KV cache","expr":"gpu_gb * util - weights_gb - overhead_gb","unit":"GB"},{"id":"max_seqs","label":"Concurrent sequences at full context","expr":"floor(free_gb / kv_seq_gb)","unit":"count","main":true}],"inputs":{"params_b":8,"bytes_param":2,"layers":32,"kv_heads":8,"head_dim":128,"kv_bytes":2,"context":8192,"gpu_gb":80,"util":0.9,"overhead_gb":4},"input_meta":{"params_b":{"label":"Parameters","unit":"billions"},"bytes_param":{"label":"Bytes per parameter","unit":"2 BF16, 1 FP8, 0.5 INT4"},"layers":{"label":"Layers"},"kv_heads":{"label":"KV heads","unit":"after grouping"},"head_dim":{"label":"Head dimension"},"kv_bytes":{"label":"Bytes per KV value"},"context":{"label":"Tokens per sequence"},"gpu_gb":{"label":"GPU memory","unit":"GB"},"util":{"label":"Usable fraction","unit":"0 to 1"},"overhead_gb":{"label":"Activations and overhead","unit":"GB"}},"assumptions":["Every sequence uses the full context; real traffic is shorter on average, so more fit.","Paged KV allocation; no prefix sharing between sequences.","Decimal gigabytes (10⁹ bytes)."],"tests":[{"inputs":{},"expect":{"weights_gb":16,"kv_seq_gb":1.073741824,"free_gb":52,"max_seqs":48}},{"inputs":{"context":32768},"expect":{"max_seqs":12}}]}
```

## How it works
**Weights.** Parameters × bytes per parameter: 8B parameters in BF16 is 16 GB; 70B is 140 GB, more than one 80 GB GPU, so it needs [quantization](#quantization) or several GPUs. Mixture-of-experts models must hold all experts in memory even though each token uses only a few. See [mixture of experts](#mixture-of-experts).

**KV cache.** For each token, each layer stores a key and a value vector for each KV head:

```math
\text{KV bytes per token} = 2 \times \text{layers} \times \text{KV heads} \times \text{head dim} \times \text{bytes per value}
```

Multiply by tokens per sequence and by concurrent sequences. Grouped-query attention cuts KV heads, and FP8 KV halves the bytes:

```viz
{"id":"kv-bytes","component":"chart","type":"bar","title":"Grouped-query attention and an FP8 KV cache cut memory per token by 8 times","caption":"Formula view for a 32-layer model with head dimension 128: full multi-head attention with 32 KV heads, grouped-query attention with 8, and the same in FP8.","alt":"Bar chart of KV cache bytes per token: 524,288 with multi-head attention, 131,072 with grouped-query attention and 65,536 with grouped-query attention in FP8.","data":"formula","categories":["Multi-head (32 KV heads, BF16)","Grouped-query (8 KV heads, BF16)","Grouped-query, FP8 KV"],"y":{"label":"KV cache per token","unit":"bytes"},"series":[{"name":"Bytes per token","points":[[0,524288],[1,131072],[2,65536]]}]}
```

**Activations and overhead.** Temporary buffers during the forward pass, CUDA graphs, the framework itself and fragmentation. Engines reserve a fraction of memory; vLLM’s default memory-utilization setting, for example, leaves some headroom.

**Paged attention.** vLLM’s PagedAttention (Kwon et al., 2023) stores KV cache in fixed-size blocks, like virtual memory pages, so memory is not wasted on reserved-but-unused space and identical prefixes can share blocks. See [batching and scheduling](#batching-scheduling).

**Training is different.** Training also stores gradients, optimizer states (Adam keeps two extra values per parameter) and activations for backpropagation, often 12 to 20 bytes per parameter plus activations. See [distributed training](#distributed-training).

## In practice
Sizing steps:
1. Weights = parameters × bytes; choose precision so they fit with room to spare.
2. KV per token from the architecture (read the model’s config file: layers, KV heads, head dimension).
3. Expected concurrency from Little’s law and real context lengths. See [latency and throughput](#latency-throughput).
4. Check that weights + KV + overhead fit; if not, quantize, shorten contexts, use more GPUs or add replicas.

## Numbers to know
> [!number]
> Formulas. Weights GB ≈ parameters (billions) × bytes per parameter. KV per token = 2 × layers × KV heads × head dim × bytes. For a Llama-3-8B-like model: 128 KiB per token in BF16, about 1 GB per 8K-token sequence.

## Pitfalls and anti-patterns
> [!pitfall] Sizing for weights only
> A model that “fits” on a GPU may serve only a few concurrent users once real contexts fill the KV cache.

- **Using parameter counts for MoE memory.** Total parameters, not active ones, must fit.
- **Ignoring KV precision.** FP8 KV halves cache memory with small quality cost on many models; measure it.
- **Assuming every request uses full context.** Measure your real length distribution.

## Talk like an expert
The vocabulary: **weights memory**, **KV cache per token**, **grouped-query attention**, **multi-query attention**, **paged attention**, **memory utilization**, **activation memory**, **optimizer states**. Experts derive memory from the model config in a minute and quote it per token and per sequence. The live debate is how far KV compression (quantization, eviction, latent attention) can go before long-context quality suffers.

> [!hottake] Context length is the most expensive product decision nobody costs out.
> **The counterargument:** long context often replaces retrieval pipelines and engineering effort that would cost more, and prefix caching makes repeated long contexts far cheaper than the raw arithmetic suggests.

## Check yourself
```quiz
memory-math
```

## Go deeper
- Kwon et al., “Efficient Memory Management for Large Language Model Serving with PagedAttention” (2023).
- Ainslie et al., “GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints” (2023).

## Related
- [The KV cache](#kv-cache)
- [Quantization](#quantization)
- [Inference fundamentals](#inference-fundamentals)
- [Hardware](#hardware)
- [Numbers every AI engineer should know](#numbers-to-know)
