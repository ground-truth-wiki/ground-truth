---
id: kv-cache
book: 2
order: "2.6"
title: The KV cache
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [kv-cache, memory, inference]
visuals:
  - kv-cache-calculator:calculator
  - kv-growth:stepper
  - kv-per-token:chart
---
> [!tldr]
> During generation the model stores every past token’s keys and values so it never recomputes them. That cache grows linearly with context and batch size, often outgrows the weights, and decides how many users a GPU can serve at once.

## Why it matters
The KV cache is the single most important number in LLM serving. It explains why long context is expensive, why batch size hits a wall, why providers charge for cached input, and why architectures moved to grouped-query and latent attention. If you self-host, it is the term in your memory budget you are most likely to underestimate.

## Intuition
Generating text is like writing a long letter while keeping notes on everything you have written so far, so you never have to reread the whole letter. The notes are the cache. They save enormous time, but the notebook gets thicker with every word, and every reader you serve at once needs a notebook of their own.

```viz
{"id":"kv-cache-calculator","component":"calculator","title":"KV-cache memory grows linearly with context and batch size","caption":"At 128k tokens one sequence needs 40 GiB of cache, and a batch of four needs 160 GiB. Halve the KV heads and the cache halves too. Defaults match a 70B-class model with grouped-query attention.","alt":"Calculator: KV-cache bytes from layers, KV heads, head size, bytes per value, tokens and batch size.","data":"formula","try":"Set batch to 4, then set KV heads to 64 to see the cache without grouped-query attention.","formula":"2 × layers × kv_heads × head_dim × bytes_per_value × tokens × batch","inputs":{"layers":80,"kv_heads":8,"head_dim":128,"bytes_per_value":2,"tokens":131072,"batch":1},"input_meta":{"layers":{"label":"Layers"},"kv_heads":{"label":"KV heads"},"head_dim":{"label":"Head dimension"},"bytes_per_value":{"label":"Precision","options":[["FP32, 4 bytes",4],["BF16 or FP16, 2 bytes",2],["FP8 or INT8, 1 byte",1],["INT4, 0.5 bytes",0.5]]},"tokens":{"label":"Tokens in context"},"batch":{"label":"Concurrent sequences"}},"result":{"label":"KV-cache memory","unit":"bytes"},"assumptions":["The factor 2 counts one key and one value per position.","Every layer stores a full cache (no cross-layer sharing).","No paging overhead or fragmentation; real engines add some."],"tests":[{"inputs":{"tokens":1},"expect_bytes":327680},{"inputs":{"tokens":131072},"expect_bytes":42949672960}]}
```

## How it works
For each new token, every layer computes a query, key and value. The query attends over all previous keys and values. Without a cache you would recompute every previous key and value at every step; with one, you compute them once and append.

**The memory formula.** Per token, per layer, the cache stores one key and one value vector for each key-value head:

```math
\text{bytes} = 2 \times L \times H_{kv} \times d_{head} \times b \times T \times B
```

with L layers, H_kv key-value heads, head dimension d_head, b bytes per value, T tokens and B concurrent sequences.

**Prefill and decode.** Prefill processes the whole prompt at once and fills the cache for all prompt tokens. Decode then generates one token at a time, reading the whole cache at every step and appending one entry. See [inference fundamentals](#inference-fundamentals).

```viz
{"id":"kv-growth","component":"stepper","title":"Prefill writes the cache for the whole prompt at once; each decoded token appends one more entry","caption":"Illustrative, using the 70B-class shape above: about 320 KiB of cache per token. The bar is a budget of eight tokens so the growth is visible.","alt":"Stepper showing the KV cache filling during prefill of a four-token prompt and growing by one entry per generated token.","data":"formula","frames":[
{"label":"Empty","caption":"Before the request, this sequence has no cache.","tokens":[],"stack":{"cap":2560,"unit":"KiB","label":"KV cache","items":[]}},
{"label":"Prefill","caption":"The prompt “The capital of France” is processed in one pass. Four tokens: 4 × 320 KiB = 1,280 KiB written at once.","tokens":["The","␣capital","␣of","␣France"],"stack":{"cap":2560,"unit":"KiB","label":"KV cache","items":[{"label":"Prompt (prefill)","tokens":1280,"role":"context","short":"Prompt"}]}},
{"label":"Decode 1","caption":"The model generates “ is”. It reads all four cached entries and appends its own: 1,600 KiB.","tokens":["The","␣capital","␣of","␣France","␣is"],"stack":{"cap":2560,"unit":"KiB","label":"KV cache","items":[{"label":"Prompt (prefill)","tokens":1280,"role":"context","short":"Prompt"},{"label":"Generated","tokens":320,"role":"model"}]}},
{"label":"Decode 2","caption":"“ Paris”: one more read of the whole cache, one more entry. Each step reads more than the last.","tokens":["The","␣capital","␣of","␣France","␣is","␣Paris"],"stack":{"cap":2560,"unit":"KiB","label":"KV cache","items":[{"label":"Prompt (prefill)","tokens":1280,"role":"context","short":"Prompt"},{"label":"Generated","tokens":640,"role":"model"}]}},
{"label":"Decode 3","caption":"“.” and the sequence ends. The cache can now be freed, or kept as a prefix cache if another request starts the same way.","tokens":["The","␣capital","␣of","␣France","␣is","␣Paris","."],"stack":{"cap":2560,"unit":"KiB","label":"KV cache","items":[{"label":"Prompt (prefill)","tokens":1280,"role":"context","short":"Prompt"},{"label":"Generated","tokens":960,"role":"model"}]}}]}
```

**Why it limits context and batch.** GPU memory must hold the weights plus every active sequence’s cache. With 80 GB of memory and 140 GB of 16-bit weights for a 70B model you already need two GPUs before the first token; at long context the caches can exceed the weights. Batch size, which drives throughput, is capped by how many caches fit.

**How it is shrunk.**
- **Fewer KV heads.** GQA and MQA cut the cache by the ratio of query heads to KV heads; MLA stores a compressed latent instead. See [attention](#attention).
- **Quantization.** Storing the cache in 8 bits halves it versus 16 bits, usually with little quality loss. See [quantization](#quantization).
- **Paging.** PagedAttention (Kwon et al., 2023, the basis of vLLM) stores caches in fixed-size blocks like virtual memory, cutting fragmentation and enabling sharing. See [batching](#batching-scheduling).
- **Prefix sharing.** Requests that share a prompt prefix can share its cache; this is what [prompt caching](#prompt-caching) sells you.
- **Eviction and offloading.** Drop or move old entries to CPU memory, with care for attention sinks.

```viz
{"id":"kv-per-token","component":"chart","type":"bar","title":"Sharing key-value heads shrinks the cache per token by up to 64 times","caption":"Computed with the formula for an 80-layer model with 64 query heads, head dimension 128, at 16-bit precision. Log scale.","alt":"Bar chart of KV-cache bytes per token: multi-head attention with 64 KV heads 2.5 MiB, grouped-query with 8 KV heads 320 KiB, multi-query with 1 KV head 40 KiB.","data":"formula","categories":["MHA, 64 KV heads","GQA, 8 KV heads","MQA, 1 KV head"],"y":{"label":"Bytes per token","unit":"bytes","log":true},"series":[{"name":"KV cache per token","points":[[0,2621440],[1,327680],[2,40960]]}]}
```

## In practice
Size every deployment with the formula before you buy hardware, and remember to multiply by concurrency. In serving engines, the cache gets whatever memory is left after weights; vLLM, for example, exposes a setting for the fraction of GPU memory it may use, and reports how many tokens of cache it allocated at startup.

```python
def kv_bytes(layers, kv_heads, head_dim, bytes_per_value, tokens, batch=1):
    return 2 * layers * kv_heads * head_dim * bytes_per_value * tokens * batch

print(kv_bytes(80, 8, 128, 2, 131_072) / 2**30)   # 40.0 GiB for one 128k sequence
```

## Numbers to know
> [!number]
> Rules of thumb. A 70B-class model with GQA-8 at 16-bit uses about 320 KiB of cache per token, about 40 GiB per 128k-token sequence. Without GQA, the same shape would need about 2.5 MiB per token. FP8 cache halves these. See [memory math](#memory-math) for full VRAM budgets.

## Pitfalls and anti-patterns
> [!pitfall] Sizing GPUs for the weights only
> A model that “fits on one GPU” may fit only at batch 1 with short context. Budget for the cache at your real context length and concurrency.

- **Counting query heads instead of KV heads.** Overestimates memory by the GQA ratio.
- **Ignoring output length.** Long generations grow the cache too.
- **Breaking prefix sharing.** Unstable prompt prefixes waste cache that could be shared across requests.

## Talk like an expert
The vocabulary: **KV cache**, **prefill and decode**, **KV heads**, **PagedAttention**, **prefix caching** or **RadixAttention** (from SGLang), **KV-cache quantization**, **eviction**, **offloading**. Experts quote memory per token and per sequence, and reason about serving as “how many caches fit next to the weights”. The live debate is how far compression and eviction can go before long-context quality suffers.

> [!hottake] Long context is a KV-cache business, not a model feature.
> **The counterargument:** cache tricks only make long context affordable; whether the model uses those tokens well is a training and architecture question, and that is where the hard problems remain.

## Check yourself
```quiz
kv-cache
```

## Go deeper
- Kwon et al., “Efficient Memory Management for Large Language Model Serving with PagedAttention” (2023).
- Ainslie et al., “GQA” (2023), and the DeepSeek-V2 report (2024) for MLA.
- Pope et al., “Efficiently Scaling Transformer Inference” (2022), on inference memory and partitioning.

## Related
- [Attention step by step](#attention)
- [Memory math](#memory-math)
- [Inference fundamentals](#inference-fundamentals)
- [Batching and scheduling](#batching-scheduling)
- [Prompt caching and token economics](#prompt-caching)
- [Quantization](#quantization)
