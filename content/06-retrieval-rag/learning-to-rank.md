---
id: learning-to-rank
book: 6
order: "6.9.1"
title: Learning to rank
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [learning-to-rank, lambdamart, click-bias, rerankers, search-ranking]
visuals: []
prerequisites: [reranking, classical-ml]
---
> [!tldr]
> Learning to rank trains a model to put a list of candidates in the best order, judged by a ranking metric such as nDCG, instead of predicting each label on its own. Classic search ranking feeds features such as per-field BM25 scores and popularity to gradient-boosted trees trained with LambdaMART; cross-encoders and LLM rerankers apply the same idea with learned representations. Remember that clicks are cheap labels but biased toward whatever was shown on top, so they need debiasing before they can teach a ranker.

## Key ideas

- **Ranking is its own learning problem.** Liu's survey sorts the methods into pointwise (score each document), pairwise (order each pair) and listwise (optimize the whole list), and its experiments on the LETOR benchmark suggested that listwise methods are the most effective (Liu, [“Learning to Rank for Information Retrieval”](https://doi.org/10.1561/1500000016) (2009)). The training data is a judgment list of query-document pairs with binary or graded labels, plus features computed per pair, such as text-match scores like BM25 on the title and on the content field, and a popularity field ([Elastic Search Labs, “Introducing Learning To Rank (LTR) in Elasticsearch”](https://www.elastic.co/search-labs/blog/elasticsearch-learning-to-rank-introduction)).
- **From RankNet to LambdaMART.** RankNet minimizes a smooth cost over pairwise errors, which does not match metrics that care most about the top positions, so LambdaRank writes the gradients directly: each pair's RankNet gradient is multiplied by the change in nDCG from swapping the two documents, which sidesteps the fact that nDCG is flat or discontinuous as a function of the scores; LambdaMART is its boosted-tree version, and an ensemble of LambdaMART rankers won Track 1 of the 2010 Yahoo! Learning to Rank Challenge (Burges, [“From RankNet to LambdaRank to LambdaMART: An Overview”](https://www.microsoft.com/en-us/research/?p=159784) (2010)). In XGBoost, the default ranking objective `rank:ndcg` is LambdaMART, `rank:pairwise` is the plain RankNet loss, and every row needs a query id, with rows sorted by it ([XGBoost learning-to-rank tutorial](https://xgboost.readthedocs.io/en/stable/tutorials/learning_to_rank.html)).
- **Clicks and position bias.** Users tend to click results shown higher up, so raw clicks make suboptimal training data; Joachims et al. weight each click by the inverse of its propensity, the probability that a result at that rank was examined at all, which works even when queries do not repeat (Joachims et al., [“Unbiased Learning-to-Rank with Biased Feedback”](https://arxiv.org/abs/1608.04468) (2016)). As of November 2026, XGBoost offers an unbiased LambdaMART for position-biased clicks, still marked experimental ([XGBoost tutorial](https://xgboost.readthedocs.io/en/stable/tutorials/learning_to_rank.html)).
- **Neural rankers are learning to rank too.** monoBERT reads the query and passage together and reported a 27% relative gain in MRR@10 over the previous best, topping the MS MARCO passage leaderboard (Nogueira and Cho, [“Passage Re-ranking with BERT”](https://arxiv.org/abs/1901.04085) (2019)). monoT5 generates a relevance word and reads its probability as the score, and significantly outperforms an encoder-only model when training data is scarce (Nogueira et al., [“Document Ranking with a Pretrained Sequence-to-Sequence Model”](https://arxiv.org/abs/2003.06713) (2020)); see [reranking](#reranking).
- **LLM rerankers are listwise and order-sensitive.** RankGPT asks a model to output a permutation of the passages and slides a window of 20 with a step of 10 from the bottom of BM25's top 100 to the top; with gpt-3.5-turbo, starting from a random order instead of BM25's dropped nDCG@10 on TREC DL19 from 65.80 to 25.17, and a 435M-parameter model distilled from its rankings beat the 3B monoT5 on average over BEIR (Sun et al., [“Is ChatGPT Good at Search? Investigating Large Language Models as Re-Ranking Agents”](https://arxiv.org/abs/2304.09542) (2023)).
- **Serving: a second-stage rescorer.** A cheap first-stage query retrieves candidates and the learned model rescores only the top window; Elasticsearch has shipped this natively since version 8.13, introduced as a technical preview, with XGBoost LambdaMART models uploaded through the eland client and features defined as templated queries ([Elastic Search Labs](https://www.elastic.co/search-labs/blog/elasticsearch-learning-to-rank-introduction)).

## Planned visuals

- **`explorer`** (the `ndcg` model): drag documents to reorder a ranked list and watch nDCG change, with each pair's push drawn as an arrow sized by the nDCG change of swapping it, the LambdaRank idea made visible.
- **`tree`:** the family of rankers, from pointwise regression through RankNet and LambdaMART to monoBERT, monoT5 and listwise LLM rerankers, each leaf linked to its paper.
- **`diagram`:** the serving loop: first-stage retrieval, feature logging, the rescorer over the top window, click logging and propensity estimation, and retraining from the judgment list.

## Talk like an expert

Experts talk about judgment lists, graded relevance, query groups, feature logging, lambda gradients, propensities and the rescoring window. They treat an offline nDCG gain on a judgment list as a hypothesis until an online test agrees, and they suspect position bias whenever a model trained on clicks simply reproduces the old ranking.

## Go deeper

- Liu, [“Learning to Rank for Information Retrieval”](https://doi.org/10.1561/1500000016) (2009).
- Burges, [“From RankNet to LambdaRank to LambdaMART: An Overview”](https://www.microsoft.com/en-us/research/?p=159784) (2010).
- Joachims et al., [“Unbiased Learning-to-Rank with Biased Feedback”](https://arxiv.org/abs/1608.04468) (2016).
- [XGBoost learning-to-rank tutorial](https://xgboost.readthedocs.io/en/stable/tutorials/learning_to_rank.html).

## Related

- [Reranking](#reranking)
- [Lexical and hybrid retrieval](#hybrid-retrieval)
- [Information retrieval foundations](#ir-foundations)
- [Retrieval benchmarks and test collections](#retrieval-test-collections)
- [Online evaluation](#online-evaluation)
- [Classical ML essentials](#classical-ml)
