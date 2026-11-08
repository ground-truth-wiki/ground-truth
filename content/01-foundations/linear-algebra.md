---
id: linear-algebra
book: 1
order: "1.1"
title: Linear algebra for AI
level: foundation
stability: evergreen
reviewed: "2026-11"
status: full
tags: [math, vectors, svd, lora]
visuals:
  - dot-product-drag:embedding-map
  - singular-values:chart
---
> [!tldr]
> Vectors represent tokens, embeddings and activations; matrices transform them; dot products measure similarity; matrix multiplication is the core operation of every model; and low-rank structure explains why adapters such as LoRA work. A few concepts cover most of what AI engineers need.

## Why it matters
Attention scores are dot products, embeddings are compared by cosine similarity, every layer is a matrix multiplication, and LoRA, quantization and compression rely on low-rank and numerical ideas. Knowing these makes papers, memory estimates and debugging far easier.

## Intuition
A vector is an arrow; a matrix is a machine that stretches, rotates and squashes arrows; a dot product asks how much two arrows point the same way.

```viz
{"id":"dot-product-drag","component":"embedding-map","title":"The dot product rewards direction and length; cosine similarity rewards direction alone","caption":"Drag the query vector or use arrow keys. Switch metrics to see how length changes the ranking under the dot product but not under cosine. Illustrative 2D vectors.","alt":"Draggable query vector among labeled 2D vectors with nearest neighbors by cosine, dot product or Euclidean distance.","data":"illustrative","try":"Make the query long and point it between two groups; compare dot product with cosine.","k":3,"threshold":0.9,"query":{"x":0.6,"y":0.4,"label":"query"},"points":[{"label":"short, same direction","x":0.3,"y":0.2,"group":"a"},{"label":"long, same direction","x":0.9,"y":0.6,"group":"a"},{"label":"long, 45° away","x":0.2,"y":1.0,"group":"b"},{"label":"orthogonal","x":-0.4,"y":0.6,"group":"b"},{"label":"opposite","x":-0.6,"y":-0.4,"group":"c"},{"label":"slightly off","x":0.7,"y":0.2,"group":"a"}]}
```

## How it works
**Vectors and dot products.** a · b = Σ aᵢbᵢ = |a||b| cos θ. Cosine similarity divides out the lengths. Attention scores are dot products of queries and keys, scaled by √d. See [attention](#attention).

**Matrices.** A linear layer computes y = Wx. Matrix multiplication of an m × k by a k × n matrix costs about 2mkn floating-point operations, which is where the “2 FLOPs per parameter per token” rule comes from. See [the transformer block](#transformer-block).

**Norms and normalization.** Vector lengths (norms) control scale; LayerNorm and RMSNorm keep activations in a stable range.

**Rank and low-rank structure.** The rank is the number of independent directions a matrix uses. Many learned weight updates are approximately low-rank: most of their effect lies in a few directions, as the decay of singular values shows. LoRA exploits this by learning an update B × A with small inner dimension r. See [fine-tuning in practice](#fine-tuning-practice).

```viz
{"id":"singular-values","component":"chart","type":"line","title":"Most of a fine-tuning update lives in a handful of directions","caption":"Illustrative singular values of a weight update, normalized to the largest; the fast decay is why low-rank adapters capture most of the change.","alt":"Illustrative line chart of singular values decaying quickly with index on a log scale.","data":"illustrative","x":{"label":"Singular value index"},"y":{"label":"Relative size (log scale)","log":true},"series":[{"name":"Singular value","points":[[1,1],[2,0.55],[4,0.3],[8,0.14],[16,0.06],[32,0.025],[64,0.01],[128,0.004]]}]}
```

**Other useful ideas.** Eigenvectors and singular value decomposition (SVD) for analyzing transformations; orthogonality (RoPE rotations preserve lengths, see [positional encoding](#positional-encoding)); and numerical precision, since 16- and 8-bit formats limit how small and large values can be. See [quantization](#quantization).

## In practice
- Normalize embeddings before using dot-product search if you want cosine behavior.
- Estimate FLOPs and memory from matrix shapes.
- Use rank as a tuning knob for LoRA, starting small.

## Numbers to know
> [!number]
> Formulas. Dot product = |a||b| cos θ. A matrix multiply of shapes m × k and k × n costs about 2mkn FLOPs. A d × d matrix has d² parameters; a rank-r factorization has 2dr.

## Pitfalls and anti-patterns
> [!pitfall] Mixing cosine and dot-product scores
> Unnormalized vectors under dot product favor long vectors, which can mean frequent or generic content.

## Talk like an expert
The vocabulary: **vector**, **dot product**, **cosine similarity**, **matrix multiplication**, **norm**, **rank**, **low-rank**, **SVD**, **orthogonal**. Experts estimate costs from shapes and reach for low-rank approximations naturally. The live debate in this area is mostly about numerical formats: how low precision can go.

> [!hottake] You can understand most of modern AI with linear algebra and probability alone.
> **The counterargument:** optimization dynamics, systems engineering and empirical judgment matter just as much in practice, and none of them follow from the math alone.

## Check yourself
```quiz
linear-algebra
```

## Go deeper
- Strang, *Introduction to Linear Algebra*; 3Blue1Brown, *Essence of Linear Algebra* (video series).

## Related
- [Attention step by step](#attention)
- [Embeddings](#embeddings)
- [Fine-tuning in practice](#fine-tuning-practice)
- [Probability and information theory](#probability-information)
- [The transformer block](#transformer-block)
- [Parameter-efficient fine-tuning methods](#peft-methods)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Tensors, shapes and broadcasting](#tensors-and-shapes)
- [Eigenvectors, SVD and PCA](#eigenvectors-svd-pca)
- [High-dimensional geometry](#high-dimensional-geometry)
