---
id: kv-cache-compression
book: 2
order: "2.6.1"
title: KV-cache compression, eviction and offloading
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [kv-cache, compression, eviction, quantization, long-context]
visuals: []
prerequisites: [kv-cache]
---
> [!tldr]
> When the KV cache, not the weights, fills GPU memory, there are four levers: store less per token (architecture), fewer bits (quantization), fewer tokens (eviction), or store the cache somewhere cheaper (offloading). Each saves memory in a different place and breaks something different. Remember that eviction throws information away for good, so judge a method on long-context retrieval and multi-turn tasks, not on perplexity.

## Key ideas

- **Architecture sets the baseline, and it is fixed at training time.** Grouped-query and multi-query attention share KV heads across query heads, cross-layer attention also shares them between adjacent layers for another 2× reduction over multi-query attention at nearly the same accuracy (Brandon et al., [“Reducing Transformer Key-Value Cache Size with Cross-Layer Attention”](https://arxiv.org/abs/2405.12981) (2024)), and multi-head latent attention caches a compressed latent instead of full keys and values; DeepSeek-V2, which uses it, reports a KV cache 93.3% smaller than DeepSeek 67B's (DeepSeek-AI, [“DeepSeek-V2: A Strong, Economical, and Efficient Mixture-of-Experts Language Model”](https://arxiv.org/abs/2405.04434) (2024)). Hybrid layer stacks help too: Gemma 3 uses five sliding-window layers with a 1,024-token span for every global layer to cut KV memory (Gemma Team, [“Gemma 3 Technical Report”](https://arxiv.org/abs/2503.19786) (2025)).
- **Quantization stores fewer bits.** An FP8 cache stores 8 bits per value instead of 16, half the memory; in vLLM, as of November 2026, it is set with `kv_cache_dtype`, scales default to 1.0 unless calibrated (llm-compressor calibration is recommended for accuracy), and `kv_cache_dtype_skip_layers` keeps sensitive layers, such as sliding-window layers, at native precision ([vLLM docs: Quantized KV cache](https://docs.vllm.ai/en/latest/features/quantization/quantized_kvcache/)). KIVI goes to 2 bits without tuning by quantizing keys per channel and values per token while keeping a window of recent tokens in full precision, and reports almost the same quality with 2.6× less peak memory, weights included (Liu et al., [“KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache”](https://arxiv.org/abs/2402.02750) (2024)).
- **Eviction stores fewer tokens.** StreamingLLM keeps a few initial "attention sink" tokens (4 suffice) plus a window of recent ones, which keeps window attention stable on streams of millions of tokens (Xiao et al., [“Efficient Streaming Language Models with Attention Sinks”](https://arxiv.org/abs/2309.17453) (2023)). H2O keeps recent tokens plus "heavy hitters" that collect most of the attention (Zhang et al., [“H2O: Heavy-Hitter Oracle for Efficient Generative Inference of Large Language Models”](https://arxiv.org/abs/2306.14048) (2023)), and SnapKV compresses the prompt's cache before decoding, choosing positions per head from an observation window at the end of the prompt (Li et al., [“SnapKV: LLM Knows What You are Looking for Before Generation”](https://arxiv.org/abs/2404.14469) (2024)).
- **What eviction breaks, and how to test it.** StreamingLLM's perplexity stays stable, yet its authors state that it does not extend the context window or long-term memory and does not suit long-document question answering ([Xiao et al.](https://arxiv.org/abs/2309.17453)). SCBench, which reuses one shared context across several follow-up queries in string retrieval, semantic retrieval, global information and multi-task categories, finds that methods with sub-O(n) memory suffer in multi-turn use (Li et al., [“SCBench: A KV Cache-Centric Analysis of Long-Context Methods”](https://arxiv.org/abs/2412.10319) (2024)). A benchmark of compression methods across seven long-context task categories found that quantization holds up across all of them, that token-dropping methods excel on some task types, such as coding, and that needle-in-a-haystack retrieval stays hard for prefill-time compression (Yuan et al., [“KV Cache Compression, But What Must We Give in Return? A Comprehensive Benchmark of Long Context Capable Approaches”](https://arxiv.org/abs/2407.01527) (2024)).
- **Offloading stores it somewhere cheaper.** Plain offloading changes no values, so it costs transfer time rather than accuracy. Instead of dropping entries, a tiered cache moves them to CPU memory, local disk or remote storage and reuses them across requests, sessions and engine instances; LMCache does this as a layer under serving engines such as vLLM, aimed at long-context agentic, multi-turn and RAG workloads ([LMCache](https://github.com/LMCache/LMCache)).
- **A cautious order, and engine support.** The points above suggest lossless reuse and offloading first, calibrated FP8 next, and lower bits or eviction only after measuring on your own long-context tasks. As of November 2026, SGLang's `--kv-cache-dtype` accepts FP8 formats and, with CUDA 12.8+ and PyTorch 2.8.0+, FP4 recipes (`nvfp4`, `fp4_mx_block16`) ([SGLang server arguments](https://docs.sglang.io/advanced_features/server_arguments.html)), and `--enable-hierarchical-cache` turns on HiCache, which adds a host-memory tier sized with `--hicache-ratio` or `--hicache-size` ([SGLang HiCache best practices](https://docs.sglang.io/advanced_features/hicache_best_practices.html)).

## Planned visuals

- **`tree`:** a decision guide by workload: repeated prefixes (prefix caching and offloading), memory-bound batches at moderate context (FP8), streaming chat (sinks plus a window), long single-pass documents (architecture choice or careful quantization), each with what it gives up.
- **`calculator`:** KV bytes per token and per sequence after each lever (KV heads, layer sharing, bits per value, fraction of tokens kept), extending the calculator in [The KV cache](#kv-cache).
- **`compare`:** the same long-document question answered with a full cache and with a sink-plus-window cache, highlighting the evicted fact the second cannot retrieve (illustrative).

## Talk like an expert

Experts separate lossless savings (paging, prefix sharing, offloading) from lossy ones (quantization, eviction), name methods by what they keep (sinks, heavy hitters, an observation window, per-channel keys), and first ask how a method was evaluated: on needle, multi-hop and multi-turn suites, or only on perplexity.

## Go deeper

- Xiao et al., [“Efficient Streaming Language Models with Attention Sinks”](https://arxiv.org/abs/2309.17453) (2023).
- Liu et al., [“KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache”](https://arxiv.org/abs/2402.02750) (2024).
- Li et al., [“SCBench: A KV Cache-Centric Analysis of Long-Context Methods”](https://arxiv.org/abs/2412.10319) (2024).
- [vLLM docs: Quantized KV cache](https://docs.vllm.ai/en/latest/features/quantization/quantized_kvcache/).

## Related

- [The KV cache](#kv-cache)
- [Memory math](#memory-math)
- [Quantization](#quantization)
- [Efficient attention and long context](#long-context)
- [Sparse and local attention](#sparse-and-local-attention)
- [Serving engines](#serving-engines)
