---
id: retrieval-augmented-lms
book: 6
order: "6.1.1"
title: "Retrieval-augmented language models: the research lineage"
level: expert
stability: evergreen
reviewed: "2026-11"
status: seed
tags: [rag-history, realm, retro, fusion-in-decoder, research-lineage]
visuals: []
prerequisites: [rag-fundamentals, embeddings]
---
> [!tldr]
> A retrieval-augmented language model reads from an external text collection at inference time instead of keeping all its knowledge in its weights. The research line runs from retriever-reader question answering, through learned retrievers, end-to-end RAG and retrieval at pretraining scale, to methods that retrieve for a frozen model behind an API. The one thing to remember: the simplest design, putting retrieved passages into the prompt of an unchanged model, needs no training and no access to the weights, so it works with any model, including one you can only call through an API.

## Key ideas

- **Retriever plus reader.** DrQA answered open-domain questions over Wikipedia with a TF-IDF retriever over hashed bigrams and a neural reader that extracts the answer span, a two-part split that later work kept while making each part learned (Chen et al., [“Reading Wikipedia to Answer Open-Domain Questions”](https://arxiv.org/abs/1704.00051) (2017)).
- **Learned retrievers.** ORQA trained the retriever and reader together from question-answer pairs alone, after pretraining the retriever with an Inverse Cloze Task ([Lee et al., 2019](https://arxiv.org/abs/1906.00300)), and REALM trained the retriever during masked-language-model pretraining, backpropagating through retrieval over millions of documents ([Guu et al., 2020](https://arxiv.org/abs/2002.08909)). DPR then showed that a plain dual encoder trained on question-passage pairs beats Lucene BM25 by 9 to 19 points of top-20 accuracy (Karpukhin et al., [“Dense Passage Retrieval for Open-Domain Question Answering”](https://arxiv.org/abs/2004.04906) (2020)); see [training retrievers](#training-retrievers).
- **RAG and Fusion-in-Decoder.** RAG pairs a pretrained sequence-to-sequence generator (parametric memory) with a dense vector index of Wikipedia (non-parametric memory), trained end to end, and either uses the same passages for the whole output or different passages per token (Lewis et al., [“Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks”](https://arxiv.org/abs/2005.11401) (2020)). Fusion-in-Decoder encodes each passage separately and lets the decoder combine them, and its accuracy rises significantly as more passages are retrieved (Izacard and Grave, [“Leveraging Passage Retrieval with Generative Models for Open Domain Question Answering”](https://arxiv.org/abs/2007.01282) (2020)).
- **Retrieval inside the model.** kNN-LM mixes a model's next-token distribution with a k-nearest-neighbor model, whose neighbors are found in the model's own embedding space over any text collection, with no extra training ([Khandelwal et al., 2019](https://arxiv.org/abs/1911.00172)), and RETRO attends to chunks retrieved from a 2-trillion-token database through chunked cross-attention, matching GPT-3 and Jurassic-1 on the Pile with 25 times fewer parameters (Borgeaud et al., [“Improving language models by retrieving from trillions of tokens”](https://arxiv.org/abs/2112.04426) (2021)). Atlas brought retrieval to few-shot learning: with 64 examples it reaches over 42% on Natural Questions, ahead of a 540-billion-parameter model with 50 times fewer parameters ([Izacard et al., 2022](https://arxiv.org/abs/2208.03299)).
- **Retrieval for a frozen model.** In-Context RALM prepends retrieved documents to the input of an unchanged model, without training it, and gets large gains from off-the-shelf retrievers, which suits models available only through an API (Ram et al., [“In-Context Retrieval-Augmented Language Models”](https://arxiv.org/abs/2302.00083) (2023)); REPLUG keeps the model a black box and tunes the retriever with the model's own feedback ([Shi et al., 2023](https://arxiv.org/abs/2301.12652)). RA-DIT fine-tunes both sides, the model to use retrieved text and the retriever to return what the model prefers ([Lin et al., 2023](https://arxiv.org/abs/2310.01352)), and RAFT trains a model to ignore distractor documents and quote the relevant one ([Zhang et al., 2024](https://arxiv.org/abs/2403.10131)).
- **Retrieval during generation, and the map of the field.** IRCoT interleaves retrieval with chain-of-thought steps because what to retrieve depends on what has already been derived ([Trivedi et al., 2022](https://arxiv.org/abs/2212.10509)), and FLARE retrieves again when the upcoming sentence contains low-confidence tokens ([Jiang et al., 2023](https://arxiv.org/abs/2305.06983)), the bridge to [agentic RAG](#advanced-rag). DSI drops the separate index and has one transformer map queries straight to document ids ([Tay et al., 2022](https://arxiv.org/abs/2202.06991)), and Gao et al. sort the applied work into naive, advanced and modular RAG ([“Retrieval-Augmented Generation for Large Language Models: A Survey”](https://arxiv.org/abs/2312.10997) (2023)).

## Planned visuals

- **`timeline`:** the lineage from DrQA (2017) to RAFT (2024), one event per paper above, each linked to its source and marked by what is trained: the retriever, the reader, both or neither.
- **`diagram`** with variants: where retrieved text enters the model, as the prompt (In-Context RALM, REPLUG), as separately encoded passages (Fusion-in-Decoder), through cross-attention in intermediate layers (RETRO) or as a mixed output distribution (kNN-LM).
- **`stepper`:** IRCoT's loop, one frame per reasoning step and the retrieval it triggers, contrasted with a single retrieve-then-read pass.

## Talk like an expert

Experts separate parametric memory (the weights) from non-parametric memory (the index), and they classify a system by what it retrieves (documents, chunks or tokens), where the result enters the model, and what gets trained. Agentic RAG extends the IRCoT and FLARE idea: retrieval is decided during generation, not once up front.

## Go deeper

- Asai, Min, Zhong and Chen, [“Retrieval-based Language Models and Applications”](https://acl2023-retrieval-lm.github.io/), ACL 2023 tutorial, with reading lists for its sections on architecture, training, applications, extensions, and challenges and opportunities.
- Lewis et al., [“Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks”](https://arxiv.org/abs/2005.11401) (2020).
- Borgeaud et al., [“Improving language models by retrieving from trillions of tokens”](https://arxiv.org/abs/2112.04426) (2021).
- Gao et al., [“Retrieval-Augmented Generation for Large Language Models: A Survey”](https://arxiv.org/abs/2312.10997) (2023).

## Related

- [RAG fundamentals](#rag-fundamentals)
- [Advanced RAG architectures](#advanced-rag)
- [Information retrieval foundations](#ir-foundations)
- [Training and fine-tuning retrievers](#training-retrievers)
- [Embeddings](#embeddings)
