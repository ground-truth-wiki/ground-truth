---
id: the-canon
book: 20
order: "20.5"
title: The Canon
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [papers, reading-list, history]
visuals:
  - canon-lineage:graph
  - paper-reading:tree
---
> [!tldr]
> The Canon is the reading list of papers and essays that working practitioners assume you know, in chronological order, each with why it matters. It is generated from timeline entries marked as canon and grows with the field. Read for the one idea each contributes, and verify citations before you cite them.

## Why it matters
Shared reading creates shared vocabulary and judgment. Knowing the lineage of ideas, from word vectors to attention to scale to alignment to agents, makes new papers easier to place and hype easier to spot.

## Intuition
The Canon is a family tree of ideas: each paper is a child of earlier ones, and knowing the parents explains the children.

```widget
canon
```

## How it works
```viz
{"id":"canon-lineage","component":"graph","title":"A lineage of ideas, from word vectors to reasoning models","caption":"Selected papers and how they build on each other. Click a node for the chapter where the idea is explained. Years from memory; verify before citing.","alt":"Lineage graph of influential AI papers from word2vec through the transformer, scaling laws, instruction tuning and preference optimization to reasoning models and agents.","data":"illustrative","per_row":4,"node_w":150,"nodes":[{"id":"w2v","label":"word2vec (2013)","link":"#representation-learning"},{"id":"attn","label":"Neural attention (2014)","link":"#attention"},{"id":"tf","label":"Transformer (2017)","link":"#transformer-block"},{"id":"bert","label":"BERT and GPT (2018)","link":"#pretraining-data"},{"id":"scal","label":"Scaling laws (2020)","link":"#scaling-laws"},{"id":"gpt3","label":"GPT-3, in-context learning (2020)","link":"#prompting-fundamentals"},{"id":"rag","label":"RAG (2020)","link":"#rag-fundamentals"},{"id":"chin","label":"Chinchilla (2022)","link":"#scaling-laws"},{"id":"ift","label":"InstructGPT, RLHF (2022)","link":"#preference-optimization"},{"id":"cot","label":"Chain of thought (2022)","link":"#reasoning-prompts"},{"id":"react","label":"ReAct (2022)","link":"#agent-loop"},{"id":"dpo","label":"DPO (2023)","link":"#preference-optimization"},{"id":"r1","label":"Reasoning via RL (2024–2025)","link":"#rlvr-reasoning"},{"id":"agents","label":"Agents and MCP (2024–2025)","link":"#mcp-architecture"}],"edges":[["w2v","attn"],["attn","tf"],["tf","bert"],["bert","scal"],["bert","gpt3"],["bert","rag"],["scal","chin"],["gpt3","ift"],["gpt3","cot"],["cot","react"],["ift","dpo"],["cot","r1"],["react","agents"]]}
```

```viz
{"id":"paper-reading","component":"tree","title":"Read a canon paper in twenty minutes","caption":"Expand each step.","alt":"Tree of steps for reading a research paper quickly: abstract, figures, method, results and the one idea.","data":"illustrative","open":1,"root":{"label":"Reading a paper","children":[
{"label":"Abstract and conclusion","children":[{"label":"What problem, what claim?"}]},
{"label":"Figures and tables","children":[{"label":"What evidence supports the claim?"}]},
{"label":"Method","children":[{"label":"What is new, in one sentence?"}]},
{"label":"Limits","children":[{"label":"What did the authors not test?"}]},
{"label":"The one idea","children":[{"label":"Write it down; link it to a chapter here"}]}]}}
```

## In practice
- Read one canon paper a week; write its one idea in your own words.
- Use the Canon to fill gaps when a chapter cites something unfamiliar.

## Numbers to know
> [!number]
> Fact: the Canon is generated from timeline entries marked canon; its count grows with each version.

## Pitfalls and anti-patterns
> [!pitfall] Citing from memory
> Titles, authors and years drift in memory; check the original before citing.

## Talk like an expert
Experts place new work in the lineage: “this is DPO applied to agents” or “this is Chinchilla for inference”. The debate is which recent work will join the Canon.

> [!hottake] You can skip most papers and still be a strong AI engineer, but not these.
> **The counterargument:** practice changes faster than papers; blog posts, specifications and changelogs teach much of what engineers actually use.

## Check yourself
```quiz
the-canon
```

## Go deeper
- The [Timeline](#genesis), which the Canon is drawn from.

## Related
- [Lessons from public engineering write-ups](#public-writeups)
- [Who’s who and where to learn](#whos-who)
- [Talking shop](#talking-shop)
- [Watchlist](#watchlist)
- [How to use Ground Truth](#how-to-use)
- [A short history of AI](#history-of-ai)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [How AI research is published: arXiv, conferences and peer review](#ai-research-publishing)
