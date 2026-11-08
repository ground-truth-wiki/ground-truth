---
id: training-retrievers
book: 6
order: "6.4.1"
title: Training and fine-tuning retrievers
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [dense-retrieval, contrastive-learning, hard-negatives, embeddings, fine-tuning]
visuals: []
prerequisites: [embeddings, representation-learning]
---
> [!tldr]
> Training a retriever teaches a bi-encoder to place each query close to the passages that answer it and far from everything else, usually with a contrastive loss over in-batch and mined negatives. When a general embedder misses your domain, you can fine-tune it on in-domain pairs, and the labels can come from queries a language model writes and a cross-encoder that grades them. Remember to measure on held-out in-domain queries before and after, and to budget for re-embedding the whole corpus, because a new model's vectors live in a different space.

## Key ideas

- **A bi-encoder trained contrastively.** DPR trains separate question and passage encoders so that matching pairs get a high dot product, learns from a modest number of question-passage pairs, and beats Lucene BM25 by 9 to 19 points of top-20 accuracy (Karpukhin et al., [“Dense Passage Retrieval for Open-Domain Question Answering”](https://arxiv.org/abs/2004.04906) (2020)). The standard loss treats every other positive in the batch as a negative; Sentence Transformers calls it MultipleNegativesRankingLoss and notes its other names, InfoNCE and in-batch negatives loss ([Sentence Transformers losses](https://sbert.net/docs/package_reference/sentence_transformer/losses.html)).
- **Batch size is a hyperparameter of the loss.** More in-batch negatives give a stronger signal, but the whole batch must fit in GPU memory; gradient caching decouples the loss from the encoder's backward pass, so memory stays almost constant as the batch grows (Gao et al., [“Scaling Deep Contrastive Learning Batch Size under Memory Limited Setup”](https://arxiv.org/abs/2101.06983) (2021)), and Sentence Transformers ships it as CachedMultipleNegativesRankingLoss ([losses reference](https://sbert.net/docs/package_reference/sentence_transformer/losses.html)).
- **Hard negatives, and the false ones among them.** The negatives used in training are often not representative of the irrelevant documents a retriever meets at test time, so ANCE draws negatives from an approximate nearest neighbor index of the corpus that is refreshed during training (Xiong et al., [“Approximate Nearest Neighbor Negative Contrastive Learning for Dense Text Retrieval”](https://arxiv.org/abs/2007.00808) (2020)). Mined negatives are sometimes unlabeled positives, which is why RocketQA denoises its hard negatives ([Qu et al., 2020](https://arxiv.org/abs/2010.08191)) and GISTEmbedLoss uses a guide model to drop in-batch negatives that the guide scores as more similar to the query than the positive ([losses reference](https://sbert.net/docs/package_reference/sentence_transformer/losses.html)).
- **Pretraining without labels.** Contriever trains with unsupervised contrastive learning, beats BM25 on 11 of 15 BEIR datasets for recall@100, and improves further when fine-tuned on a few thousand in-domain examples (Izacard et al., [“Unsupervised Dense Information Retrieval with Contrastive Learning”](https://arxiv.org/abs/2112.09118) (2021)). E5 trains on CCPairs, a large curated set of weakly supervised text pairs, and was reported as the first model to beat BM25 zero-shot on BEIR without labeled data (Wang et al., [“Text Embeddings by Weakly-Supervised Contrastive Pre-training”](https://arxiv.org/abs/2212.03533) (2022)).
- **Synthetic queries and teacher models.** InPars and Promptagator have a large language model write queries for your documents from a few examples, no more than 8 per task for Promptagator ([Bonifacio et al., 2022](https://arxiv.org/abs/2202.05144); [Dai et al., 2022](https://arxiv.org/abs/2209.11755)), and GPL adds a cross-encoder that pseudo-labels generated pairs, beating an out-of-the-box dense retriever by up to 9.3 nDCG@10 on six specialized domains (Wang et al., [“GPL: Generative Pseudo Labeling for Unsupervised Domain Adaptation of Dense Retrieval”](https://arxiv.org/abs/2112.07577) (2021)). The same idea scales to LLM-based embedders: Wang et al. fine-tune open decoder-only models on synthetic data for hundreds of thousands of tasks in 93 languages, in fewer than 1,000 training steps ([“Improving Text Embeddings with Large Language Models”](https://arxiv.org/abs/2401.00368) (2023)).
- **Tooling and evaluation.** MatryoshkaLoss wraps another loss and applies it at several embedding sizes, so vectors can later be truncated ([losses reference](https://sbert.net/docs/package_reference/sentence_transformer/losses.html)). Evaluators run before, during or after training, and the information retrieval evaluator takes queries, a corpus and the relevant documents per query, and the full training example scores the base model before training, which gives you a baseline ([Sentence Transformers training overview](https://sbert.net/docs/sentence_transformer/training_overview.html)). A new model's vectors cannot be compared with the old ones unless it was trained for compatibility, so an update normally means recomputing every stored embedding, a step Shen et al. call backfilling (Shen et al., [“Towards Backward-Compatible Representation Learning”](https://arxiv.org/abs/2003.11942) (2020)).

## Planned visuals

- **`stepper`:** one training step with in-batch negatives: a batch of query-passage pairs, their similarity matrix, the diagonal pulled up and the rest pushed down, then a mined hard negative added as an extra column, and a false negative flagged.
- **`diagram`:** the domain-adaptation pipeline, from corpus to generated queries, negative mining, cross-encoder pseudo labels, bi-encoder fine-tuning, evaluation on held-out queries, and re-embedding and re-indexing, each node linked to its chapter.
- **`calculator`:** the cost of re-embedding a corpus from its number of chunks, tokens per chunk and the embedder's throughput, with the formula and assumptions shown.

## Talk like an expert

Experts talk about in-batch negatives, hard-negative mining, false negatives, temperature, cross-encoder teachers and domain adaptation. They judge a fine-tune by recall@k and nDCG@10 on held-out in-domain queries, not by the training loss, and they version the embedding model together with the index built from it.

## Go deeper

- Karpukhin et al., [“Dense Passage Retrieval for Open-Domain Question Answering”](https://arxiv.org/abs/2004.04906) (2020).
- Izacard et al., [“Unsupervised Dense Information Retrieval with Contrastive Learning”](https://arxiv.org/abs/2112.09118) (2021).
- Wang et al., [“GPL: Generative Pseudo Labeling for Unsupervised Domain Adaptation of Dense Retrieval”](https://arxiv.org/abs/2112.07577) (2021).
- [Sentence Transformers losses reference](https://sbert.net/docs/package_reference/sentence_transformer/losses.html).

## Related

- [Embeddings](#embeddings)
- [Representation learning and embeddings](#representation-learning)
- [Reranking](#reranking)
- [Retrieval benchmarks and test collections](#retrieval-test-collections)
- [Synthetic data recipes](#synthetic-data-recipes)
- [Fine-tuning in practice](#fine-tuning-practice)
