---
id: recommender-systems
book: 1
order: "1.16"
title: Recommender systems
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [recommender-systems, collaborative-filtering, matrix-factorization, two-tower, ranking]
visuals: []
prerequisites: [classical-ml, linear-algebra]
---
> [!tldr]
> A recommender system picks, from a catalog far too large to score in full, the handful of items one user is most likely to want. It works in stages: cheap retrieval of a few hundred candidates, a precise ranking model, and a re-ranking step that filters and diversifies the final list, the same retrieve-then-rerank shape as a RAG pipeline. The one thing to remember: the training data is made of reactions to earlier recommendations, so it is biased by position and popularity, and offline metrics do not always predict what an online A/B test will show.

## Key ideas

- **Retrieve, rank, re-rank.** Candidate generation narrows a huge corpus (for YouTube, from billions of videos to hundreds or thousands) with fast models, scoring picks about ten items with a more precise model, and re-ranking removes items the user explicitly disliked and helps ensure freshness, diversity and fairness ([Google: Recommendation systems overview](https://developers.google.com/machine-learning/recommendation/overview/types)). Covington et al. present the YouTube system along the "classic two-stage information retrieval dichotomy", the same split that [vector search](#vector-search) and [reranking](#reranking) form in RAG (Covington et al., [“Deep Neural Networks for YouTube Recommendations”](https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/) (2016)).
- **Explicit or implicit feedback, content or collaboration.** Explicit feedback is a rating the user gives, implicit feedback is inferred from behavior such as watching, and a retrieval model trained on implicit data can treat every unseen item as an implicit negative ([TensorFlow Recommenders: basic retrieval](https://www.tensorflow.org/recommenders/examples/basic_retrieval)). Content-based filtering recommends items whose features resemble what the user liked, while collaborative filtering uses similarities between users and items at the same time and learns its embeddings without hand-engineered features ([Google: content-based filtering](https://developers.google.com/machine-learning/recommendation/content-based/basics); [Google: collaborative filtering](https://developers.google.com/machine-learning/recommendation/collaborative/basics)).
- **Matrix factorization learns user and item embeddings.** It approximates the sparse user-item feedback matrix as the product of a user embedding matrix and an item embedding matrix; weighted matrix factorization counts unobserved entries as zeros with a tunable weight, and weighted alternating least squares (WALS) solves for one matrix while holding the other fixed, then swaps ([Google: matrix factorization](https://developers.google.com/machine-learning/recommendation/collaborative/matrix)). An item not seen in training has no embedding (the cold-start problem), but once it has a few interactions WALS can compute one without retraining the whole model, and side features beyond the ID improve quality ([Google: collaborative filtering summary](https://developers.google.com/machine-learning/recommendation/collaborative/summary)).
- **Two towers for retrieval, richer models for ranking.** A two-tower model embeds the query and each candidate with separate networks and scores them by a dot product, so candidate embeddings can be indexed ahead of time and served from an approximate nearest neighbor index; with ID embeddings only, it is classic matrix factorization ([TensorFlow Recommenders: basic retrieval](https://www.tensorflow.org/recommenders/examples/basic_retrieval)). Neural collaborative filtering replaces the dot product with a learned network (He et al., [“Neural Collaborative Filtering”](https://arxiv.org/abs/1708.05031) (2017)), but a later study found that a well-tuned dot product substantially outperformed those learned similarities and is far cheaper to serve (Rendle et al., [“Neural Collaborative Filtering vs. Matrix Factorization Revisited”](https://arxiv.org/abs/2005.09683) (2020)).
- **Measure offline, decide online.** Retrieval is scored by whether the item the user actually chose lands in the top k, and ranking by position-aware metrics such as nDCG, which discounts relevance by rank and divides by the score of the ideal ranking ([TensorFlow Recommenders: basic retrieval](https://www.tensorflow.org/recommenders/examples/basic_retrieval); [scikit-learn: ndcg_score](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.ndcg_score.html)), while the objectives that train rankers belong to [learning to rank](#learning-to-rank). The YouTube team iterated on offline metrics but decided with live A/B tests, because live results "are not always correlated with offline experiments", and ranked mainly by expected watch time per impression because ranking by click-through rate often promotes clickbait (Covington et al., [“Deep Neural Networks for YouTube Recommendations”](https://doi.org/10.1145/2959100.2959190) (2016)).
- **The data reacts to the system.** Position bias makes higher-ranked results collect more clicks, so training directly on clicks gives suboptimal rankers (Joachims et al., [“Unbiased Learning-to-Rank with Biased Feedback”](https://arxiv.org/abs/1608.04468) (2016)), and a [contextual bandit](#bandits) that learns from clicks while choosing what to show reported a 12.5% click lift over a standard context-free bandit on a Yahoo! Front Page Today Module dataset of over 33 million events (Li et al., [“A Contextual-Bandit Approach to Personalized News Article Recommendation”](https://arxiv.org/abs/1003.0146) (2010)). Training on data from users who already saw recommendations creates a feedback loop that homogenizes behavior without increasing utility (Chaney et al., [“How Algorithmic Confounding in Recommendation Systems Increases Homogeneity and Decreases Utility”](https://arxiv.org/abs/1710.11214) (2017)), and popularity bias leaves niche items rarely recommended, which a re-ranking step can counter (Abdollahpouri et al., [“Managing Popularity Bias in Recommender Systems with Personalized Re-ranking”](https://arxiv.org/abs/1901.07555) (2019)).

## Planned visuals

- `diagram`: the multi-stage funnel, from a corpus of millions through several candidate sources (a two-tower ANN lookup, fresh items, items similar to recent ones) to ranking and a re-ranking step with filters and diversity rules, each stage clickable to its chapter.
- `heatmap`: a small, sparse user-item matrix of illustrative implicit feedback next to its rank-2 reconstruction from user and item embeddings, so the reader sees the factorization fill in the unobserved cells.
- `embedding-map`: users and items in one shared 2D embedding space, where dragging the user point re-ranks the items by dot product, as a two-tower retrieval would return them.

## Talk like an expert

Practitioners talk about **candidate generation** (retrieval), **ranking** and **re-ranking**, **implicit feedback**, **two towers**, **ANN serving**, **cold start** and **folding-in**, **recall@k**, **nDCG**, **MRR** and **MAP**, **position bias** and **feedback loops**. Their first question about an offline gain is whether it held up in an online A/B test.

## Go deeper

- Google for Developers, [Recommendation systems course](https://developers.google.com/machine-learning/recommendation), a course of about four hours on candidate generation, scoring and re-ranking, matrix factorization and deep neural network models.
- Covington et al., [“Deep Neural Networks for YouTube Recommendations” (2016)](https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/).
- [TensorFlow Recommenders: basic retrieval](https://www.tensorflow.org/recommenders/examples/basic_retrieval), a two-tower model trained and served with an ANN index.
- Rendle et al., [“Neural Collaborative Filtering vs. Matrix Factorization Revisited” (2020)](https://arxiv.org/abs/2005.09683).

## Related

- [Classical ML essentials](#classical-ml)
- [Embeddings](#embeddings)
- [Vector search](#vector-search)
- [Reranking](#reranking)
- [Multi-armed and contextual bandits](#bandits)
- [Representation learning and embeddings](#representation-learning)
