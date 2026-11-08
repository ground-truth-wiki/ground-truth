---
id: positional-encoding
book: 2
order: "2.2"
title: Embeddings and position
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [rope, position, context-extension]
visuals:
  - rope-wavelengths:chart
  - abs-vs-rel:compare
---
> [!tldr]
> Transformers need position information because attention by itself ignores order. Modern models use rotary position embeddings (RoPE), which rotate query and key vectors by angles proportional to position, so attention depends on relative distance. Context extension methods stretch those rotations to longer sequences.

## Why it matters
Position encoding decides how well a model handles long contexts and whether it can be extended beyond its training length. Context-window announcements, “128K” and “1M” models, and long-context quality problems all trace back to these choices.

## Intuition
RoPE is a set of clock hands of different speeds. Each pair of dimensions in a query or key turns at its own rate as position increases. Comparing two tokens’ hands tells you how far apart they are: fast hands resolve nearby distances, slow hands distinguish far ones.

```viz
{"id":"rope-wavelengths","component":"chart","type":"line","title":"RoPE’s dimension pairs turn at speeds spanning four orders of magnitude","caption":"Formula view: wavelength in tokens of each dimension pair, 2π × base^(2i/d), for head dimension d = 128 and base 10,000. Fast pairs track nearby positions; slow pairs track long distances.","alt":"Line chart of RoPE wavelength against dimension-pair index on a log scale, from about 6 tokens to about 54,000 tokens.","data":"formula","x":{"label":"Dimension pair index i"},"y":{"label":"Wavelength (tokens, log scale)","log":true},"series":[{"name":"Wavelength","points":[[0,6.28],[16,62.8],[32,628],[48,6283],[63,54400]]}]}
```

## How it works
**Token embeddings.** Each token id maps to a learned vector; these vectors are the input to the first layer. Output layers often share (tie) the same matrix.

**Absolute positions.** The original transformer added fixed sinusoidal vectors to embeddings (Vaswani et al., 2017); other models learned a vector per position. Both struggle beyond the trained length.

**Relative positions.** RoPE (Su et al., 2021) rotates each pair of query and key dimensions by an angle proportional to position, so their dot product depends only on the distance between tokens. ALiBi (Press et al., 2021) instead adds a distance-proportional penalty to attention scores.

```viz
{"id":"abs-vs-rel","component":"compare","title":"Absolute positions tell each token where it is; relative ones tell attention how far apart two tokens are","caption":"Simplified. Hover the marks.","alt":"Comparison of absolute position embeddings added to inputs and rotary embeddings applied to queries and keys.","data":"illustrative","mono":false,"a":{"title":"Absolute (sinusoidal or learned)","text":"Add a position vector to each token embedding once, at the input. Attention must infer distances from those vectors. Positions beyond the trained length were never seen.","mono":false},"b":{"title":"Relative (RoPE)","text":"Rotate queries and keys in every attention layer by angles set by position. The score between two tokens depends on their distance, not their absolute positions, which helps generalization and enables context extension.","mono":false},"links":[{"a":"Add a position vector to each token embedding once, at the input.","b":"Rotate queries and keys in every attention layer","note":"RoPE applies position inside attention, where it is used."},{"a":"Positions beyond the trained length were never seen.","b":"enables context extension","note":"Rescaling rotations lets models run beyond their training length."}]}
```

**Extending context.** Position Interpolation (Chen et al., 2023) squeezes longer sequences into the trained range of angles; NTK-aware scaling and YaRN (Peng et al., 2023) rescale frequencies unevenly, preserving fast dimensions for local detail. A short continued training on long documents usually follows. See [long context](#long-context) and [mid-training](#mid-training).

## In practice
- Treat advertised context length as a capacity, not a guarantee of quality at that length; test with your tasks. See [long context](#long-context).
- When serving open models at extended lengths, use the scaling method and parameters the model was trained with.
- Expect quality to degrade toward the end of extended windows; place key information where the model uses it best.

## Numbers to know
> [!number]
> Formula. RoPE angle for dimension pair i at position p: p × base^(−2i/d), with base 10,000 in the original paper; long-context models often use larger bases. Wavelengths range from about 6 tokens to tens of thousands.

## Pitfalls and anti-patterns
> [!pitfall] Changing RoPE settings at inference without the matching training
> Mismatched scaling parameters degrade quality silently; use the configuration the model was trained or fine-tuned with.

- **Equating window size with usable context.** Retrieval within the window still varies by position.

## Talk like an expert
The vocabulary: **token embedding**, **tied embeddings**, **sinusoidal**, **learned absolute**, **RoPE**, **ALiBi**, **rope base**, **position interpolation**, **YaRN**. Experts ask how a model’s context was extended and tested. The live debate is whether position encoding remains necessary at all, since some models train with no explicit position signal and rely on causal masking.

> [!hottake] Most long-context failures are retrieval-within-context failures, not position-encoding failures.
> **The counterargument:** poorly extended position encodings do cause measurable degradation at long range, which is why careful scaling and long-document training matter.

## Check yourself
```quiz
positional-encoding
```

## Go deeper
- Su et al., “RoFormer: Enhanced Transformer with Rotary Position Embedding” (2021).
- Press et al., “Train Short, Test Long” (2021), the ALiBi paper.
- Peng et al., “YaRN: Efficient Context Window Extension of Large Language Models” (2023).

## Related
- [Attention step by step](#attention)
- [Efficient attention and long context](#long-context)
- [Tokenization](#tokenization)
- [Mid-training](#mid-training)
- [Linear algebra for AI](#linear-algebra)
- [Word embeddings: from word2vec to contextual representations](#word-embeddings)
- [Long-context extension during training](#long-context-training)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [RoPE scaling and context extension](#rope-scaling)
