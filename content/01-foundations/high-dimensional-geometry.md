---
id: high-dimensional-geometry
book: 1
order: "1.1.3"
title: High-dimensional geometry
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [geometry, curse-of-dimensionality, embeddings, random-projections, superposition]
visuals: []
prerequisites: [linear-algebra]
---
> [!tldr]
> In hundreds or thousands of dimensions, random vectors are almost orthogonal, distances between random points are nearly all the same, and the volume of a ball sits in a thin shell near its surface. These facts explain how embeddings can hold so many directions, why random projections preserve distances, and why nearest-neighbor search behaves strangely. The one thing to remember: intuition from two and three dimensions misleads here, so check distances on your real data.

## Key ideas

- **Concentration of measure.** When coordinates are drawn independently, for example from a Gaussian, the squared distance between two points is a sum of d independent terms, so by the law of large numbers the distances between all pairs become nearly equal; and two points drawn at random from the unit ball are nearly orthogonal, at an angle of π/2 ± O(1/√d) ([Blum, Hopcroft and Kannan, *Foundations of Data Science* (2016 draft), sections 2.2 and 2.4](https://www.cs.cornell.edu/jeh/book2016june9.pdf)).
- **Where the volume lives.** The volume of the unit ball goes to zero as the dimension grows, and what remains is concentrated near its surface and its equator; a d-dimensional standard Gaussian puts nearly all of its mass in a thin annulus at radius √d, the Gaussian Annulus Theorem ([Blum et al. (2016 draft), sections 2.3, 2.4 and 2.6](https://www.cs.cornell.edu/jeh/book2016june9.pdf)).
- **Random projections and the Johnson-Lindenstrauss lemma.** Projecting n points onto k random Gaussian directions preserves every pairwise distance within a factor of 1 ± ε, after dividing by the known scale factor √k, with high probability once k grows like ln(n) ÷ ε², and k does not depend on the original dimension at all ([Blum et al. (2016 draft), theorem 2.11](https://www.cs.cornell.edu/jeh/book2016june9.pdf)). PCA is the data-dependent alternative; see [eigenvectors, SVD and PCA](#eigenvectors-svd-pca).
- **Almost-orthogonal directions and superposition.** Only n vectors can be exactly orthogonal in n dimensions, but exponentially many can be almost orthogonal; Elhage et al. cite this, with the Johnson-Lindenstrauss lemma and compressed sensing, as reasons why a network could represent more features than it has neurons, and their toy models show that it happens when features are sparse, at the cost of some interference between them ([Elhage et al., “Toy Models of Superposition” (2022)](https://transformer-circuits.pub/2022/toy_model/index.html)).
- **The curse of dimensionality and hubness.** Distance concentration undermines the meaning of "nearest", and a related effect, hubness, makes a few points appear in the k-nearest-neighbor lists of far more points than the rest; the same study finds that hubness tracks a data set's intrinsic dimensionality rather than its number of coordinates ([Radovanović et al., “Hubs in Space: Popular Nearest Neighbors in High-Dimensional Data” (2010)](https://jmlr.org/papers/v11/radovanovic10a.html)). Whether an approximate nearest-neighbor index is good enough is therefore measured, not assumed, as the recall of true neighbors against queries per second ([ANN-Benchmarks](https://ann-benchmarks.com/)).
- **Consequences for embeddings.** For unit-length vectors the squared Euclidean distance equals 2 minus twice the inner product, so after normalization cosine similarity, dot product and Euclidean distance rank neighbors the same way, while an unnormalized inner product is not cosine similarity ([Faiss wiki, “MetricType and distances”](https://github.com/facebookresearch/faiss/wiki/MetricType-and-distances)). Matryoshka representation learning trains embeddings whose leading dimensions already work as a smaller embedding, which is why such vectors can be truncated to save memory ([Kusupati et al., “Matryoshka Representation Learning” (2022)](https://arxiv.org/abs/2205.13147)).

## Planned visuals

- **`chart`: random vectors are nearly orthogonal.** Histograms of the cosine similarity between pairs of random vectors in 2, 10, 100 and 1,000 dimensions, narrowing around 0 as the dimension grows (simulated, labeled illustrative).
- **`explorer`: distances concentrate.** A dimension slider redraws the distribution of distances from a query to random points and the ratio of the farthest to the nearest distance, which approaches 1. This needs a new explorer model.
- **`stepper`: a random projection.** Points in many dimensions are projected onto k random directions; each step raises k and shows the worst distortion of any pairwise distance shrinking, as the Johnson-Lindenstrauss lemma predicts.

## Talk like an expert

Experts say "concentration of measure", "nearly orthogonal", "intrinsic versus ambient dimension", "hubs" and "the JL dimension", and they check whether vectors are normalized before arguing about cosine versus dot product. They treat 2D pictures of embeddings as cartoons: useful for intuition, misleading about distances.

## Go deeper

- Blum, Hopcroft and Kannan, [*Foundations of Data Science*](https://www.cs.cornell.edu/jeh/book2016june9.pdf), chapter 2, "High-Dimensional Space".
- Vershynin, [*High-Dimensional Probability: An Introduction with Applications in Data Science*](https://webapps.math.uci.edu/~rvershyn/papers/HDP-book/HDP-book.html), free online.
- Elhage et al., [“Toy Models of Superposition”](https://transformer-circuits.pub/2022/toy_model/index.html) (2022).
- Radovanović et al., [“Hubs in Space: Popular Nearest Neighbors in High-Dimensional Data”](https://jmlr.org/papers/v11/radovanovic10a.html) (JMLR, 2010).

## Related

- [Linear algebra for AI](#linear-algebra)
- [Embeddings](#embeddings)
- [Vector search](#vector-search)
- [Mechanistic interpretability](#mech-interp)
- [Eigenvectors, SVD and PCA](#eigenvectors-svd-pca)
