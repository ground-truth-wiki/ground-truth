---
id: specialist-models
book: 4
order: "4.4"
title: Specialist models
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [embeddings, rerankers, speech, vision]
visuals:
  - specialist-map:diagram
  - specialist-tree:tree
---
> [!tldr]
> Beyond general chat models sit specialists: embedding models and rerankers for retrieval, code models, speech recognition and synthesis, OCR and document models, vision models, guard models for safety, translation, and scientific models such as protein structure predictors. Specialists are often cheaper, faster and better at their one job.

## Why it matters
Many production pipelines combine a general model with several specialists: an embedder and reranker for retrieval, a speech model for voice, a guard model for safety. Choosing the right specialist often beats asking a general model to do everything.

## Intuition
A hospital has general practitioners and specialists. The GP handles most visits and refers the rest; nobody asks the GP to read every scan.

```viz
{"id":"specialist-map","component":"diagram","title":"Eight kinds of specialist model around a general model","caption":"Click a specialist for the chapter where it is used.","alt":"Diagram of a general model surrounded by specialist models: embeddings, rerankers, code, speech, OCR and documents, vision, guard models and scientific models.","data":"illustrative","w":600,"h":240,"nodes":[
{"id":"gen","label":"General model","role":"model","x":215,"y":92,"w":170,"h":56},
{"id":"emb","label":"Embeddings","role":"data","x":0,"y":0,"w":140,"h":44,"link":"#embeddings"},
{"id":"rr","label":"Rerankers","role":"data","x":153,"y":0,"w":140,"h":44,"link":"#reranking"},
{"id":"code","label":"Code models","role":"tool","x":306,"y":0,"w":140,"h":44,"link":"#coding-agents"},
{"id":"speech","label":"Speech","role":"tool","x":460,"y":0,"w":140,"h":44,"link":"#speech-audio"},
{"id":"ocr","label":"OCR and documents","role":"context","x":0,"y":196,"w":140,"h":44,"link":"#document-screen-understanding"},
{"id":"vision","label":"Vision","role":"context","x":153,"y":196,"w":140,"h":44,"link":"#vision-language-models"},
{"id":"guard","label":"Guard models","role":"untrusted","x":306,"y":196,"w":140,"h":44,"link":"#guardrails-control"},
{"id":"sci","label":"Scientific models","role":"agent","x":460,"y":196,"w":140,"h":44,"link":"#ai-for-science"}],
"edges":[{"from":"emb","to":"gen","style":"dashed"},{"from":"rr","to":"gen","style":"dashed"},{"from":"code","to":"gen","style":"dashed"},{"from":"speech","to":"gen","style":"dashed"},{"from":"ocr","to":"gen","style":"dashed"},{"from":"vision","to":"gen","style":"dashed"},{"from":"guard","to":"gen","style":"dashed"},{"from":"sci","to":"gen","style":"dashed"}]}
```

## How it works
**Retrieval specialists.** Embedding models map text to vectors; rerankers score query–passage pairs. See [embeddings](#embeddings) and [reranking](#reranking).

**Code models.** Code-specialized families and fill-in-the-middle models for completion; general frontier models now lead on agentic coding.

**Speech.** Recognition (Whisper and successors, commercial ASR), synthesis (TTS), and speech-to-speech models. See [speech and audio](#speech-audio).

**Documents and vision.** OCR engines, layout and table models, and vision-language models specialized for documents. See [document understanding](#document-screen-understanding).

**Guard models.** Classifiers such as Llama Guard and provider moderation models that screen inputs and outputs. See [guardrails](#guardrails-control).

**Scientific models.** AlphaFold for protein structure (recognized with the 2024 Nobel Prize in Chemistry), weather models such as GraphCast, materials and chemistry models. See [AI for science](#ai-for-science).

```viz
{"id":"specialist-tree","component":"tree","title":"Use a specialist when the task is narrow, high-volume or needs a different modality","caption":"Expand by need.","alt":"Decision tree for choosing a specialist model over a general model.","data":"illustrative","open":1,"root":{"label":"Specialist or general model?","children":[
{"label":"Retrieval at scale","children":[{"label":"Embedding model plus reranker"}]},
{"label":"Audio in or out","children":[{"label":"Speech models, or a realtime speech model","link":"#voice-agents"}]},
{"label":"Scanned or complex documents","children":[{"label":"OCR and layout models, or a document-strong VLM","link":"#ingestion-parsing"}]},
{"label":"Safety screening","children":[{"label":"A guard model, calibrated on your data","link":"#safety-evals"}]},
{"label":"Reasoning, writing, agents","children":[{"label":"A general model","link":"#choosing-a-model"}]}]}}
```

## In practice
- Benchmark specialists on your data; general models sometimes win, sometimes lose badly.
- Mind licenses and hosting for each specialist in your pipeline.
- Re-evaluate specialists when general models improve; some specialist steps disappear.

## Numbers to know
> [!number]
> Rules of thumb. Specialist models are often far smaller and cheaper per call than general models. Embedding and reranking calls usually cost a small fraction of generation calls.

## Pitfalls and anti-patterns
> [!pitfall] A general model for every step
> Using a frontier model to embed, classify or transcribe at scale wastes money and latency.

- **Specialists without evals.** A specialist that is worse on your data is not a saving.

## Talk like an expert
The vocabulary: **embedding model**, **reranker**, **fill-in-the-middle**, **ASR** and **TTS**, **OCR**, **guard model**, **domain model**, **foundation model for science**. Experts assemble pipelines from the cheapest component that meets each step’s bar. The live debate is how many specialist steps general multimodal models will absorb.

> [!hottake] General models will absorb most specialists except retrieval and safety.
> **The counterargument:** specialists remain far cheaper and faster for high-volume narrow tasks, and domains such as biology and weather need architectures and data general models lack.

## Check yourself
```quiz
specialist-models
```

## Go deeper
- Jumper et al., “Highly accurate protein structure prediction with AlphaFold” (2021).
- Lam et al., “GraphCast” (2023); Inan et al., “Llama Guard” (2023).

## Related
- [Embeddings](#embeddings)
- [Speech and audio](#speech-audio)
- [AI for science](#ai-for-science)
- [Choosing a model](#choosing-a-model)
- [Document and screen understanding](#document-screen-understanding)
