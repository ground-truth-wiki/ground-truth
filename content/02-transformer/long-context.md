---
id: long-context
book: 2
order: "2.7"
title: Efficient attention and long context
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [flashattention, long-context, context-rot]
visuals:
  - flash-tiling:stepper
  - attention-memory:chart
---
> [!tldr]
> Standard attention compares every token with every other, so its cost grows with the square of the sequence length. FlashAttention computes exactly the same result in tiles without storing the full score matrix; sparse, sliding-window and linear variants change the computation itself. Long windows still do not guarantee that models use everything in them.

## Why it matters
Context windows grew from a few thousand to a million tokens or more, which changed what applications can do: whole codebases, long contracts and hours of transcripts in one prompt. Engineers need to know what makes this affordable, what it costs, and why models still miss information in long inputs.

## Intuition
Naive attention is writing out a full multiplication table before reading one row of it. FlashAttention computes the table a few blocks at a time, uses each block immediately and throws it away, keeping only running totals.

```viz
{"id":"flash-tiling","component":"stepper","title":"FlashAttention walks through the score matrix in tiles, never storing it whole","caption":"An illustrative 4 × 4 grid of query and key blocks. 0 means not yet computed, 1 the tile in fast on-chip memory now, 2 done and discarded. Causal masking skips tiles above the diagonal.","alt":"Stepper showing tiles of the attention score matrix being computed in blocks with online softmax, never materializing the full matrix.","data":"illustrative","frames":[
{"label":"Start","caption":"Queries and keys are split into blocks that fit in on-chip SRAM. Nothing is computed yet.","matrix":{"rows":["Q block 1","Q block 2","Q block 3","Q block 4"],"cols":["K1","K2","K3","K4"],"values":[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],"min":0,"max":2}},
{"label":"Row 1","caption":"Query block 1 meets key block 1: scores are computed in SRAM, used to update a running softmax and output, then discarded. Causal masking means later key blocks are skipped for this row.","matrix":{"rows":["Q block 1","Q block 2","Q block 3","Q block 4"],"cols":["K1","K2","K3","K4"],"values":[[1,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],"min":0,"max":2}},
{"label":"Row 3","caption":"Query block 3 streams through key blocks 1 to 3, keeping only a running maximum, sum and output.","matrix":{"rows":["Q block 1","Q block 2","Q block 3","Q block 4"],"cols":["K1","K2","K3","K4"],"values":[[2,0,0,0],[2,2,0,0],[2,2,1,0],[0,0,0,0]],"min":0,"max":2}},
{"label":"Done","caption":"All lower-triangle tiles are processed. The full N × N matrix never existed in memory; the output is exactly the same as standard attention.","matrix":{"rows":["Q block 1","Q block 2","Q block 3","Q block 4"],"cols":["K1","K2","K3","K4"],"values":[[2,0,0,0],[2,2,0,0],[2,2,2,0],[2,2,2,2]],"min":0,"max":2}}]}
```

## How it works
**The quadratic cost.** Attention computes an N × N score matrix per head per layer. Storing it naively takes memory proportional to N², which becomes impossible at long contexts:

```viz
{"id":"attention-memory","component":"chart","type":"line","title":"A naive score matrix for one head reaches terabytes at a million tokens; FlashAttention’s working set grows linearly","caption":"Formula view per head per layer in 16-bit precision: naive N² × 2 bytes versus an output-sized buffer of N × 128 × 2 bytes. Compute is still quadratic in both.","alt":"Log-log line chart of attention memory against sequence length for naive attention and FlashAttention.","data":"formula","x":{"label":"Sequence length (tokens, log scale)","log":true},"y":{"label":"Memory per head per layer","unit":"bytes","log":true},"series":[{"name":"Naive score matrix","points":[[4096,33554432],[8192,134217728],[32768,2147483648],[131072,34359738368],[1048576,2199023255552]]},{"name":"FlashAttention working set","points":[[4096,1048576],[8192,2097152],[32768,8388608],[131072,33554432],[1048576,268435456]]}]}
```

**FlashAttention.** Dao et al. (2022) tile the computation to keep data in fast on-chip memory and use an online softmax, cutting memory traffic and memory use without approximation. FlashAttention-2 (2023), FlashAttention-3 (2024, for Hopper GPUs) and FlashAttention-4 (2026, for Blackwell GPUs) improved parallelism, low-precision support and hardware-specific pipelining.

**Changing the computation.** Sliding-window attention lets each token attend only to recent tokens (used in some Mistral models, in Gemma 3 and in many hybrids, often alternating with full-attention layers); sparse patterns (Longformer, BigBird) attend to selected tokens; linear attention and state-space models replace attention with recurrent states. See [beyond the transformer](#beyond-transformers).

**Distributing long sequences.** Ring attention (Liu et al., 2023) and context parallelism split sequences across devices.

**The KV cache is the other limit.** At inference, every token’s keys and values are kept; at long contexts this dominates memory. See [the KV cache](#kv-cache) and [memory math](#memory-math).

**Using long context well.** Models often recall information at the start and end of long inputs better than in the middle (“Lost in the Middle”, Liu et al., 2023). Needle-in-a-haystack tests are easy; benchmarks such as RULER (Hsieh et al., 2024) test harder multi-fact and aggregation tasks where effective context is shorter than advertised.

## In practice
- Test your own tasks at the lengths you plan to use; effective context is task-specific.
- Put instructions and the question where the model’s guide recommends, often after long documents. See [model-specific notes](#model-specific-notes).
- Compare long context with retrieval on cost, latency and accuracy; often the best answer is both. See [RAG fundamentals](#rag-fundamentals).
- Use prompt caching for long, repeated prefixes. See [prompt caching](#prompt-caching).

## Numbers to know
> [!number]
> Formulas. Naive attention score memory per head ≈ N² × bytes; FlashAttention keeps working memory proportional to N. Attention compute still grows with N², which dominates prefill at very long contexts.

## Pitfalls and anti-patterns
> [!pitfall] Treating the context window as working memory of perfect quality
> A million-token window that fails to find a fact in the middle is not a million tokens of usable context for your task.

- **Ignoring prefill cost.** Long prompts make time to first token large.
- **Testing only with needles.** Real tasks need aggregation and reasoning across the context.

## Talk like an expert
The vocabulary: **quadratic attention**, **FlashAttention**, **online softmax**, **IO-aware**, **sliding window**, **sparse attention**, **ring attention**, **lost in the middle**, **effective context**. Experts quote effective context on a task, not window size. The live debate is whether retrieval or ever-longer context wins for most applications; in practice they combine.

> [!hottake] Long context makes most RAG pipelines unnecessary.
> **The counterargument:** retrieval is still cheaper, faster, easier to cite and permission-filter, and scales to corpora far larger than any window.

## Check yourself
```quiz
long-context
```

## Go deeper
- Dao et al., “FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness” (2022).
- Liu et al., “Lost in the Middle: How Language Models Use Long Contexts” (2023).
- Hsieh et al., “RULER: What’s the Real Context Size of Your Long-Context Language Models?” (2024).

## Related
- [Attention step by step](#attention)
- [The KV cache](#kv-cache)
- [Embeddings and position](#positional-encoding)
- [Context engineering](#context-engineering)
- [Beyond the transformer](#beyond-transformers)
