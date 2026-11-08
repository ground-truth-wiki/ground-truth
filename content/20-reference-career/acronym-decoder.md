---
id: acronym-decoder
book: 20
order: "20.2"
title: Acronym decoder
level: foundation
stability: moving
reviewed: "2026-11"
status: full
tags: [acronyms, glossary]
visuals:
  - acronym-collisions:tree
  - acronym-families:diagram
---
> [!tldr]
> Every acronym in the Bible, expanded and linked to its Lexicon entry, generated from the Lexicon so it stays complete as terms are added. Watch for collisions: the same letters often mean different things in different corners of the field.

## Why it matters
Acronyms speed up expert conversation and lock out everyone else. Misreading one, such as ACP or RAG versus RAGAS, leads to real confusion in design reviews and documentation.

## Intuition
The decoder is a phrasebook for a field that speaks in initials.

```widget
acronyms
```

## How it works
```viz
{"id":"acronym-collisions","component":"tree","title":"Acronyms that mean different things in different places","caption":"Expand an acronym to see its meanings. Always expand on first use.","alt":"Tree of ambiguous acronyms with their different meanings.","data":"illustrative","open":1,"root":{"label":"Collisions to watch","children":[
{"label":"ACP","children":[{"label":"Agent Client Protocol (editors), Agent Communication Protocol (agents), agentic commerce protocols","link":"#protocol-soup"}]},
{"label":"SSE","children":[{"label":"Server-Sent Events in streaming; also a common abbreviation outside AI","link":"#streaming"}]},
{"label":"RL","children":[{"label":"Reinforcement learning; in papers also “RLHF”, “RLAIF”, “RLVR” variants","link":"#rl-primer"}]},
{"label":"MoE","children":[{"label":"Mixture of experts; not “mixture of embeddings”","link":"#mixture-of-experts"}]},
{"label":"CoT","children":[{"label":"Chain of thought; reasoning models’ thinking is related but not identical","link":"#reasoning-prompts"}]}]}}
```

```viz
{"id":"acronym-families","component":"diagram","title":"Acronyms cluster by layer of the stack","caption":"A few common acronyms per layer. Click a layer for its chapter.","alt":"Diagram of acronym families by layer: models, training, retrieval, agents and protocols, and serving.","data":"illustrative","w":600,"h":140,"nodes":[
{"id":"m","label":"Models","sub":"MoE, GQA, RoPE","role":"model","x":0,"y":40,"w":110,"h":60,"link":"#transformer-block"},
{"id":"t","label":"Training","sub":"SFT, DPO, RLVR","role":"agent","x":122,"y":40,"w":110,"h":60,"link":"#preference-optimization"},
{"id":"r","label":"Retrieval","sub":"RAG, BM25, ANN","role":"data","x":244,"y":40,"w":110,"h":60,"link":"#rag-fundamentals"},
{"id":"a","label":"Agents","sub":"MCP, A2A, CUA","role":"tool","x":366,"y":40,"w":110,"h":60,"link":"#mcp-architecture"},
{"id":"s","label":"Serving","sub":"TTFT, TPOT, KV","role":"context","x":488,"y":40,"w":112,"h":60,"link":"#inference-fundamentals"}],
"edges":[]}
```

**Generated.** The decoder is built from Lexicon entries that have an abbreviation, so adding a term with an acronym adds it here automatically.

## In practice
- Expand acronyms on first use in documents and slides.
- When an acronym is ambiguous, ask what it connects or does before assuming.

## Numbers to know
> [!number]
> Fact: the decoder lists every Lexicon term with an abbreviation; the count grows with the Lexicon.

## Pitfalls and anti-patterns
> [!pitfall] Inventing new acronyms in internal docs
> They make onboarding harder; prefer plain words.

## Talk like an expert
Experts expand acronyms for mixed audiences and know which ones collide. The debate here is minor: whether the field needs fewer names, not more.

> [!hottake] If an acronym needs a decoder, it should not be in your design doc.
> **The counterargument:** among specialists, well-known acronyms are faster and clearer; banning them slows expert communication.

## Check yourself
```quiz
acronym-decoder
```

## Go deeper
- The [Lexicon](#lexicon) page.

## Related
- [Lexicon](#lexicon-guide)
- [The rest of the alphabet soup](#protocol-soup)
- [Talking shop](#talking-shop)
- [How to use this Bible](#how-to-use)
- [Numbers every AI engineer should know](#numbers-to-know)
