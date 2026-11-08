---
id: ai-for-science
book: 19
order: "19.7"
title: AI for science, math and code
level: frontier
stability: volatile
reviewed: "2026-11"
status: full
tags: [science, math, theorem-proving]
visuals:
  - science-map:diagram
  - science-tree:tree
---
> [!tldr]
> AI has produced landmark scientific results: protein structure prediction (AlphaFold, recognized with the 2024 Nobel Prize in Chemistry), weather forecasting, materials discovery, olympiad-level mathematics and algorithm discovery. Progress is fastest where data is abundant and results can be checked automatically.

## Why it matters
Science is where AI’s value may be largest, and its methods (verifiers, simulators, search) mirror those of reasoning and agentic AI. Engineers increasingly build tools for scientists and learn from how scientific AI handles verification.

## Intuition
AI for science works best where nature or mathematics grades the answer: a protein structure can be checked against experiments, a proof can be checked by a proof assistant, a forecast can be checked tomorrow.

```viz
{"id":"science-map","component":"diagram","title":"The common pattern: a model proposes, a checker verifies, scientists decide","caption":"Simplified. The checker can be an experiment, a simulator or a proof assistant.","alt":"Diagram of AI for science: data trains a model that proposes candidates, a checker verifies them, and scientists interpret and act.","data":"illustrative","w":600,"h":150,"nodes":[
{"id":"data","label":"Data and simulators","role":"data","x":0,"y":47,"w":140,"h":56},
{"id":"model","label":"Model proposes","sub":"structures, proofs, candidates","role":"model","x":160,"y":47,"w":150,"h":56},
{"id":"check","label":"Checker","sub":"experiment, proof assistant","role":"tool","x":330,"y":47,"w":130,"h":56,"link":"#rlvr-reasoning"},
{"id":"sci","label":"Scientists","role":"human","x":480,"y":47,"w":120,"h":56}],
"edges":[{"from":"data","to":"model"},{"from":"model","to":"check"},{"from":"check","to":"sci"},{"from":"check","to":"model","label":"feedback","curve":40}]}
```

## How it works
```viz
{"id":"science-tree","component":"tree","title":"Landmarks in AI for science, by field","caption":"Expand a field. Dates are first major publications.","alt":"Tree of AI for science landmarks in biology, weather, materials, mathematics and algorithms.","data":"illustrative","open":1,"root":{"label":"AI for science landmarks","children":[
{"label":"Biology","children":[{"label":"AlphaFold 2 (2020–2021) predicted protein structures at near-experimental accuracy; the 2024 Nobel Prize in Chemistry recognized this work and computational protein design","link":"#specialist-models"}]},
{"label":"Weather","children":[{"label":"Learned models such as GraphCast (2023) rival traditional numerical forecasts at far lower cost"}]},
{"label":"Materials","children":[{"label":"GNoME (2023) proposed hundreds of thousands of potentially stable crystal structures"}]},
{"label":"Mathematics","children":[{"label":"AlphaProof and AlphaGeometry reached silver-medal level at the 2024 IMO; gold-medal-level results followed in 2025","link":"#reasoning-models"}]},
{"label":"Algorithms","children":[{"label":"FunSearch (2023) and AlphaEvolve (2025) discovered improved algorithms with evolutionary search over code","link":"#self-improving-systems"}]}]}}
```

**Why verification matters.** The strongest results pair generation with rigorous checking: experimental validation, formal proof assistants such as Lean, or physics simulators. Without them, models produce plausible but wrong science.

**Research assistants.** Literature review, hypothesis generation and experiment design with agents are growing quickly, with the same citation and verification caveats as [deep research](#deep-research).

## In practice
- For scientific tools, build the checker first and make uncertainty visible.
- Treat generated hypotheses and citations as leads, not results.

## Numbers to know
> [!number]
> Facts: AlphaFold’s developers shared the 2024 Nobel Prize in Chemistry; AI systems reached silver-medal level at the 2024 International Mathematical Olympiad and gold-medal level in 2025.

## Pitfalls and anti-patterns
> [!pitfall] Publishing AI-generated findings without independent verification
> Fluent, plausible science is not validated science.

## Talk like an expert
The vocabulary: **structure prediction**, **learned simulator**, **formal verification**, **proof assistant**, **candidate generation**, **experimental validation**. Experts ask how a result was verified. The live debate is how much AI can do autonomous science versus accelerate human scientists.

> [!hottake] AI’s biggest long-term impact will be in science, not chat.
> **The counterargument:** scientific progress is bottlenecked by experiments, funding and institutions as much as ideas, which limits how fast AI alone can accelerate it.

## Check yourself
```quiz
ai-for-science
```

## Go deeper
- Jumper et al., “Highly accurate protein structure prediction with AlphaFold” (2021).
- Lam et al., “GraphCast” (2023); Merchant et al., “Scaling deep learning for materials discovery” (2023).

## Related
- [Self-improving and automated research systems](#self-improving-systems)
- [Specialist models](#specialist-models)
- [Reasoning models and test-time compute](#reasoning-models)
- [Deep research systems](#deep-research)
- [Open problems and big debates](#open-problems)
- [Graph neural networks](#graph-neural-networks)
- [Evolutionary program search with LLMs](#evolutionary-program-search)
- [AI scientist agents and autonomous labs](#ai-scientist-agents)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [AI for mathematics and formal theorem proving](#ai-for-mathematics)
- [AI for biology: proteins, design and genomic models](#ai-for-biology)
- [AI for weather, climate and materials](#ai-for-physical-sciences)
