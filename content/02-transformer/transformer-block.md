---
id: transformer-block
book: 2
order: "2.4"
title: The transformer block
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [transformer, ffn, residual, parameters]
visuals:
  - block-diagram:diagram
  - param-counter:calculator
---
> [!tldr]
> A decoder-only transformer stacks identical blocks, each with self-attention and a feed-forward network, wrapped in residual connections and normalization. Modern blocks use pre-normalization with RMSNorm, gated feed-forward layers such as SwiGLU, and grouped-query attention. Parameter count is roughly 12 × layers × width², plus embeddings.

## Why it matters
Every modern language model is a variation on this block. Knowing its parts lets you estimate parameters, memory and compute from a config file, read architecture papers quickly, and understand what fine-tuning methods such as LoRA actually modify.

## Intuition
Each block is a meeting followed by private study. In attention, every token listens to the others and gathers what is relevant; in the feed-forward layer, each token thinks on its own with what it gathered. The residual stream is the shared notebook everyone writes into.

```viz
{"id":"block-diagram","component":"diagram","title":"One transformer block: normalize, attend, add; normalize, think, add","caption":"A pre-norm decoder block. The residual stream runs straight through; each sublayer reads from it and adds its result back. Click a part for its chapter.","alt":"Diagram of a pre-norm transformer block with RMSNorm, self-attention, a residual add, a second RMSNorm, a feed-forward network and another residual add.","data":"illustrative","w":600,"h":150,"nodes":[
{"id":"in","label":"Residual stream","role":"context","x":0,"y":47,"w":110,"h":56},
{"id":"n1","label":"RMSNorm","x":135,"y":0,"w":90,"h":44},
{"id":"att","label":"Self-attention","sub":"GQA, RoPE","role":"model","x":245,"y":0,"w":120,"h":44,"link":"#attention"},
{"id":"n2","label":"RMSNorm","x":135,"y":106,"w":90,"h":44},
{"id":"ffn","label":"Feed-forward","sub":"SwiGLU or MoE","role":"model","x":245,"y":106,"w":120,"h":44,"link":"#mixture-of-experts"},
{"id":"out","label":"Residual stream","role":"context","x":490,"y":47,"w":110,"h":56}],
"edges":[{"from":"in","to":"n1"},{"from":"n1","to":"att"},{"from":"att","to":"out","label":"add"},{"from":"in","to":"n2"},{"from":"n2","to":"ffn"},{"from":"ffn","to":"out","label":"add"},{"from":"in","to":"out","style":"dashed"}]}
```

## How it works
**Self-attention.** Projects the residual stream into queries, keys and values, mixes information across positions, and projects back. Grouped-query attention shares keys and values across groups of heads to shrink the KV cache. See [attention](#attention) and [the KV cache](#kv-cache).

**Feed-forward network.** Two or three matrix multiplications per token, expanding the width (typically about 4× in total parameters) and applying a nonlinearity. Gated variants such as SwiGLU (Shazeer, 2020) work better and are now standard. In mixture-of-experts models this layer is replaced by many experts. See [mixture of experts](#mixture-of-experts).

**Residual connections and normalization.** Each sublayer adds its output to the stream, which makes deep networks trainable. Pre-norm (normalizing the input to each sublayer) is more stable than the original post-norm; RMSNorm is a cheaper variant of LayerNorm.

**Embeddings and output.** An embedding table maps tokens in; a final norm and an output projection map the last hidden state to vocabulary logits. See [tokenization](#tokenization).

**Counting parameters.** Each block has about 4d² in attention projections and about 8d² in the feed-forward layer, so about 12d² per layer, plus vocabulary × d for embeddings:

```viz
{"id":"param-counter","component":"calculator","title":"Width, depth and vocabulary predict a model’s size within a few percent","caption":"Approximation: 12 × layers × d² plus embeddings, ignoring biases and norms. Defaults reproduce GPT-2 small; set width 4,096, 32 layers, vocabulary 32,000 and untied embeddings to get about 6.7 billion, close to Llama 2 7B.","alt":"Calculator estimating transformer parameter count from model width, layers, vocabulary size and whether input and output embeddings are tied.","data":"formula","outputs":[{"id":"blocks","label":"Parameters in blocks","expr":"layers * 12 * d_model * d_model","unit":"count"},{"id":"embed","label":"Embedding parameters","expr":"vocab * d_model * (1 + untied)","unit":"count"},{"id":"total_m","label":"Total (millions)","expr":"(blocks + embed) / 1000000","unit":"count","main":true}],"inputs":{"d_model":768,"layers":12,"vocab":50257,"untied":0},"input_meta":{"d_model":{"label":"Model width d"},"layers":{"label":"Layers"},"vocab":{"label":"Vocabulary size"},"untied":{"label":"Untied output embeddings","unit":"0 = tied, 1 = untied"}},"assumptions":["Feed-forward with about 8d² parameters per layer, as in a 4× MLP or an equivalent SwiGLU.","Full multi-head attention; grouped-query attention reduces the 4d² slightly."],"tests":[{"inputs":{},"expect":{"blocks":84934656,"embed":38597376,"total_m":123.532032},"tol":0.000001},{"inputs":{"d_model":4096,"layers":32,"vocab":32000,"untied":1},"expect":{"total_m":6704.594944},"tol":0.000001}]}
```

## In practice
- Read a model’s config (hidden size, layers, heads, KV heads, intermediate size, vocabulary) to estimate parameters, memory and FLOPs. See [memory math](#memory-math).
- Know where fine-tuning adapters attach: LoRA usually targets attention and feed-forward projections. See [fine-tuning in practice](#fine-tuning-practice).
- Compute per token ≈ 2 × parameters FLOPs for a forward pass, plus attention terms for long contexts.

## Numbers to know
> [!number]
> Formulas. Parameters ≈ 12 × layers × d² + vocabulary × d. Forward FLOPs per token ≈ 2 × parameters; training ≈ 6 × parameters per token. GPT-2 small: d = 768, 12 layers, about 124 million parameters.

## Pitfalls and anti-patterns
> [!pitfall] Counting active versus total parameters wrongly
> For mixture-of-experts models, memory depends on total parameters and compute on active ones; quote both.

- **Ignoring the vocabulary.** Large vocabularies add hundreds of millions of embedding parameters to small models.

## Talk like an expert
The vocabulary: **decoder-only**, **residual stream**, **pre-norm**, **RMSNorm**, **SwiGLU**, **grouped-query attention**, **tied embeddings**, **hidden size**, **intermediate size**. Experts estimate model size and cost from a config in a minute. The live debate is which parts of the block will change next: attention replacements, deeper or wider shapes, and sparsity.

> [!hottake] The transformer block has barely changed since 2017 in its essentials.
> **The counterargument:** pre-norm, RMSNorm, SwiGLU, RoPE, GQA and MoE together changed training stability, efficiency and scale enormously; the diagram is similar, the engineering is not.

## Check yourself
```quiz
transformer-block
```

## Go deeper
- Vaswani et al., “Attention Is All You Need” (2017).
- Shazeer, “GLU Variants Improve Transformer” (2020).
- Zhang and Sennrich, “Root Mean Square Layer Normalization” (2019).

## Related
- [Attention step by step](#attention)
- [Mixture of Experts](#mixture-of-experts)
- [Memory math](#memory-math)
- [Neural networks](#neural-networks)
- [Embeddings and position](#positional-encoding)
- [Tensors, shapes and broadcasting](#tensors-and-shapes)
- [Making deep networks trainable: initialization, normalization and residuals](#trainable-deep-networks)
- [The transformer end to end](#transformer-overview)
- [Training stability: loss spikes and divergence](#training-stability)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Encoders, decoders and encoder-decoders](#encoders-and-decoders)
- [Architecture choices in modern LLMs](#architecture-choices)
