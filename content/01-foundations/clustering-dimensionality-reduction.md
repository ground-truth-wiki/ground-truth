---
id: clustering-dimensionality-reduction
book: 1
order: "1.4.6"
title: Clustering and dimensionality reduction
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [clustering, dimensionality-reduction, umap, unsupervised-learning, embeddings]
visuals: []
prerequisites: [classical-ml, linear-algebra]
---
> [!tldr]
> Clustering groups similar points without labels, and dimensionality reduction squeezes many features into a few. In AI engineering both often run on embeddings: to discover topics, find near-duplicates and look at an embedding space. There is no ground truth, so a clustering or a 2D map is a hypothesis to check by reading examples, not a finding.

## Key ideas

- **k-means is fast and opinionated.** It picks centroids that minimize inertia (the within-cluster sum of squares), which assumes convex, roughly round (isotropic) clusters, needs the number of clusters up front and can stop in a local minimum; k-means++ starts from centroids spread far apart ([scikit-learn: Clustering](https://scikit-learn.org/stable/modules/clustering.html)).
- **Other algorithms encode other ideas of a cluster.** Agglomerative clustering merges groups bottom-up by a linkage rule (Ward gives the most even sizes, single linkage the most uneven), DBSCAN grows clusters from dense core points and labels points far from every core point as noise, and HDBSCAN explores all density scales so it can find clusters of different densities ([scikit-learn: Clustering](https://scikit-learn.org/stable/modules/clustering.html)). Gaussian mixture models, fit by expectation-maximization, give each point a probability for each component, and BIC helps choose the number of components ([scikit-learn: Gaussian mixture models](https://scikit-learn.org/stable/modules/mixture.html)).
- **Cluster metrics either need labels or carry a bias, so reading samples stays part of the job.** The adjusted Rand index and adjusted mutual information compare a clustering with ground-truth classes and correct for chance, but such labels are almost never available in practice; the silhouette coefficient needs no labels but scores convex clusters higher than density-based ones such as DBSCAN's ([scikit-learn: Clustering](https://scikit-learn.org/stable/modules/clustering.html)).
- **Linear reductions compress.** PCA finds orthogonal directions of maximum variance, truncated SVD does the same without centering and becomes latent semantic analysis (LSA) on TF-IDF matrices, and NMF assumes non-negative data and components and can yield a parts-based representation ([scikit-learn: Decomposition](https://scikit-learn.org/stable/modules/decomposition.html)). Random projections trade a controlled amount of accuracy for speed while nearly preserving pairwise distances, as the Johnson-Lindenstrauss lemma promises ([scikit-learn: Random projection](https://scikit-learn.org/stable/modules/random_projection.html)).
- **t-SNE and UMAP are for looking, not measuring.** t-SNE preserves local neighborhoods, with perplexity acting as the effective number of neighbors ([scikit-learn: Manifold learning](https://scikit-learn.org/stable/modules/manifold.html)), and in its plots cluster sizes mean nothing and distances between well-separated clusters may mean nothing ([Wattenberg et al., 2016](https://distill.pub/2016/misread-tsne/)). UMAP is competitive with t-SNE for visualization, arguably keeps more global structure, runs faster and has no computational limit on the output dimension ([McInnes et al., 2018](https://arxiv.org/abs/1802.03426)).
- **Embeddings plus clustering powers topic discovery and deduplication.** BERTopic embeds documents with a pretrained transformer, clusters the embeddings and labels each cluster with class-based TF-IDF, an embedding-based alternative to classic topic models such as LDA ([Grootendorst, 2022](https://arxiv.org/abs/2203.05794)). SemDeDup uses embeddings from pretrained models to remove semantic duplicates, and its authors report removing 50% of a LAION subset with minimal performance loss ([Abbas et al., 2023](https://arxiv.org/abs/2303.09540)).

## Planned visuals

- `embedding-map`: points from a few embedding groups with a draggable query, where switching between k-means and HDBSCAN shows forced assignments versus points left as noise.
- `compare`: the same dataset projected with PCA, t-SNE and UMAP, with linked notes on what each keeps (global variance, local neighborhoods) and what the picture does not show (cluster sizes, distances between clusters).
- `stepper`: a BERTopic-style pipeline applied to production traces, from texts to embeddings, a UMAP reduction, HDBSCAN clusters and c-TF-IDF labels, ending in failure categories for error analysis.

## Talk like an expert

Experts talk about **inertia**, **linkage**, **core points and noise**, **soft assignments**, **ARI** and **silhouette**, **perplexity** and **n_neighbors**; they treat clusters as hypotheses to name and verify by reading samples, and never read distances between t-SNE clusters as real.

## Go deeper

- scikit-learn, [Clustering](https://scikit-learn.org/stable/modules/clustering.html): algorithms side by side and the metrics to evaluate them.
- Wattenberg et al., [“How to Use t-SNE Effectively” (2016)](https://distill.pub/2016/misread-tsne/).
- McInnes et al., [“UMAP: Uniform Manifold Approximation and Projection for Dimension Reduction” (2018)](https://arxiv.org/abs/1802.03426).
- Grootendorst, [“BERTopic: Neural topic modeling with a class-based TF-IDF procedure” (2022)](https://arxiv.org/abs/2203.05794).

## Related

- [Classical ML essentials](#classical-ml)
- [Eigenvectors, SVD and PCA](#eigenvectors-svd-pca)
- [Embeddings](#embeddings)
- [Error analysis first](#error-analysis)
- [High-dimensional geometry](#high-dimensional-geometry)
- [Word embeddings: from word2vec to contextual representations](#word-embeddings)
