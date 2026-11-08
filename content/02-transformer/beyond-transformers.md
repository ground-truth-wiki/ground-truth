---
id: beyond-transformers
book: 2
order: "2.9"
title: Beyond the transformer
level: frontier
stability: moving
reviewed: "2026-11"
status: full
tags: [ssm, mamba, diffusion-lm, hybrid]
visuals:
  - arch-family-tree:tree
  - state-vs-kv:chart
---
> [!tldr]
> Alternatives to attention promise linear-time processing and fixed memory per sequence: state-space models such as Mamba, linear-attention and recurrent models such as RWKV and RetNet, and hybrids that mix them with attention layers. Diffusion language models generate many tokens in parallel. Transformers still dominate, increasingly as hybrids.

## Why it matters
Attention’s cost at long contexts drives research into architectures that remember with a fixed-size state. Some already ship in production models as hybrids. Knowing their trade-offs helps you read announcements, choose models for long-context or edge workloads, and anticipate where efficiency gains will come from.

## Intuition
A transformer keeps a complete transcript of the conversation and rereads it for every word. A recurrent or state-space model keeps a running summary of fixed size and updates it with each word: far cheaper, but the summary can forget details.

```viz
{"id":"arch-family-tree","component":"tree","title":"Four families of alternatives, and the hybrids that combine them with attention","caption":"Expand a family for representative models and trade-offs. Dates are first publication.","alt":"Tree of non-transformer and hybrid architectures: state-space models, linear attention and RNNs, hybrids, and diffusion language models.","data":"illustrative","open":1,"root":{"label":"Beyond pure attention","children":[
{"label":"State-space models","children":[{"label":"S4 (2021), Mamba (2023) and Mamba-2 (2024): selective state updates, linear time, fixed state. Weaker at exact recall from far back."}]},
{"label":"Linear attention and modern RNNs","children":[{"label":"RetNet (2023), RWKV and others: recurrent forms of attention, fast inference, training in parallel."}]},
{"label":"Hybrids","children":[{"label":"Mostly recurrent or sliding-window layers plus a few full-attention layers, such as Jamba (2024): long context at lower cost while keeping recall.","link":"#long-context"}]},
{"label":"Diffusion language models","children":[{"label":"Generate and refine many tokens in parallel, such as LLaDA and commercial diffusion models (2025): fast generation, different quality trade-offs.","link":"#image-generation"}]},
{"label":"Memory-augmented","children":[{"label":"Models that learn to write to long-term memory at test time, such as Titans (2025): an active research area."}]}]}}
```

## How it works
**State-space models.** S4 (Gu et al., 2021) adapted continuous state-space systems to sequence modeling; Mamba (Gu and Dao, 2023) made the state updates input-dependent (“selective”), matching transformers on many language tasks at small to medium scale with linear-time processing and constant memory per sequence.

**Linear attention and recurrence.** Reformulating attention without the softmax allows a recurrent form with fixed state; RWKV and RetNet are examples that train in parallel and infer recurrently.

**Hybrids.** Combining many cheap layers (state-space, linear or sliding-window attention) with a few full-attention layers keeps most of the efficiency while restoring precise recall. Several production models use such mixes.

**Memory per sequence.**

```viz
{"id":"state-vs-kv","component":"chart","type":"line","title":"A transformer’s KV cache grows with every token; a state-space model’s state stays the same size","caption":"Illustrative: KV cache for an 8B-class transformer with grouped-query attention (128 KiB per token) versus a fixed recurrent state of roughly tens of megabytes. Exact state sizes vary by architecture.","alt":"Illustrative log-log line chart of memory per sequence against context length for a transformer KV cache and a fixed state-space model state.","data":"illustrative","x":{"label":"Context length (tokens, log scale)","log":true},"y":{"label":"Memory per sequence","unit":"GB","log":true},"series":[{"name":"Transformer KV cache","points":[[1024,0.134],[8192,1.07],[32768,4.3],[131072,17.2],[1048576,137]]},{"name":"Recurrent or SSM state","points":[[1024,0.02],[8192,0.02],[32768,0.02],[131072,0.02],[1048576,0.02]]}]}
```

**Diffusion language models.** Instead of generating left to right, they start from masked or noisy sequences and refine many positions at once over several steps, trading per-token quality for parallel speed. See [image generation](#image-generation) for the diffusion idea.

**Why transformers persist.** Exact retrieval from context (copying, looking up a fact from far back) is hard for fixed-size states; the transformer ecosystem (kernels, serving engines, training recipes) is mature; and attention keeps scaling well.

## In practice
- Evaluate hybrids for long-context, high-throughput or edge workloads where KV memory dominates.
- Test exact-recall tasks specifically; they are where pure recurrent models struggle.
- Check serving-engine support before choosing an unusual architecture. See [serving engines](#serving-engines).

## Numbers to know
> [!number]
> Rules of thumb. Transformer KV memory grows linearly with context; recurrent state does not. Hybrids commonly use a small fraction of full-attention layers to recover recall.

## Pitfalls and anti-patterns
> [!pitfall] Judging new architectures by perplexity alone
> Similar perplexity can hide large gaps on recall, in-context learning and long-range reasoning.

- **Ignoring tooling.** An efficient architecture without fast kernels and engine support is slow in practice.

## Talk like an expert
The vocabulary: **state-space model**, **selective scan**, **linear attention**, **recurrent inference**, **hybrid architecture**, **sliding window**, **diffusion language model**, **associative recall**. Experts ask how a new architecture does on recall-heavy tasks and how it serves. The live debate is whether hybrids are a stepping stone to a new dominant architecture or a lasting compromise.

> [!hottake] The next dominant architecture will be a hybrid with only a few attention layers.
> **The counterargument:** attention keeps improving through kernels, sparsity and hardware, and the ecosystem’s momentum makes replacing it costly; pure transformers may simply keep winning at the frontier.

## Check yourself
```quiz
beyond-transformers
```

## Go deeper
- Gu and Dao, “Mamba: Linear-Time Sequence Modeling with Selective State Spaces” (2023); Dao and Gu, “Transformers are SSMs” (2024), the Mamba-2 paper.
- Peng et al., “RWKV: Reinventing RNNs for the Transformer Era” (2023).
- Lieber et al., “Jamba: A Hybrid Transformer-Mamba Language Model” (2024).

## Related
- [Efficient attention and long context](#long-context)
- [New architectures and efficiency](#new-architectures)
- [The transformer block](#transformer-block)
- [The KV cache](#kv-cache)
- [Image generation](#image-generation)
- [Recurrent networks, LSTMs and sequence-to-sequence models](#recurrent-networks)
- [Latent reasoning and recurrent depth](#latent-reasoning)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Linear attention and hybrid models](#linear-attention-hybrids)
