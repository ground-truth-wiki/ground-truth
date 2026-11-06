---
id: talking-shop
book: 20
order: "20.7"
title: Talking shop
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [expert, questions, hot-takes]
visuals:
  - debate-map:graph
  - red-flags:compare
---
> [!tldr]
> Talking shop means framing problems the way experts do (layer first, eval first, cost and latency always), knowing the hard questions and their strong answers, holding hot takes with their counterarguments, and recognizing the red flags of shallow knowledge. Fifty hard questions with short answers follow.

## Why it matters
Interviews, design reviews and conference conversations reward precise framing and honest uncertainty. Practicing the hard questions builds the reflexes that make you useful in the room.

## Intuition
Talking shop is a jam session: you need the standard tunes (the hard questions), your own phrasing (the framing), and the confidence to say “I don’t know, but here is how I would find out”.

```viz
{"id":"debate-map","component":"graph","title":"Live debates and how they connect","caption":"Each node is a debate Ground Truth covers with arguments on both sides. Click to read it.","alt":"Graph of connected AI debates: scaling, reasoning, agents versus workflows, RAG versus long context, open versus closed, and safety frameworks.","data":"illustrative","per_row":3,"node_w":180,"nodes":[{"id":"scale","label":"Does scaling continue?","link":"#scaling-laws"},{"id":"reason","label":"Do models really reason?","link":"#reasoning-models"},{"id":"agents","label":"Agents or workflows?","link":"#what-is-an-agent"},{"id":"rag","label":"RAG or long context?","link":"#long-context"},{"id":"open","label":"Open or closed?","link":"#open-weight-frontier"},{"id":"safety","label":"Voluntary or legal safety rules?","link":"#frontier-safety-frameworks"}],"edges":[["scale","reason"],["reason","agents"],["scale","open"],["open","safety"],["agents","rag"]]}
```

## How it works
**How experts frame problems.** Which layer is this? What is the eval? What does it cost and how fast is it? What is in the context when it fails? What can a manipulated model reach?

**Hot takes with counterarguments.** Every chapter ends with one; the [Debates](#apocrypha) page collects them.

**Red flags of shallow knowledge.**

```viz
{"id":"red-flags","component":"compare","title":"Shallow and deep answers to the same question","caption":"“How would you improve our RAG system’s answers?” Hover the marks.","alt":"Comparison of a shallow and a deep answer to a RAG improvement question.","data":"illustrative","mono":false,"a":{"title":"Shallow","text":"Use a better model and a bigger context window, and add an agent to search more.","mono":false},"b":{"title":"Deep","text":"First I would read 50 failing answers and check retrieval recall separately from faithfulness. If recall is low, add hybrid search and reranking; if faithfulness is low, quote extraction and citation checks. Then measure the change on a labeled set.","mono":false},"links":[{"a":"Use a better model","b":"read 50 failing answers","note":"Diagnosis before prescription."},{"b":"check retrieval recall separately from faithfulness","note":"Separating causes is the expert move."},{"b":"measure the change on a labeled set","note":"Every claim gets an eval."}]}
```

## In practice: fifty hard questions

**Models and inference**
1. **Why is decode memory-bound and prefill compute-bound?** Decode reads all weights to produce one token per sequence; prefill processes many tokens per weight read. See [inference fundamentals](#inference-fundamentals).
2. **Why does batching raise throughput but lower per-user speed?** Weight reads are shared, but each step does more work and reads more KV cache.
3. **What sets KV cache size?** 2 × layers × KV heads × head dimension × bytes × tokens × sequences. See [memory math](#memory-math).
4. **Why do MoE models need more memory than their compute suggests?** All experts must be resident; only a few run per token.
5. **When does quantization hurt?** Below about 4 bits, on small models, and on long-context and reasoning tasks; measure.
6. **Why does speculative decoding not change outputs?** Verification accepts drafts in a way that preserves the target distribution.
7. **What does RoPE scaling do?** Rescales rotation frequencies so a model handles longer contexts than it was trained on.
8. **Why test effective context?** Models use positions unevenly; a window is not a guarantee.
9. **What does 6ND mean?** Training FLOPs ≈ 6 × parameters × tokens.
10. **Why do labs overtrain small models?** Cheaper inference over billions of calls outweighs extra training compute.

**Retrieval and context**
11. **When does RAG beat long context?** Large, changing or permission-controlled corpora, and when cost, speed or citations matter.
12. **Why add keyword search to vectors?** Embeddings blur exact identifiers and rare terms. See [hybrid retrieval](#hybrid-retrieval).
13. **What does a reranker fix?** Precision at the top, by reading query and passage together.
14. **Why evaluate retrieval separately?** To tell a retrieval miss from a generation error.
15. **What breaks permission-aware RAG?** Filtering after retrieval and stale access lists.
16. **Why does contextual chunking help?** Chunks keep the document context they lose when split. See [chunking](#chunking).
17. **What does prompt caching require?** Byte-identical prefixes, with variable content last.
18. **How is context engineering more than prompting?** It manages everything the model sees across many turns: selection, compression, order and isolation.
19. **When should an agent compact context?** Near limits, keeping goals, decisions and next steps, with a tested summary.
20. **Why do subagents help?** They work in fresh windows and return summaries, keeping the main context clean.

**Agents and tools**
21. **When do you need an agent?** When steps cannot be predicted in advance and outcomes can be checked; otherwise use a workflow.
22. **What breaks when you add a second agent?** Shared context, conflicting decisions, coordination overhead and cost. See [multi-agent systems](#multi-agent).
23. **Why are tool descriptions prompts?** The model reads them on every call to decide what to use.
24. **Why can’t you filter prompt injection away?** Instructions and data share one channel and filters are probabilistic; limit what a manipulated model can reach.
25. **What is the lethal trifecta?** Private data, untrusted content and external communication in one agent.
26. **How do you stop runaway agents?** Budgets, loop detection and kill switches enforced in code.
27. **Why must agent tools be idempotent?** Retries and resumes must not repeat side effects.
28. **What changed in MCP 2026-07-28?** Stateless requests, multi round-trip input, subscriptions/listen and a tasks extension (verified Nov 2026).
29. **When should a tool be an MCP server?** When several hosts need it.
30. **Why does pass^k matter?** It measures whether an agent succeeds every time, which is what users experience.

**Evals and quality**
31. **Why start with error analysis?** Useful metrics come from failures you have actually seen. See [error analysis](#error-analysis).
32. **How do you trust an LLM judge?** Calibrate it against human labels and test for known biases.
33. **Why report confidence intervals?** Small differences on small sets are noise.
34. **Why paired comparisons?** They remove variation between easy and hard cases.
35. **What is contamination?** Test items in training data inflating scores.
36. **Why slice results?** Averages hide the regressions that matter.
37. **What must a safety suite include besides harm?** Over-refusal on legitimate requests.
38. **How do you evaluate agents?** Final-state checks, trajectory rules and multiple attempts.
39. **Why evaluate online too?** Real traffic differs from eval sets and drifts.
40. **Why version prompts with evals?** Every prompt change is a deploy.

**Production and strategy**
41. **Why a model gateway?** Central routing, fallbacks, keys, caching and cost accounting.
42. **What is cost per correct answer?** Cost plus failure handling, divided by accuracy.
43. **When does self-hosting pay?** At high, steady volume with good utilization.
44. **Why pin model versions?** Aliases change behavior without your evals.
45. **What usually blocks enterprise AI?** Permissions, data governance and security review.
46. **Why do AI incidents return HTTP 200?** Quality failures do not raise errors; monitor quality.
47. **What should every AI feature ship with?** Evals, monitoring and an off switch.
48. **How do you estimate agent cost?** Users × tasks × calls × tokens × price, adjusted for caching.
49. **What is the durable asset when models are commodities?** Data, evals and integrations.
50. **What would change your architecture?** New evidence: eval results, cost, constraints, recorded in decision records.

## Numbers to know
> [!number]
> Rule of thumb: a strong answer to any hard question names the layer, the eval, the cost and the failure mode.

## Pitfalls and anti-patterns
> [!pitfall] Confident answers without evidence
> “It depends, and here is how I would measure it” beats a confident guess.

## Talk like an expert
Experts frame before answering, cite evidence, and hold opinions loosely. The live debates are mapped above; each chapter gives both sides.

> [!hottake] The best signal of expertise is knowing what you would measure.
> **The counterargument:** experience also shows in fast, correct intuitions; measurement is how experts check them, not a replacement.

## Check yourself
```quiz
talking-shop
```

## Go deeper
- The [Debates](#apocrypha) page and every chapter’s “Talk like an expert” section.

## Related
- [Interview prep](#interview-prep)
- [Glossary](#lexicon-guide)
- [The Canon](#the-canon)
- [Open problems and big debates](#open-problems)
- [Decision guides](#decision-guides)
