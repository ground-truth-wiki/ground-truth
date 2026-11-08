---
id: sparse-and-local-attention
book: 2
order: "2.7.1"
title: Sparse and local attention
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [sparse-attention, sliding-window, long-context, attention, efficiency]
visuals: []
prerequisites: [attention, long-context]
---
> [!tldr]
> Sparse attention lets each query look at only some keys: a fixed local window, a few global tokens, or blocks that a learned selector picks. It cuts the quadratic cost of attention, and local layers also shrink the KV cache. Remember that every skipped query-key pair is something that layer cannot see, so production designs keep a path to the full context, and any sparse design should be tested on long-range retrieval.

## Key ideas

- **Fixed patterns came first.** Sparse Transformers factorized attention into sparse patterns (strided and fixed) with O(n√n) cost (Child et al., [“Generating Long Sequences with Sparse Transformers”](https://arxiv.org/abs/1904.10509) (2019)). Longformer combined a sliding local window with task-specific global attention and scaled linearly with length (Beltagy et al., [“Longformer: The Long-Document Transformer”](https://arxiv.org/abs/2004.05150) (2020)), and BigBird added random links to window and global attention and proved the sparse model is still a universal approximator and Turing complete (Zaheer et al., [“Big Bird: Transformers for Longer Sequences”](https://arxiv.org/abs/2007.14062) (2020)).
- **Local layers interleaved with global ones are the common production form.** Mistral 7B uses a 4,096-token sliding window and relies on stacked layers to carry information further (Jiang et al., [“Mistral 7B”](https://arxiv.org/abs/2310.06825) (2023)). Gemma 2 alternates 4,096-token local layers with 8,192-token global ones (Gemma Team, [“Gemma 2: Improving Open Language Models at a Practical Size”](https://arxiv.org/abs/2408.00118) (2024)), and Gemma 3 moved to five local layers per global layer with a 1,024-token window, with minimal effect on perplexity (Gemma Team, [“Gemma 3 Technical Report”](https://arxiv.org/abs/2503.19786) (2025)). gpt-oss alternates dense layers with 128-token banded windows (OpenAI, [“gpt-oss-120b & gpt-oss-20b Model Card”](https://arxiv.org/abs/2508.10925) (2025)), ModernBERT puts global attention in every third layer and a 128-token window in the rest (Warner et al., [“Smarter, Better, Faster, Longer: A Modern Bidirectional Encoder for Fast, Memory Efficient, and Long Context Finetuning and Inference”](https://arxiv.org/abs/2412.13663) (2024)), and the Hugging Face implementation of Llama 4 uses chunked local attention with a default `attention_chunk_size` of 8,192 ([transformers Llama 4 configuration](https://github.com/huggingface/transformers/blob/main/src/transformers/models/llama4/configuration_llama4.py), as of November 2026).
- **Learned sparsity picks what to read for each query.** Native Sparse Attention runs three branches (compressed coarse tokens, selected fine-grained blocks and a sliding window), is trained end to end, and matched or beat full attention in its authors' experiments (Yuan et al., [“Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention”](https://arxiv.org/abs/2502.11089) (2025)). MoBA applies mixture-of-experts top-k gating to blocks of keys; its authors report that it was deployed to support Kimi's long-context requests (Lu et al., [“MoBA: Mixture of Block Attention for Long-Context LLMs”](https://arxiv.org/abs/2502.13189) (2025)). DeepSeek Sparse Attention scores preceding tokens with a small "lightning indexer" and attends only to the top k (2,048 per query in training); it was added to an existing model by continued training (DeepSeek-AI, [“DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models”](https://arxiv.org/abs/2512.02556) (2025)), and GLM-5 adopted it (GLM-5 Team, [“GLM-5: from Vibe Coding to Agentic Engineering”](https://arxiv.org/abs/2602.15763) (2026)).
- **Know what is saved, and in which phase.** Many methods are sparse in only one phase, H2O in decoding and MInference in prefill, so the other phase still costs as much as full attention ([Yuan et al.](https://arxiv.org/abs/2502.11089)). Local layers cap the cache of those layers, which is why Gemma 3 uses them ([Gemma 3 report](https://arxiv.org/abs/2503.19786)), whereas DeepSeek Sparse Attention cuts core attention from O(L²) to O(Lk) while its indexer stays O(L²) ([DeepSeek-V3.2 report](https://arxiv.org/abs/2512.02556)). Because the indexer scores every preceding token, any entry can be selected, so all of them must be kept: the saving is in compute, not cache memory.
- **Sparsity must be block-aligned to be fast.** GPUs read contiguous blocks far faster than scattered indices, so NSA selects contiguous blocks rather than single tokens ([Yuan et al.](https://arxiv.org/abs/2502.11089)). FlexAttention's `BlockMask` skips key blocks that are fully masked (128 tokens by default), which makes a causal mask about 2× faster than computing every block and masking afterwards, and makes sliding-window attention significantly faster than FlashAttention-2 with a plain causal mask ([PyTorch blog: FlexAttention](https://pytorch.org/blog/flexattention/)).
- **What it risks, and how to evaluate it.** SCBench finds that sparse methods which keep the full O(n) cache and only sparsify prefill stay robust in multi-turn use, that dynamic sparsity yields more expressive caches than static patterns, and that layer-level sparsity in hybrid models keeps strong performance (Li et al., [“SCBench: A KV Cache-Centric Analysis of Long-Context Methods”](https://arxiv.org/abs/2412.10319) (2024)). Test retrieval and multi-hop questions whose evidence sits far outside the window, since a window method can keep perplexity stable over millions of tokens and still, as the StreamingLLM authors state, not suit long-document question answering (Xiao et al., [“Efficient Streaming Language Models with Attention Sinks”](https://arxiv.org/abs/2309.17453) (2023)).

## Planned visuals

- **`heatmap`:** attention masks over query and key blocks for full causal attention, a sliding window, window plus global tokens, BigBird's random links and a learned top-k block selection, showing which blocks are computed and which are skipped.
- **`stepper`:** information flow through stacked sliding-window layers: the reach grows by one window per layer, and a periodic global layer reaches the whole context in one step.
- **`chart`:** formula view of attention compute and KV-cache bytes against context length for full attention, a five-to-one local and global stack, and top-k selection.

## Talk like an expert

Experts talk about local and global layers, window size, banded and chunked attention, block sparsity, indexers and top-k selection, and they always separate what a method saves (prefill compute, decode bandwidth or cache memory) from what it gives up (direct access to distant tokens).

## Go deeper

- Child et al., [“Generating Long Sequences with Sparse Transformers”](https://arxiv.org/abs/1904.10509) (2019).
- Yuan et al., [“Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention”](https://arxiv.org/abs/2502.11089) (2025).
- DeepSeek-AI, [“DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models”](https://arxiv.org/abs/2512.02556) (2025).
- [PyTorch blog: FlexAttention](https://pytorch.org/blog/flexattention/).

## Related

- [Efficient attention and long context](#long-context)
- [Attention step by step](#attention)
- [KV-cache compression, eviction and offloading](#kv-cache-compression)
- [Linear attention and hybrid models](#linear-attention-hybrids)
- [Architecture choices in modern LLMs](#architecture-choices)
