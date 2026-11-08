---
id: word-embeddings
book: 1
order: "1.6.1"
title: "Word embeddings: from word2vec to contextual representations"
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [word2vec, embeddings, glove, contextual-embeddings, nlp]
visuals: []
prerequisites: [representation-learning]
---
> [!tldr]
> A word embedding represents a word as a dense vector learned from the contexts the word appears in, so words used in similar ways end up close together. word2vec and GloVe made this cheap at scale, and contextual models such as ELMo and BERT replaced one vector per word with one vector per word in its sentence. The one thing to remember: an embedding encodes the statistics of its training text, biases included, and two-dimensional plots of an embedding space can mislead.

## Key ideas

- **From atoms to vectors.** Many NLP systems of the early 2010s treated words as atomic indices in a vocabulary, with no notion of similarity, and word2vec replaced them with two cheap architectures: CBOW predicts a word from its context, skip-gram predicts the context from the word, and together they learned high-quality vectors from a 1.6-billion-word dataset in under a day (Mikolov et al., [“Efficient Estimation of Word Representations in Vector Space”](https://arxiv.org/abs/1301.3781) (2013)). The idea underneath is the distributional hypothesis, formulated in the 1950s by Joos, Harris and Firth: words that occur in similar contexts tend to have similar meanings ([Jurafsky and Martin, *Speech and Language Processing*, chapter 5, “Embeddings”](https://web.stanford.edu/~jurafsky/slp3/5.pdf)).
- **Negative sampling, GloVe and fastText.** Negative sampling replaces the full softmax with logistic regression that tells the true context word from k noise words (k of 5 to 20 for small datasets, 2 to 5 for large ones), and subsampling frequent words speeds training further (Mikolov et al., [“Distributed Representations of Words and Phrases and their Compositionality”](https://arxiv.org/abs/1310.4546) (2013)). GloVe fits a log-bilinear model to the nonzero entries of a global word-word co-occurrence matrix, and fastText builds each word from a bag of character n-grams, so it can produce vectors for words it never saw in training (Pennington et al., [“GloVe: Global Vectors for Word Representation”](https://aclanthology.org/D14-1162/) (2014); Bojanowski et al., [“Enriching Word Vectors with Subword Information”](https://arxiv.org/abs/1607.04606) (2016)).
- **Analogies and evaluation, with caveats.** The vector for “king” minus “man” plus “woman” lands closest to “queen” ([Mikolov et al. (2013)](https://arxiv.org/abs/1301.3781)), but the nearest word is usually one of the input words unless they are explicitly excluded, and the parallelogram method works well only for some relations, such as countries and capitals or inflected forms ([Jurafsky and Martin, chapter 5](https://web.stanford.edu/~jurafsky/slp3/5.pdf); Linzen, [“Issues in evaluating semantic spaces using word analogies”](https://arxiv.org/abs/1606.07736) (2016)). The most important test is extrinsic, on a downstream task; intrinsic sets such as WordSim-353 and SimLex-999 correlate model similarities with human ratings of word pairs presented without context ([Jurafsky and Martin, chapter 5](https://web.stanford.edu/~jurafsky/slp3/5.pdf)).
- **Static versus contextual.** word2vec, GloVe and fastText give each word one fixed vector, while ELMo computes word vectors as learned functions of a deep bidirectional language model’s internal states, so “bank” gets different vectors in different sentences, and BERT conditions on left and right context in every layer (Peters et al., [“Deep contextualized word representations”](https://arxiv.org/abs/1802.05365) (2018); Devlin et al., [“BERT”](https://arxiv.org/abs/1810.04805) (2018)). Ethayarajh found that contextual representations are not isotropic in any layer of ELMo, BERT or GPT-2, that upper layers are the most context-specific, and that a static embedding explains less than 5% of the variance in a word’s contextual representations (Ethayarajh, [“How Contextual are Contextualized Word Representations?”](https://arxiv.org/abs/1909.00512) (2019)).
- **From words to sentences, and reading the geometry.** Comparing sentences with BERT means feeding both into the network, so finding the most similar pair among 10,000 sentences took about 65 hours; Sentence-BERT’s siamese network produces sentence embeddings compared by cosine similarity and cuts that to about 5 seconds; see [embedding models](#embeddings) (Reimers and Gurevych, [“Sentence-BERT”](https://arxiv.org/abs/1908.10084) (2019)). Cosine similarity, which equals the dot product for unit-length vectors, is the standard metric ([Jurafsky and Martin, chapter 5](https://web.stanford.edu/~jurafsky/slp3/5.pdf)), and t-SNE maps of embeddings need care: perplexity changes the picture, cluster sizes and distances between well-separated clusters may mean nothing, and random noise can form clumps (Wattenberg et al., [“How to Use t-SNE Effectively”](https://distill.pub/2016/misread-tsne/) (2016)).
- **Embeddings absorb social bias.** Word embeddings trained on Google News articles exhibit gender stereotypes “to a disturbing extent”, and Bolukbasi et al. proposed modifying the embedding to remove them while keeping its analogy and clustering abilities (Bolukbasi et al., [“Man is to Computer Programmer as Woman is to Homemaker? Debiasing Word Embeddings”](https://arxiv.org/abs/1607.06520) (2016)); such debiasing may reduce bias but does not eliminate it ([Jurafsky and Martin, chapter 5](https://web.stanford.edu/~jurafsky/slp3/5.pdf)). The Word Embedding Association Test (WEAT) replicated a spectrum of human biases measured by the Implicit Association Test, using GloVe vectors and cosine similarity in place of human reaction times; see [fairness metrics and bias measurement](#fairness-bias) ([Jurafsky and Martin, chapter 5](https://web.stanford.edu/~jurafsky/slp3/5.pdf); Caliskan et al., [“Semantics derived automatically from language corpora contain human-like biases”](https://arxiv.org/abs/1608.07187) (2017)).

## Planned visuals

- **`embedding-map`: a neighborhood of words.** A 2D map of word vectors with a draggable query point that lists its nearest neighbors by cosine similarity, plus a toggle that draws the king − man + woman parallelogram and shows which answers appear when the input words are not excluded.
- **`compare`: static versus contextual.** One fixed vector for “bank” on the left; on the right, separate contextual vectors for “bank” in a sentence about rivers and in a sentence about money.
- **`stepper`: one skip-gram update with negative sampling.** A center word, its true context word and k noise words, the logistic loss for each pair, and the vectors moving toward the true context and away from the noise.

## Talk like an expert

Experts talk about the **distributional hypothesis**, **skip-gram with negative sampling**, **co-occurrence statistics**, **subword vectors**, **static versus contextual embeddings**, **anisotropy** and **intrinsic versus extrinsic evaluation**, and they treat analogy scores and t-SNE pictures as illustrations, not evidence, until a downstream task confirms them.

## Go deeper

- [Jurafsky and Martin, *Speech and Language Processing*, chapter 5, “Embeddings”](https://web.stanford.edu/~jurafsky/slp3/5.pdf) (draft of the third edition).
- Mikolov et al., [“Distributed Representations of Words and Phrases and their Compositionality”](https://arxiv.org/abs/1310.4546) (2013).
- Peters et al., [“Deep contextualized word representations”](https://arxiv.org/abs/1802.05365) (NAACL 2018).
- Ethayarajh, [“How Contextual are Contextualized Word Representations? Comparing the Geometry of BERT, ELMo, and GPT-2 Embeddings”](https://arxiv.org/abs/1909.00512) (EMNLP 2019).

## Related

- [Representation learning and embeddings](#representation-learning)
- [Embeddings](#embeddings)
- [What a language model is: from n-grams to neural networks](#language-modeling)
- [High-dimensional geometry](#high-dimensional-geometry)
- [Clustering and dimensionality reduction](#clustering-dimensionality-reduction)
- [Fairness metrics and bias measurement](#fairness-bias)
