---
id: frontier-families
book: 4
order: "4.1"
title: Frontier model families
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [models, landscape, open-weights]
visuals:
  - family-map:matrix
  - tier-diagram:diagram
---
> [!tldr]
> A handful of labs ship frontier model families in tiers, from large flagship models to fast, cheap small ones, increasingly with reasoning built in. Open-weight families from several labs trail the frontier closely. Model lineups change every few months, so choose by evals on your tasks, not by brand. A dated snapshot as of November 2026.

## Why it matters
Model choice affects quality, cost, latency, data terms and the ecosystem you build on. Knowing the families and their tiers lets you shortlist quickly and understand announcements. The specifics go stale fast; the structure lasts longer.

## Intuition
Model families are like car lineups: each maker offers a flagship, a mid-range workhorse and an economy model, refreshed on a cycle. Comparing makers by their flagships tells you little about which car suits your commute.

```viz
{"id":"family-map","component":"matrix","matrix":"model-families","title":"Major model families by developer, tiers and openness","caption":"Filter by a word such as “open”. Dated snapshot; only Anthropic’s current names are verified for November 2026. Check each developer’s current lineup.","alt":"Table of major model families with their developers, tiers, openness and notes.","data":"illustrative","depicts":"As of November 2026"}
```

## How it works
**Tiers.** Most families offer a large model for the hardest tasks, a balanced mid-size model for most work, and small, fast models for high-volume and latency-sensitive tasks:

```viz
{"id":"tier-diagram","component":"diagram","title":"Each family offers a ladder of tiers: capability up, price and speed down","caption":"The usual shape of a lineup. Routing between tiers is often the biggest cost lever. Click a tier for related chapters.","alt":"Diagram of model tiers from small and fast to large and capable, with typical uses for each.","data":"illustrative","w":600,"h":140,"nodes":[
{"id":"small","label":"Small and fast","sub":"routing, extraction, autocomplete","role":"tool","x":0,"y":40,"w":180,"h":60,"link":"#small-local-models"},
{"id":"mid","label":"Mid-size workhorse","sub":"most product tasks","role":"model","x":210,"y":40,"w":180,"h":60,"link":"#choosing-a-model"},
{"id":"large","label":"Large flagship","sub":"hard reasoning, long agentic work","role":"agent","x":420,"y":40,"w":180,"h":60,"link":"#reasoning-models"}],
"edges":[{"from":"small","to":"mid","label":"escalate"},{"from":"mid","to":"large","label":"escalate"}]}
```

**Closed frontier labs.** Anthropic (Claude), OpenAI (GPT) and Google DeepMind (Gemini) lead most frontier benchmarks and offer APIs, consumer apps and enterprise platforms. As of November 2026, Anthropic’s public models are Claude Opus 5.5, Sonnet 5.5 and Haiku 5.5, plus Claude Fable 5.1 in the Mythos tier with additional safeguards; a Mythos Preview model is available only to selected organizations (verified Nov 2026).

**Open-weight families.** Meta (Llama), DeepSeek, Alibaba (Qwen), Mistral, Google (Gemma), OpenAI (gpt-oss, 2025), Moonshot (Kimi), Zhipu (GLM), Microsoft (Phi), NVIDIA (Nemotron) and others release weights under various licenses. See [the open-weight frontier](#open-weight-frontier).

**What differs between families.** Strengths by task (coding, long context, multimodal, multilingual), reasoning controls, tool-use reliability, context length, pricing, data terms, regional availability and safety behavior. See [model-specific notes](#model-specific-notes).

## In practice
- Shortlist two or three families that meet your hard constraints (data terms, regions, modalities).
- Evaluate their mid-tier models first on your tasks; move up or down tiers from there. See [choosing a model](#choosing-a-model).
- Route through a gateway so switching families is a configuration change. See [gateways and routers](#gateways-routers).
- Revisit every few months; lineups and prices change quickly.

## Numbers to know
> [!number]
> Rules of thumb. Major families typically refresh at least once or twice a year, with point releases in between. Price differences between tiers in one family often span more than an order of magnitude.

## Pitfalls and anti-patterns
> [!pitfall] Choosing by the flagship’s benchmark headline
> The model you will actually deploy is often a smaller tier, judged on your tasks.

- **Pinning to aliases.** Use dated versions in production. See [prompt management](#prompt-config-management).
- **Assuming last year’s ranking holds.** Leadership changes by task and by month.

## Talk like an expert
The vocabulary: **model family**, **tier**, **flagship**, **point release**, **open weights**, **license**, **model card**, **system card**. Experts compare families tier by tier on their own evals and track release notes. The live debate is how long closed labs keep their lead over open-weight models, and whether the gap matters for most applications.

> [!hottake] For most applications, the mid tier of any top family is good enough, and the choice is about cost, terms and ecosystem.
> **The counterargument:** for agentic, long-horizon and hard reasoning tasks, flagship models still succeed markedly more often, and those tasks are where much of the new value is.

## Check yourself
```quiz
frontier-families
```

## Go deeper
- Each developer’s current model overview, model cards and system cards.
- This Bible’s [state-of-the-art snapshot](#sota-snapshot) for a dated view.

## Related
- [Choosing a model](#choosing-a-model)
- [Reasoning models and test-time compute](#reasoning-models)
- [Small and local models](#small-local-models)
- [The open-weight frontier](#open-weight-frontier)
- [Benchmark literacy](#benchmark-literacy)
