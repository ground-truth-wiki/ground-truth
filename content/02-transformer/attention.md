---
id: attention
book: 2
order: "2.3"
title: Attention step by step
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [attention, transformer, gqa, mla]
visuals:
  - attention-stepper:stepper
  - attention-playground:explorer
  - kv-sharing:diagram
---
> [!tldr]
> Attention lets each token build its representation from a weighted mix of earlier tokens. Each token asks a question (query), every token offers a label (key) and content (value); weights come from query-key similarity, scaled, masked and normalized with softmax.

## Why it matters
Attention is the core operation of every transformer, and most of what you tune in production traces back to it: context length limits, the [KV cache](#kv-cache), long-context quality, and the cost of prefill. Knowing the mechanism at the level of matrices lets you read architecture papers, reason about memory, and explain why grouped-query attention matters to your serving bill.

## Intuition
Think of a meeting where every participant holds up a card describing what they know (the key) and has notes to share (the value). When it is your turn, you ask a question (the query), compare it with every card, and listen most to the people whose cards match. Your new understanding is a blend of their notes, weighted by how well they matched.

```viz
{"id":"attention-stepper","component":"stepper","title":"Scores, scaling, mask and softmax turn three tokens’ queries and keys into weights, then into outputs","caption":"Hand-checkable numbers with 2-dimensional heads. In the masked step, a token cannot see the future; after softmax each row sums to 1; the output is each row’s weighted average of the values.","alt":"Stepper through attention for the tokens the, cat, sat: query and key matrices, raw scores, scaled scores, causal mask, softmax weights, value matrix and outputs.","data":"formula","try":"Step to the softmax and check that “sat” puts half its weight on itself because its query matches its own key best.","frames":[
{"label":"Queries","caption":"Each token’s embedding is multiplied by a learned matrix to give its query: what it is looking for.","matrix":{"title":"Q (one row per token)","rows":["the","cat","sat"],"cols":["d1","d2"],"values":[[1,0],[0,1],[1,1]],"fmt":0}},
{"label":"Keys","caption":"A second learned matrix gives each token’s key: what it offers to be found by.","matrix":{"title":"K","rows":["the","cat","sat"],"cols":["d1","d2"],"values":[[1,0],[0,1],[1,1]],"fmt":0}},
{"label":"Scores","caption":"Every query is compared with every key by a dot product: QKᵀ. Row = the token looking, column = the token looked at.","matrix":{"title":"QKᵀ","rows":["the","cat","sat"],"cols":["the","cat","sat"],"values":[[1,0,1],[0,1,1],[1,1,2]],"fmt":0}},
{"label":"Scale","caption":"Divide by √dₖ, here √2. Without scaling, large dimensions produce huge scores and softmax saturates.","matrix":{"title":"QKᵀ ÷ √2","rows":["the","cat","sat"],"cols":["the","cat","sat"],"values":[[0.71,0,0.71],[0,0.71,0.71],[0.71,0.71,1.41]]}},
{"label":"Mask","caption":"In a decoder, a token may not attend to tokens after it. Future positions are set to minus infinity.","matrix":{"title":"Causal mask applied","rows":["the","cat","sat"],"cols":["the","cat","sat"],"values":[[0.71,"-inf","-inf"],[0,0.71,"-inf"],[0.71,0.71,1.41]]}},
{"label":"Softmax","caption":"Softmax per row turns scores into weights that sum to 1. Minus infinity becomes exactly 0.","matrix":{"title":"Attention weights","rows":["the","cat","sat"],"cols":["the","cat","sat"],"values":[[1,0,0],[0.33,0.67,0],[0.25,0.25,0.5]],"min":0,"max":1}},
{"label":"Values","caption":"A third learned matrix gives each token’s value: the content it contributes when attended to.","matrix":{"title":"V","rows":["the","cat","sat"],"cols":["d1","d2"],"values":[[1,0],[0,2],[2,2]],"fmt":0}},
{"label":"Output","caption":"Each output row is the weighted average of value rows. “cat” gets 0.33 × [1, 0] + 0.67 × [0, 2] = [0.33, 1.34].","matrix":{"title":"Weights × V","rows":["the","cat","sat"],"cols":["d1","d2"],"values":[[1,0],[0.33,1.34],[1.26,1.5]]}}]}
```

## How it works
For a sequence of n tokens with model width d, each layer computes three projections of the input X: queries Q = XW_Q, keys K = XW_K and values V = XW_V. Scaled dot-product attention is then:

```math
\mathrm{Attention}(Q,K,V) = \mathrm{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}} + M\right)V
```

where M is the mask: 0 where attention is allowed and −∞ where it is not. In a decoder-only model the mask is causal, so token i sees only tokens 1 to i.

**Multi-head attention.** Instead of one big attention, the model runs h smaller ones in parallel, each with its own projections and head dimension dₖ = d / h, then concatenates and projects the results. Different heads learn different patterns: some track the previous token, some track syntax, some copy repeated sequences (the induction heads described by Olsson et al., 2022).

**Cost.** The score matrix is n × n per head, so compute grows with the square of sequence length during prefill. During generation, the new token attends to all cached keys and values, so each step is linear in context length. See [the KV cache](#kv-cache).

**Sharing keys and values.** Generation must keep every past key and value in memory, so architectures reduce how many there are:

- **Multi-query attention** (MQA, Shazeer, 2019): all query heads share one key and one value head.
- **Grouped-query attention** (GQA, Ainslie et al., 2023): query heads are split into groups, each sharing one key-value head. A middle ground, and the most common choice in open models.
- **Multi-head latent attention** (MLA, introduced in DeepSeek-V2, 2024): keys and values are compressed into a small latent vector per token and expanded when needed.

```viz
{"id":"kv-sharing","component":"diagram","title":"Fewer key-value heads mean a smaller cache: eight, two, one, or one compressed latent","caption":"Switch tabs. Top row: eight query heads. Bottom row: the key-value heads they read. The cache stores only the bottom row, so it shrinks by the ratio of query heads to KV heads.","alt":"Diagram variants showing how query heads map to key-value heads in multi-head, grouped-query, multi-query and multi-head latent attention.","data":"illustrative","w":550,"h":150,"variants":[
{"name":"Multi-head (MHA)","note":"Eight query heads, eight key-value heads. Maximum flexibility, largest cache.","nodes":[{"id":"q1","label":"Q1","role":"token","x":0,"y":0,"w":60,"h":40},{"id":"q2","label":"Q2","role":"token","x":70,"y":0,"w":60,"h":40},{"id":"q3","label":"Q3","role":"token","x":140,"y":0,"w":60,"h":40},{"id":"q4","label":"Q4","role":"token","x":210,"y":0,"w":60,"h":40},{"id":"q5","label":"Q5","role":"token","x":280,"y":0,"w":60,"h":40},{"id":"q6","label":"Q6","role":"token","x":350,"y":0,"w":60,"h":40},{"id":"q7","label":"Q7","role":"token","x":420,"y":0,"w":60,"h":40},{"id":"q8","label":"Q8","role":"token","x":490,"y":0,"w":60,"h":40},{"id":"k1","label":"KV1","role":"data","align":"center","glyph":false,"x":0,"y":110,"w":60,"h":40},{"id":"k2","label":"KV2","role":"data","align":"center","glyph":false,"x":70,"y":110,"w":60,"h":40},{"id":"k3","label":"KV3","role":"data","align":"center","glyph":false,"x":140,"y":110,"w":60,"h":40},{"id":"k4","label":"KV4","role":"data","align":"center","glyph":false,"x":210,"y":110,"w":60,"h":40},{"id":"k5","label":"KV5","role":"data","align":"center","glyph":false,"x":280,"y":110,"w":60,"h":40},{"id":"k6","label":"KV6","role":"data","align":"center","glyph":false,"x":350,"y":110,"w":60,"h":40},{"id":"k7","label":"KV7","role":"data","align":"center","glyph":false,"x":420,"y":110,"w":60,"h":40},{"id":"k8","label":"KV8","role":"data","align":"center","glyph":false,"x":490,"y":110,"w":60,"h":40}],"edges":[{"from":"q1","to":"k1"},{"from":"q2","to":"k2"},{"from":"q3","to":"k3"},{"from":"q4","to":"k4"},{"from":"q5","to":"k5"},{"from":"q6","to":"k6"},{"from":"q7","to":"k7"},{"from":"q8","to":"k8"}]},
{"name":"Grouped-query (GQA)","note":"Eight query heads share two key-value heads in groups of four: a 4× smaller cache with little quality loss.","nodes":[{"id":"q1","label":"Q1","role":"token","x":0,"y":0,"w":60,"h":40},{"id":"q2","label":"Q2","role":"token","x":70,"y":0,"w":60,"h":40},{"id":"q3","label":"Q3","role":"token","x":140,"y":0,"w":60,"h":40},{"id":"q4","label":"Q4","role":"token","x":210,"y":0,"w":60,"h":40},{"id":"q5","label":"Q5","role":"token","x":280,"y":0,"w":60,"h":40},{"id":"q6","label":"Q6","role":"token","x":350,"y":0,"w":60,"h":40},{"id":"q7","label":"Q7","role":"token","x":420,"y":0,"w":60,"h":40},{"id":"q8","label":"Q8","role":"token","x":490,"y":0,"w":60,"h":40},{"id":"g1","label":"KV group 1","role":"data","align":"center","glyph":false,"x":0,"y":110,"w":270,"h":40},{"id":"g2","label":"KV group 2","role":"data","align":"center","glyph":false,"x":280,"y":110,"w":270,"h":40}],"edges":[{"from":"q1","to":"g1"},{"from":"q2","to":"g1"},{"from":"q3","to":"g1"},{"from":"q4","to":"g1"},{"from":"q5","to":"g2"},{"from":"q6","to":"g2"},{"from":"q7","to":"g2"},{"from":"q8","to":"g2"}]},
{"name":"Multi-query (MQA)","note":"All query heads share one key-value head: an 8× smaller cache here, at some cost in quality.","nodes":[{"id":"q1","label":"Q1","role":"token","x":0,"y":0,"w":60,"h":40},{"id":"q2","label":"Q2","role":"token","x":70,"y":0,"w":60,"h":40},{"id":"q3","label":"Q3","role":"token","x":140,"y":0,"w":60,"h":40},{"id":"q4","label":"Q4","role":"token","x":210,"y":0,"w":60,"h":40},{"id":"q5","label":"Q5","role":"token","x":280,"y":0,"w":60,"h":40},{"id":"q6","label":"Q6","role":"token","x":350,"y":0,"w":60,"h":40},{"id":"q7","label":"Q7","role":"token","x":420,"y":0,"w":60,"h":40},{"id":"q8","label":"Q8","role":"token","x":490,"y":0,"w":60,"h":40},{"id":"s","label":"One shared KV head","role":"data","align":"center","glyph":false,"x":0,"y":110,"w":550,"h":40}],"edges":[{"from":"q1","to":"s"},{"from":"q2","to":"s"},{"from":"q3","to":"s"},{"from":"q4","to":"s"},{"from":"q5","to":"s"},{"from":"q6","to":"s"},{"from":"q7","to":"s"},{"from":"q8","to":"s"}]},
{"name":"Latent (MLA)","note":"Keys and values are stored as one small compressed latent per token and projected back up per head when attention runs. Cache size depends on the latent width, not the head count.","nodes":[{"id":"q1","label":"Q1","role":"token","x":0,"y":0,"w":60,"h":40},{"id":"q2","label":"Q2","role":"token","x":70,"y":0,"w":60,"h":40},{"id":"q3","label":"Q3","role":"token","x":140,"y":0,"w":60,"h":40},{"id":"q4","label":"Q4","role":"token","x":210,"y":0,"w":60,"h":40},{"id":"q5","label":"Q5","role":"token","x":280,"y":0,"w":60,"h":40},{"id":"q6","label":"Q6","role":"token","x":350,"y":0,"w":60,"h":40},{"id":"q7","label":"Q7","role":"token","x":420,"y":0,"w":60,"h":40},{"id":"q8","label":"Q8","role":"token","x":490,"y":0,"w":60,"h":40},{"id":"lat","label":"Compressed latent per token, expanded per head","role":"data","align":"center","glyph":false,"x":0,"y":110,"w":550,"h":40}],"edges":[{"from":"lat","to":"q1","style":"dashed"},{"from":"lat","to":"q3","style":"dashed"},{"from":"lat","to":"q6","style":"dashed"},{"from":"lat","to":"q8","style":"dashed"}]}]}
```

**Other variants.** Sliding-window attention limits each token to a recent window; sparse attention patterns skip most pairs; and **attention sinks** (Xiao et al., 2023) are early tokens that absorb large attention weight, which matters when you evict old tokens from a cache. See [long context](#long-context).

## In practice
You rarely implement attention by hand; you choose kernels and architectures. The reference implementation is still worth knowing:

```python
import torch, math
def attention(q, k, v, causal=True):
    # q, k, v: (batch, heads, seq, head_dim)
    scores = q @ k.transpose(-2, -1) / math.sqrt(q.size(-1))
    if causal:
        n = q.size(-2)
        mask = torch.triu(torch.ones(n, n, dtype=torch.bool, device=q.device), 1)
        scores = scores.masked_fill(mask, float("-inf"))
    return torch.softmax(scores, dim=-1) @ v
```

In real code, call `torch.nn.functional.scaled_dot_product_attention`, which dispatches to fused kernels such as [FlashAttention](#long-context). Try your own sentence in the toy playground:

```viz
{"id":"attention-playground","component":"explorer","model":"attention","title":"Change the head and the sharpness, and the same sentence attends in completely different ways","caption":"Toy weights from hashed vectors, not a trained model. Each row is one token’s attention over earlier tokens and sums to 1; hatched cells are hidden by the causal mask.","alt":"Heatmap of toy attention weights for a sentence, with controls for the head type, sharpness and causal masking.","data":"illustrative","try":"Pick the attention sink head, then turn off the causal mask."}
```

## Numbers to know
> [!number]
> Rules of thumb. Head dimension is commonly 64 to 128. Prefill attention compute grows with n²; at long context it can dominate. Grouped-query attention with 8 key-value heads for 64 query heads cuts the KV cache 8× versus full multi-head attention.

## Pitfalls and anti-patterns
> [!pitfall] Assuming the window is uniformly usable
> Being able to attend to 200,000 tokens does not mean every token is attended to well. Quality varies with position and distractors. See [context engineering](#context-engineering).

- **Reading attention weights as explanations.** High weight does not prove a token caused the output; use [interpretability](#mech-interp) tools for causal claims.
- **Forgetting the mask in custom code.** A missing causal mask leaks the future and produces impossibly good training loss.
- **Ignoring KV heads when sizing memory.** Memory depends on key-value heads, not query heads.

## Talk like an expert
The vocabulary: **queries, keys and values**, **head dimension**, **causal mask**, **multi-head**, **MQA, GQA and MLA**, **induction heads**, **attention sinks**, **prefill versus decode**. Experts describe a model’s attention by its shape: layers, query heads, KV heads and head dimension, because those numbers decide its memory footprint. The live debate is whether attention will be partly replaced by linear-time alternatives; see [beyond the transformer](#beyond-transformers).

> [!hottake] Attention is mostly a memory problem now, not a compute problem.
> **The counterargument:** at long context, prefill compute still grows quadratically, and it dominates time to first token for long prompts; kernels such as FlashAttention exist because compute and memory traffic are both bottlenecks.

## Check yourself
```quiz
attention
```

## Go deeper
- Vaswani et al., “Attention Is All You Need” (2017).
- Shazeer, “Fast Transformer Decoding: One Write-Head is All You Need” (2019), on multi-query attention.
- Ainslie et al., “GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints” (2023).
- DeepSeek-AI, “DeepSeek-V2” technical report (2024), introducing multi-head latent attention.

## Related
- [The KV cache](#kv-cache)
- [The transformer block](#transformer-block)
- [Embeddings and position](#positional-encoding)
- [Efficient attention and long context](#long-context)
- [Linear algebra for AI](#linear-algebra)
- [Tensors, shapes and broadcasting](#tensors-and-shapes)
- [Recurrent networks, LSTMs and sequence-to-sequence models](#recurrent-networks)
- [The transformer end to end](#transformer-overview)
- [Sparse and local attention](#sparse-and-local-attention)
