---
id: tensors-and-shapes
book: 1
order: "1.1.1"
title: Tensors, shapes and broadcasting
level: foundation
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [tensors, shapes, broadcasting, einsum, math]
visuals: []
prerequisites: [linear-algebra]
---
> [!tldr]
> A tensor is an array of numbers with a fixed number of axes: a scalar has none, a vector one, a matrix two, and the attention scores of a batch four. Shapes decide whether model code is correct and what it costs in memory and compute. The one thing to remember: write the shape next to every tensor, because broadcasting can turn a shape mistake into a wrong answer instead of an error.

## Key ideas

- **Order, shape and size.** A tensor is "a (possibly multidimensional) array of numerical values": one axis makes a vector, two make a matrix, and beyond that we speak of a k-th-order tensor; its shape is the length along each axis ([*Dive into Deep Learning*, section 2.1](https://d2l.ai/chapter_preliminaries/ndarray.html)). Its size is the total number of scalars it holds, and "rank" in the tensor sense means the number of dimensions, so a matrix has rank 2 ([Google Machine Learning Glossary](https://developers.google.com/machine-learning/glossary)). That is a different idea from the rank of a matrix in linear algebra, the largest number of linearly independent columns ([*Dive into Deep Learning*, section 22.1](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/geometry-linear-algebraic-ops.html)).
- **Transformer shapes, and costs read from them.** Activations carry a few named axes: batch B, sequence length T, model width D, query heads N, key-value heads K and head dimension H, so the input to a block is [B, T, D], queries are [B, T, N, H] and keys are [B, S, K, H], where S is the key sequence length. A matrix product of [m, k] by [k, n] costs 2mkn floating-point operations, and in general twice the product of all dimensions with batch and contraction axes counted once ([Austin et al., “All the Transformer Math You Need to Know” (2025)](https://jax-ml.github.io/scaling-book/transformers/)).
- **Element-wise operations and reductions.** Element-wise operations apply a scalar operation to each element; the element-wise product of two same-shaped matrices is the Hadamard product, written ⊙, and is not the matrix product. A reduction such as a sum removes the axis it runs over unless you pass `keepdims=True`, which keeps the shape compatible for dividing back, for example to make each row sum to 1 ([*Dive into Deep Learning*, section 2.3](https://d2l.ai/chapter_preliminaries/linear-algebra.html)).
- **Broadcasting, and its silent bugs.** Shapes are compared from the trailing axis leftward, two axes are compatible when they are equal or one of them is 1, and missing axes count as 1; NumPy does this without making needless copies of the data ([NumPy broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html)). The same rule means `torch.add(torch.ones(4, 1), torch.randn(4))` returns a [4, 4] tensor, not an error, which is how a missing axis can quietly corrupt a loss or a mask ([PyTorch broadcasting semantics](https://docs.pytorch.org/docs/2.15/notes/broadcasting.html)).
- **Einsum and einops.** Einsum names each axis with a letter; letters that appear in the inputs but not in the output are summed, so `'bij,bjk->bik'` is batched matrix multiplication, and unscaled attention scores are `einsum('bhqd,bhkd->bhqk', q, k)` ([torch.einsum](https://docs.pytorch.org/docs/2.15/generated/torch.einsum.html)). Einops applies the same idea to reshaping, with patterns such as `rearrange(x, 't b c -> b c t')` ([einops documentation](https://einops.rocks/)), to make tensor code easier to read and check ([Rogozhnikov, “Einops: Clear and Reliable Tensor Manipulations with Einstein-like Notation” (2022)](https://iclr.cc/virtual/2022/poster/6602)).
- **Views, strides, dtype and device.** `view()`, `transpose()` and `permute()` return views that share memory with their base, a view of a contiguous tensor can be non-contiguous, and `reshape()` may return either a view or a copy ([PyTorch tensor views](https://docs.pytorch.org/docs/2.15/tensor_view.html)). Strides give the jump in memory per axis (a 2 × 5 tensor has strides (5, 1), its transpose (1, 5)), mixed dtypes follow promotion rules, and tensors are never moved between devices automatically, except zero-dimensional (scalar) tensors, which PyTorch copies from CPU to GPU when needed ([PyTorch tensor attributes](https://docs.pytorch.org/docs/2.15/tensor_attributes.html)).

## Planned visuals

- **`stepper`: broadcasting step by step.** Align two shapes at the trailing axis, stretch every axis of size 1, then apply the operation; a second run shows a (4,) vector meeting a (4, 1) column and producing a (4, 4) result.
- **`code-walk`: multi-head attention in einsum.** Each line of an einsum implementation lights up the shape it produces: [B, T, D] in, queries split into heads, [B, N, T, S] scores, softmax over the key axis, weighted values, and the heads merged back to [B, T, D].
- **`calculator`: memory and FLOPs from shapes.** Inputs B, T, D and bytes per element; outputs the activation memory of one [B, T, D] tensor and the FLOPs of one projection, using size × bytes and 2mkn.

## Talk like an expert

Experts talk in shapes ("B T D in, B N T S scores"), separate batch axes from contraction axes, and ask "where does this broadcast?" before trusting a result. They read a model config as a list of tensor shapes and estimate memory and FLOPs from it before running anything.

## Go deeper

- [*Dive into Deep Learning*, section 2.1, Data manipulation](https://d2l.ai/chapter_preliminaries/ndarray.html), and [section 2.3, Linear algebra](https://d2l.ai/chapter_preliminaries/linear-algebra.html).
- [NumPy user guide: Broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html).
- Rogozhnikov, [“Einops: Clear and Reliable Tensor Manipulations with Einstein-like Notation”](https://iclr.cc/virtual/2022/poster/6602) (ICLR 2022), with the [einops documentation](https://einops.rocks/).
- Austin et al., [“All the Transformer Math You Need to Know”](https://jax-ml.github.io/scaling-book/transformers/), part 4 of *How To Scale Your Model* (2025).

## Related

- [Linear algebra for AI](#linear-algebra)
- [Attention step by step](#attention)
- [The transformer block](#transformer-block)
- [Deep learning frameworks: PyTorch, JAX and Keras](#dl-frameworks)
- [Memory math](#memory-math)
