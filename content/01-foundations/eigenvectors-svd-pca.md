---
id: eigenvectors-svd-pca
book: 1
order: "1.1.2"
title: Eigenvectors, SVD and PCA
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [linear-algebra, svd, pca, eigenvectors, low-rank]
visuals: []
prerequisites: [linear-algebra]
---
> [!tldr]
> Eigenvectors are the directions a matrix only stretches; the singular value decomposition (SVD) writes any matrix as a rotation, a scaling and another rotation (where a "rotation" may also include a reflection); principal component analysis (PCA) keeps the directions in which data varies most. These ideas explain low-rank adapters, weight compression, rotations in quantization and the curvature of a loss surface. The one thing to remember: cutting the SVD after the top k singular values gives the best possible rank-k approximation, so how fast the singular values fall tells you how compressible a matrix is.

## Key ideas

- **Rank, orthogonality and projections.** The rank of a matrix is "the largest number of linearly independent columns", dependent columns mean the map squashes space into fewer dimensions and cannot be undone, and a square matrix is invertible exactly when its determinant is nonzero ([*Dive into Deep Learning*, section 22.1](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/geometry-linear-algebraic-ops.html)). An orthogonal matrix has orthonormal columns, so its inverse is its transpose and it preserves lengths and angles, and projecting b onto the span of A's columns gives the least-squares solution of an unsolvable system Ax = b ([Deisenroth et al., *Mathematics for Machine Learning* (2020), sections 3.4 and 3.8](https://mml-book.github.io/)).
- **Eigenvectors and symmetric matrices.** An eigenvector v of A satisfies Av = λv; a symmetric matrix has real eigenvalues and orthogonal eigenvectors, so it factors as A = WΣWᵀ, and repeated multiplication by a matrix is governed mainly by its largest eigenvalue, which is why the scale of random weight matrices matters at initialization ([*Dive into Deep Learning*, section 22.2](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/eigendecomposition.html)).
- **SVD and the Eckart-Young theorem.** Every m × n matrix factors as A = UΣVᵀ, with orthogonal U and V and the singular values on the diagonal of Σ. Keeping the top k singular values gives the best rank-k approximation in the spectral norm, with an error of exactly the (k + 1)-th singular value ([Deisenroth et al., *Mathematics for Machine Learning* (2020), theorems 4.22 and 4.25](https://mml-book.github.io/book/mml-book.pdf)).
- **Norms, conditioning and curvature.** The Frobenius norm is the square root of the sum of a matrix's squared entries ([*Dive into Deep Learning*, section 2.3.11](https://d2l.ai/chapter_preliminaries/linear-algebra.html)); the spectral norm is its largest singular value, and the condition number, the ratio of the largest to the smallest singular value, measures the most curved direction against the least curved one: badly conditioned problems are long, thin valleys where gradient descent converges slowly ([Deisenroth et al. (2020), theorem 4.24 and section 7.1.1](https://mml-book.github.io/book/mml-book.pdf)). For neural networks, the eigenvalues of the loss Hessian measure curvature, and during full-batch gradient descent the largest one typically hovers just above 2 divided by the step size ([Cohen et al., “Gradient Descent on Neural Networks Typically Occurs at the Edge of Stability” (2021)](https://arxiv.org/abs/2103.00065)).
- **PCA.** PCA projects centered data onto the eigenvectors of its covariance matrix with the largest eigenvalues, which keeps the most variance and minimizes the squared reconstruction error; by Eckart-Young, the same answer comes from truncating the SVD of the data matrix ([Deisenroth et al. (2020), chapter 10](https://mml-book.github.io/book/mml-book.pdf)). PCA is linear; nonlinear maps such as t-SNE and UMAP belong to [clustering and dimensionality reduction](#clustering-dimensionality-reduction).
- **Low rank and rotations inside LLMs.** LoRA freezes pretrained weights and trains low-rank decomposition matrices, and its study of rank-deficiency in adaptation helps explain why that works ([Hu et al., “LoRA: Low-Rank Adaptation of Large Language Models” (2021)](https://arxiv.org/abs/2106.09685)), and SVD-LLM compresses weights by truncating singular values ([Wang et al., “SVD-LLM: Truncation-aware Singular Value Decomposition for Large Language Model Compression” (2024)](https://arxiv.org/abs/2403.07378)). QuaRot rotates the model with randomized Hadamard transformations, which are orthogonal and are fused into the weight matrices, so outliers disappear from the hidden state before 4-bit quantization and the output does not change ([Ashkboos et al., “QuaRot: Outlier-Free 4-Bit Inference in Rotated LLMs” (2024)](https://arxiv.org/abs/2404.00456)). The Muon optimizer replaces each momentum update with UVᵀ from its SVD, the nearest semi-orthogonal matrix, and approximates it with a Newton-Schulz iteration instead of computing the SVD ([Jordan et al., “Muon: An optimizer for hidden layers in neural networks” (2024)](https://kellerjordan.github.io/posts/muon/)).

## Planned visuals

- **`stepper`: SVD as rotate, scale, rotate.** A unit circle of 2D vectors goes through Vᵀ (a rotation), Σ (stretching along the axes) and U (another rotation) and ends as the ellipse that A makes; the eigenvectors of a symmetric matrix appear as the directions that never turn.
- **`explorer`: low-rank approximation.** A slider for k rebuilds a matrix (an image or a weight-update heatmap) from its top k singular values and redraws the error, which equals the next singular value in the spectral norm. This needs a new explorer model.
- **`embedding-map`: PCA on a point cloud.** A 2D cloud of points with its principal axes drawn; dragging points moves the axes, and a toggle shows the projection onto the first component.

## Talk like an expert

Experts ask how fast the singular values decay, what the effective rank is, and how well conditioned a problem is. They treat "low rank" (cheap to store and to adapt) and "orthogonal" (preserves lengths, so it can be inserted for free) as the two workhorse properties behind adapters, compression and quantization tricks.

## Go deeper

- Deisenroth, Faisal and Ong, [*Mathematics for Machine Learning*](https://mml-book.github.io/) (Cambridge University Press, 2020): chapters 2 to 4 and chapter 10, free as a PDF.
- [*Dive into Deep Learning*, section 22.2, Eigendecompositions](https://d2l.ai/chapter_appendix-mathematics-for-deep-learning/eigendecomposition.html).
- Hu et al., [“LoRA: Low-Rank Adaptation of Large Language Models”](https://arxiv.org/abs/2106.09685) (2021).
- Ashkboos et al., [“QuaRot: Outlier-Free 4-Bit Inference in Rotated LLMs”](https://arxiv.org/abs/2404.00456) (2024).

## Related

- [Linear algebra for AI](#linear-algebra)
- [Clustering and dimensionality reduction](#clustering-dimensionality-reduction)
- [Parameter-efficient fine-tuning methods](#peft-methods)
- [Quantization](#quantization)
- [Optimizers in depth](#optimizers)
