---
id: representation-learning
book: 1
order: "1.6"
title: Representation learning and embeddings
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [embeddings, contrastive, clip]
visuals:
  - contrastive-map:embedding-map
  - contrastive-stepper:stepper
---
> [!tldr]
> Representation learning trains models to turn raw inputs into vectors that capture meaning, so similar things land close together. Self-supervised objectives such as next-token prediction, masked modeling and contrastive learning produce the embeddings behind search, retrieval, clustering and multimodal models.

## Why it matters
Embeddings power retrieval, recommendation, deduplication, clustering and the connection between images and text. Knowing how they are learned explains what they capture, where they fail and why fine-tuning them on your data helps.

## Intuition
A good representation is a map where distance means similarity. Contrastive learning draws the map by repeatedly saying “these two belong together, those do not”.

```viz
{"id":"contrastive-map","component":"embedding-map","title":"After contrastive training, matching pairs cluster and unrelated items spread apart","caption":"Illustrative 2D map of text and image embeddings in a shared space. Drag the query and switch metrics.","alt":"Draggable query among embeddings of captions and images grouped by topic in a shared space.","data":"illustrative","k":3,"threshold":0.9,"query":{"x":0.5,"y":0.5,"label":"query: a dog on a beach"},"points":[{"label":"photo: dog running on sand","x":0.6,"y":0.55,"group":"dogs"},{"label":"caption: puppy at the seaside","x":0.55,"y":0.65,"group":"dogs"},{"label":"photo: cat on a sofa","x":-0.4,"y":0.6,"group":"cats"},{"label":"caption: kitten asleep","x":-0.5,"y":0.5,"group":"cats"},{"label":"photo: city skyline","x":0.1,"y":-0.7,"group":"cities"},{"label":"caption: night traffic","x":0.2,"y":-0.6,"group":"cities"}]}
```

## How it works
**Self-supervised learning.** Models learn from the structure of data itself: predicting the next token (GPT-style), filling masked tokens (BERT-style), or matching views of the same item.

**Contrastive learning.** Pull embeddings of matching pairs together and push others apart, with a loss such as InfoNCE. SimCLR (Chen et al., 2020) did this for images; CLIP (Radford et al., 2021) for image–caption pairs; retrieval embedders for queries and passages.

```viz
{"id":"contrastive-stepper","component":"stepper","title":"One contrastive step: find the right partner among the decoys","caption":"A batch of four image–caption pairs. Each image should score highest with its own caption.","alt":"Stepper of a contrastive learning step with a similarity matrix whose diagonal should dominate.","data":"illustrative","frames":[
{"label":"Embed","caption":"Encode four images and four captions into the same space."},
{"label":"Score","caption":"Compute all image–caption similarities. Before training, the diagonal (true pairs) is barely higher than the rest.","matrix":{"rows":["image 1","image 2","image 3","image 4"],"cols":["cap 1","cap 2","cap 3","cap 4"],"values":[[0.31,0.28,0.25,0.3],[0.27,0.33,0.29,0.26],[0.3,0.27,0.32,0.28],[0.26,0.29,0.27,0.34]],"min":0,"max":1}},
{"label":"Loss","caption":"The loss rewards each true pair scoring highest in its row and column, treating the other captions as negatives."},
{"label":"After training","caption":"The diagonal dominates: images and captions that belong together are close.","matrix":{"rows":["image 1","image 2","image 3","image 4"],"cols":["cap 1","cap 2","cap 3","cap 4"],"values":[[0.89,0.12,0.08,0.15],[0.1,0.91,0.14,0.09],[0.13,0.07,0.87,0.11],[0.09,0.16,0.1,0.9]],"min":0,"max":1}}]}
```

**What gets captured.** Representations encode what the objective rewards: topical similarity, paraphrase, visual concepts. They also absorb biases and blind spots of the data.

**Uses.** Retrieval and search (see [embeddings](#embeddings)), clustering and deduplication, classification with few labels, and connecting modalities in [vision-language models](#vision-language-models).

## In practice
- Use pretrained embedders; fine-tune on your own pairs with hard negatives when retrieval quality matters.
- Evaluate embeddings on your task (recall@k), not on general leaderboards alone.

## Numbers to know
> [!number]
> Rules of thumb. Contrastive training benefits from large batches (many negatives). Embedding dimensions of a few hundred to a few thousand are typical.

## Pitfalls and anti-patterns
> [!pitfall] Assuming similarity means relevance
> Embeddings capture what training rewarded; “similar topic” is not always “answers the question”.

## Talk like an expert
The vocabulary: **representation**, **embedding space**, **self-supervised**, **masked modeling**, **contrastive learning**, **InfoNCE**, **hard negatives**, **CLIP**, **shared space**. Experts ask what objective an embedder was trained on before trusting its similarities. The live debate is whether general embedders or task-tuned ones should anchor retrieval systems.

> [!hottake] Most retrieval problems are representation problems in disguise.
> **The counterargument:** many retrieval failures come from parsing, chunking or missing keyword search, which no embedding improvement fixes.

## Check yourself
```quiz
representation-learning
```

## Go deeper
- Chen et al., “A Simple Framework for Contrastive Learning of Visual Representations” (2020).
- Radford et al., “Learning Transferable Visual Models From Natural Language Supervision” (2021), the CLIP paper.

## Related
- [Embeddings](#embeddings)
- [Vision-language models](#vision-language-models)
- [Linear algebra for AI](#linear-algebra)
- [Neural networks](#neural-networks)
- [Hybrid retrieval](#hybrid-retrieval)
