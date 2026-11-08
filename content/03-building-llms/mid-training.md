---
id: mid-training
book: 3
order: "3.4"
title: Mid-training
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [training, annealing, long-context]
visuals:
  - training-stages:flowchart
  - midtraining-tree:tree
---
> [!tldr]
> Mid-training sits between pretraining and post-training: continued training on curated, high-quality, often domain- or skill-specific data, longer documents for context extension, and annealing with a decaying learning rate. It shapes capabilities such as math, code, long context and languages before instruction tuning begins.

## Why it matters
Model reports increasingly describe a distinct mid-training phase, and much of a model’s final strength in math, code and long context is set there. Teams adapting models to a domain use the same technique under the name continued pretraining.

## Intuition
Pretraining is a broad general education; post-training is job training. Mid-training is the specialized degree in between: intensive study of the subjects that matter most, with the best textbooks, just before graduation.

```mermaid id=training-stages title="Each training stage adds something the previous one could not" caption="A simplified path from pretraining to a deployed assistant. Real pipelines loop and repeat stages." alt="Flow from pretraining through mid-training, supervised fine-tuning, preference optimization and RL, to safety and character training."
flowchart LR
  P[Pretraining: knowledge] --> M[Mid-training: quality, length, domain]
  M --> S[SFT: instruction following]
  S --> R[Preference optimization: helpful and harmless]
  R --> V[RL with verifiable rewards: reasoning, agency]
  V --> C[Safety and character: behavior policy]
```

## How it works
**Annealing on high-quality data.** Near the end of pretraining, the learning rate decays while the mix shifts toward the best data: curated web, textbooks, math, code, reasoning traces. Small amounts of excellent data have outsized effects at this stage.

**Context extension.** Training on long documents with adjusted position encoding (for example a larger RoPE base) teaches the model to use long windows. See [positional encoding](#positional-encoding) and [long context](#long-context).

**Domain and language adaptation.** Continued pretraining on domain corpora (legal, medical, code, a specific language) builds knowledge that fine-tuning alone cannot add efficiently.

```viz
{"id":"midtraining-tree","component":"tree","title":"Four ingredients of mid-training and what each buys","caption":"Expand an ingredient. Mixes are proprietary and vary widely; open reports such as OLMo 2’s describe one public example.","alt":"Tree of mid-training ingredients: annealing data, long-context data, domain corpora and synthetic reasoning data.","data":"illustrative","open":1,"root":{"label":"Mid-training ingredients","children":[
{"label":"High-quality annealing data","children":[{"label":"Better benchmarks and writing quality for a small share of tokens"}]},
{"label":"Long documents","children":[{"label":"Usable long context after position-encoding changes","link":"#long-context"}]},
{"label":"Domain corpora","children":[{"label":"Knowledge and vocabulary for a field or language"}]},
{"label":"Synthetic reasoning and instruction-like data","children":[{"label":"Smoother transition into post-training and stronger reasoning","link":"#synthetic-data"}]}]}}
```

**Catastrophic forgetting.** Shifting the mix too far erodes general skills; replaying general data alongside new data limits the loss.

## In practice
- Consider continued pretraining when a domain has large unlabeled corpora and the model lacks its knowledge; consider fine-tuning when behavior, not knowledge, is the gap. See [fine-tuning in practice](#fine-tuning-practice).
- Mix in general data to avoid forgetting; evaluate general and domain skills together.
- Expect continued pretraining to need far more tokens and compute than fine-tuning.

## Numbers to know
> [!number]
> Rules of thumb. Mid-training and annealing phases are usually a small fraction of total pretraining tokens but have large effects on benchmarks. Continued pretraining for a domain commonly uses billions of tokens.

## Pitfalls and anti-patterns
> [!pitfall] Continued pretraining without replay
> Training only on domain data can erase general instruction-following and reasoning.

- **Benchmark-shaped annealing data.** It inflates scores without real capability.

## Talk like an expert
The vocabulary: **mid-training**, **continued pretraining**, **annealing**, **learning-rate decay**, **data mix**, **context extension**, **replay**, **catastrophic forgetting**. Experts ask what data was used in annealing when interpreting a model’s strengths. The live debate is where the line between mid-training and post-training belongs as synthetic reasoning data enters earlier.

> [!hottake] Mid-training is where much of the “secret sauce” of modern models lives.
> **The counterargument:** post-training with reinforcement learning has produced the most visible jumps in reasoning and agentic ability recently; mid-training sets the stage, but post-training performs.

## Check yourself
```quiz
mid-training
```

## Go deeper
- Team OLMo, “2 OLMo 2 Furious” (2024), describing a mid-training mix openly.
- Gururangan et al., “Don’t Stop Pretraining” (2020), on domain-adaptive continued pretraining.

## Related
- [Pretraining data](#pretraining-data)
- [Supervised fine-tuning](#sft)
- [Embeddings and position](#positional-encoding)
- [Scaling laws and compute](#scaling-laws)
- [Synthetic data](#synthetic-data)
- [Learning rate, batch size and schedules](#training-hyperparameters)
- [RoPE scaling and context extension](#rope-scaling)
- [The pretraining run, end to end](#pretraining-run)
- [Data mixtures, repetition and curricula](#data-mixing)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Long-context extension during training](#long-context-training)
