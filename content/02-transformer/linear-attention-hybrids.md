---
id: linear-attention-hybrids
book: 2
order: "2.9.1"
title: Linear attention and hybrid models
level: frontier
stability: moving
reviewed: "2026-11"
status: seed
tags: [linear-attention, hybrid-models, deltanet, state-space-models, efficiency]
visuals: []
prerequisites: [beyond-transformers, attention]
---
> [!tldr]
> Linear attention drops the softmax, so attention becomes a recurrence over a fixed-size matrix state: each new token costs the same time and memory however long the context is. Modern variants add decay, gates and the delta rule to control what the state keeps and forgets, and production models mix them with a minority of full-attention layers. Remember that a fixed-size state is a lossy memory: hybrids keep some full attention because exact recall from far back is where linear layers fall short.

## Key ideas

- **Linear attention is an RNN.** Replace the softmax similarity with a product of kernel feature maps, and the associativity of matrix products lets the model add each key-value pair once into a fixed-size state instead of comparing every query with every key, so cost grows linearly with length and decoding becomes a recurrent update. Katharopoulos et al. reported quality similar to vanilla transformers on their tasks and up to 4000x faster autoregressive prediction on very long sequences (Katharopoulos et al., [“Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention”](https://arxiv.org/abs/2006.16236) (2020)).
- **The state is an associative memory, so it needs a way to forget.** Every step writes a key-value association into the same matrix: RetNet multiplies the state by a fixed decay per head before each write (Sun et al., [“Retentive Network: A Successor to Transformer for Large Language Models”](https://arxiv.org/abs/2307.08621) (2023)), and gated linear attention (GLA) makes that forget gate depend on the input (Yang et al., [“Gated Linear Attention Transformers with Hardware-Efficient Training”](https://arxiv.org/abs/2312.06635) (2023)). Mamba-2 shows that selective state space models and variants of attention are connected through decompositions of one class of structured matrices, a link its authors call state space duality (Dao and Gu, [“Transformers are SSMs: Generalized Models and Efficient Algorithms Through Structured State Space Duality”](https://arxiv.org/abs/2405.21060) (2024)).
- **The delta rule edits the memory instead of piling onto it.** A delta-rule layer reads what the state already returns for the new key and writes only the correction toward the new value, which makes DeltaNet more effective at associative recall, and Yang et al. made it trainable in parallel over the sequence (Yang et al., [“Parallelizing Linear Transformers with the Delta Rule over Sequence Length”](https://arxiv.org/abs/2406.06484) (2024)). Gated DeltaNet adds a gate because “gating enables rapid memory erasure while the delta rule facilitates targeted updates” (Yang et al., [“Gated Delta Networks: Improving Mamba2 with Delta Rule”](https://arxiv.org/abs/2412.06464) (2024)); Kimi Delta Attention (KDA) makes that gate finer-grained, per channel instead of per head (Kimi Team, [“Kimi Linear: An Expressive, Efficient Attention Architecture”](https://arxiv.org/abs/2510.26692) (2025)), and RWKV-7 uses a generalized delta rule with vector-valued gates and in-context learning rates (Peng et al., [“RWKV-7 ‘Goose’ with Expressive Dynamic State Evolution”](https://arxiv.org/abs/2503.14456) (2025)).
- **Training runs chunk by chunk.** A token-by-token loop wastes the GPU, so kernels split the sequence into chunks, compute inside each chunk with matrix multiplications and carry the state from chunk to chunk, the chunkwise recurrent form that RetNet already offered ([Sun et al., 2023](https://arxiv.org/abs/2307.08621)); the FlashLinearAttention kernel from the GLA paper was faster than FlashAttention-2 as a standalone layer even at short sequence lengths such as 1K ([Yang et al., 2023](https://arxiv.org/abs/2312.06635)). As of November 2026, the open flash-linear-attention library collects Triton-based kernels for RetNet, GLA, Mamba2, DeltaNet, Gated DeltaNet, RWKV-7, KDA and many other layers ([fla-org/flash-linear-attention](https://github.com/fla-org/flash-linear-attention)).
- **Recall is the weak spot, so production models are hybrids.** Yang et al. note that linear transformers and state space models still underperform softmax transformers, especially on tasks that need in-context retrieval ([Yang et al., 2024](https://arxiv.org/abs/2406.06484)). In Zoology, about 82% of the perplexity gap between gated-convolution models (a class the authors say includes RWKV and RetNet) and attention was explained by associative recall, and a 70M-parameter attention model beat a 1.4B gated-convolution model at it; the authors introduced the multi-query associative recall (MQAR) task as a synthetic test of this skill (Arora et al., [“Zoology: Measuring and Improving Recall in Efficient Language Models”](https://arxiv.org/abs/2312.04927) (2023)). As of November 2026, Jamba interleaves one attention layer per seven Mamba layers (Lieber et al., [“Jamba: A Hybrid Transformer-Mamba Language Model”](https://arxiv.org/abs/2403.19887) (2024)), Qwen3-Next-80B-A3B and Qwen3.5-397B-A17B repeat three Gated DeltaNet layers and one gated attention layer ([Qwen3-Next model card](https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct), [Qwen3.5 model card](https://huggingface.co/Qwen/Qwen3.5-397B-A17B)), Kimi Linear uses three KDA layers per Multi-Head Latent Attention layer and reports up to 75% less KV cache and up to 6x decoding throughput at 1M tokens than a full-MLA model trained the same way ([Kimi Team, 2025](https://arxiv.org/abs/2510.26692)), and Nemotron-H replaces most attention layers with Mamba layers (NVIDIA, [“Nemotron-H: A Family of Accurate and Efficient Hybrid Mamba-Transformer Models”](https://arxiv.org/abs/2504.03624) (2025)).
- **Serving changes shape.** A linear or Mamba layer keeps one fixed-size state per sequence that is updated in place, while attention layers keep a paged KV cache that grows: for NVIDIA-Nemotron-Nano-12B-v2 at 128K tokens, the vLLM write-up notes that the KV cache can be nearly 200 times larger than the Mamba state, and vLLM enlarges attention blocks to match the state's page size so one allocator manages both ([PyTorch blog, “Hybrid Models as First-Class Citizens in vLLM”](https://pytorch.org/blog/hybrid-models-as-first-class-citizens-in-vllm/) (2025)). Because the state is overwritten, prefix caching is harder: as of November 2026, vLLM stores Mamba state only on a block grid, so a cache hit can resume only at a block boundary ([vLLM docs: automatic prefix caching](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html)).

## Planned visuals

- **`stepper`:** one token's write into a small matrix state, shown as a grid, in three variants: plain linear attention adds the new association, a gated layer first decays the whole state, and the delta rule reads the old value for the key and writes only the correction.
- **`chart`:** memory per sequence against context length on log axes for a full-attention transformer, a 3:1 hybrid and a pure linear model, computed from layer counts and head sizes in published model cards (formula, not measured).
- **`diagram`:** hybrid layouts side by side, Jamba (1 attention : 7 Mamba), Qwen3-Next (3 Gated DeltaNet : 1 gated attention) and Kimi Linear (3 KDA : 1 MLA), with each layer type linked to its chapter.

## Talk like an expert

Experts talk about the **state size**, **decay** and **forget gates**, the **delta rule**, **chunkwise kernels**, the **hybrid ratio** of linear to full-attention layers and **MQAR-style recall**. They judge a hybrid by its recall-heavy evals at the target context length and by whether the serving engine supports its state with prefix caching, not by perplexity alone.

## Go deeper

- Katharopoulos et al., [“Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention”](https://arxiv.org/abs/2006.16236) (2020).
- Yang et al., [“Gated Delta Networks: Improving Mamba2 with Delta Rule”](https://arxiv.org/abs/2412.06464) (2024).
- Arora et al., [“Zoology: Measuring and Improving Recall in Efficient Language Models”](https://arxiv.org/abs/2312.04927) (2023).
- Kimi Team, [“Kimi Linear: An Expressive, Efficient Attention Architecture”](https://arxiv.org/abs/2510.26692) (2025).

## Related

- [Beyond the transformer](#beyond-transformers)
- [New architectures and efficiency](#new-architectures)
- [Recurrent networks, LSTMs and sequence-to-sequence models](#recurrent-networks)
- [Sparse and local attention](#sparse-and-local-attention)
- [The KV cache](#kv-cache)
- [Efficient attention and long context](#long-context)
