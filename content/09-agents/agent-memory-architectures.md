---
id: agent-memory-architectures
book: 9
order: "9.6.1"
title: Agent memory architectures and benchmarks
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [agent-memory, memgpt, knowledge-graphs, memory-benchmarks, consolidation]
visuals: []
prerequisites: [agent-memory]
---
> [!tldr]
> Agent memory systems differ less in their stores than in their policies: what gets written, when, how conflicts are resolved and how memories come back. MemGPT pages context between tiers, Generative Agents scores and reflects on a memory stream, Mem0 extracts and consolidates facts, Zep keeps a temporal knowledge graph, and Claude's memory tool hands the agent a directory of files. Benchmarks such as LoCoMo and LongMemEval each test a different slice of memory, so pick the one that matches the failure you fear.

## Key ideas

- **One vocabulary, many systems.** The working, episodic, semantic and procedural memory of the CoALA framework give a shared vocabulary for comparing systems ([Sumers et al., “Cognitive Architectures for Language Agents” (2023)](https://arxiv.org/abs/2309.02427); see [the research lineage](#agent-research-lineage)). MemGPT treats the prompt as main context (read-only system instructions, a writable working context, and a FIFO message queue headed by a recursive summary of evicted messages) and keeps recall storage (the message database) and archival storage outside it, moving data between tiers through function calls the LLM issues, much as an operating system pages memory ([Packer et al., “MemGPT: Towards LLMs as Operating Systems” (2023)](https://arxiv.org/abs/2310.08560)).
- **The memory stream and its retrieval score.** Generative Agents store every observation in natural language and rank memories by recency (exponential decay over game hours since the memory was last retrieved, factor 0.995), importance (an LLM rating from 1 to 10 when the memory is created) and relevance (embedding cosine similarity), each min-max scaled and summed with all weights set to 1. When the importance of recent events adds up past a threshold (150 in the paper), agents write higher-level reflections that are stored and retrieved like any other memory ([Park et al., “Generative Agents” (2023)](https://arxiv.org/abs/2304.03442)).
- **Write policy: profile or collection, hot path or background.** LangChain's memory guide contrasts a single profile document, which gets error-prone to update as it grows, with a collection of narrow memories, which tends to recall better but makes updating and deleting items tricky; it also contrasts writing memories in the hot path (immediate and visible, but adding latency) with writing them in a background task (no added latency, but other threads may miss fresh memories). Sleep-time compute pushes background work further, letting a model think about a context before queries arrive ([LangChain, “Memory overview”](https://docs.langchain.com/oss/python/concepts/memory); [Lin et al., “Sleep-time Compute” (2025)](https://arxiv.org/abs/2504.13171)).
- **Consolidation: update, delete or invalidate.** Mem0 extracts candidate facts from each new exchange using a rolling summary and recent messages, then retrieves similar memories and lets the LLM choose ADD, UPDATE, DELETE or NOOP; its graph variant marks contradicted relationships invalid instead of removing them. Zep's Graphiti goes further with a bi-temporal knowledge graph: every fact edge records when it held true and when the system learned or retired it, and a contradicting fact closes the old edge's validity window instead of deleting it, so the history stays queryable ([Chhikara et al., “Mem0” (2025)](https://arxiv.org/abs/2504.19413); [Rasmussen et al., “Zep: A Temporal Knowledge Graph Architecture for Agent Memory” (2025)](https://arxiv.org/abs/2501.13956)).
- **Procedural memory, files, and the duty to forget.** Voyager learns procedural memory as a growing library of executable code skills it retrieves for new tasks, and Claude's memory tool gives the agent a `/memories` directory whose operations your application executes client-side. As of November 2026, Anthropic's documentation requires validating every path to block traversal such as `/memories/../../secrets.env`, and recommends stripping sensitive data, capping file sizes and deleting files that have not been accessed in a long time ([Wang et al., “Voyager” (2023)](https://arxiv.org/abs/2305.16291); [Anthropic, “Memory tool”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool)).
- **What the benchmarks test, and what they miss.** Deep Memory Retrieval (DMR) asks a question that refers back to an earlier conversation and has a narrow answer, but Zep's authors note its conversations contain only 60 messages and fit easily in current context windows; LoCoMo has about 300 turns and 9,000 tokens over up to 35 sessions per conversation, with question answering, event summarization and multimodal dialogue tasks; LongMemEval's 500 questions test extraction, multi-session reasoning, temporal reasoning, knowledge updates and abstention, in histories of about 115,000 tokens (LongMemEval_S) or about 1.5 million (LongMemEval_M). Mem0's and Zep's results on these benchmarks come from the teams that built those systems, so treat them as claims to reproduce ([Packer et al. (2023)](https://arxiv.org/abs/2310.08560); [Rasmussen et al. (2025)](https://arxiv.org/abs/2501.13956); [Maharana et al., “Evaluating Very Long-Term Conversational Memory of LLM Agents” (2024)](https://arxiv.org/abs/2402.17753); [Wu et al., “LongMemEval” (2024)](https://arxiv.org/abs/2410.10813)).

## Planned visuals

- **`diagram`** with variants: the four CoALA memory types as fixed slots, and how MemGPT, Generative Agents, Mem0, Zep and a file-based memory tool fill them, with write and read arrows for each.
- **`calculator`** (formula): the Generative Agents retrieval score, with inputs for hours since last access, importance and cosine similarity, the 0.995 decay factor and the three weights, so readers see when an old but important memory beats a fresh trivial one.
- **`sequence`:** one new fact flowing through Mem0's extract-and-update pipeline (ADD, UPDATE, DELETE or NOOP), with a variant showing Zep closing the validity window of a contradicted edge instead of deleting it.

## Talk like an expert

Practitioners talk about the **write path** and **read path**, **hot-path** versus **background** writes, **consolidation**, **bi-temporal validity** and **abstention**. They ask which memory type a product actually implements, and which ability (temporal reasoning, knowledge updates or abstention) it was tested on, before trusting a headline score.

## Go deeper

- [Packer et al., “MemGPT: Towards LLMs as Operating Systems” (2023)](https://arxiv.org/abs/2310.08560): memory tiers, function-call paging and the DMR task.
- [Park et al., “Generative Agents: Interactive Simulacra of Human Behavior” (2023)](https://arxiv.org/abs/2304.03442): the memory stream, retrieval score and reflection.
- [Wu et al., “LongMemEval: Benchmarking Chat Assistants on Long-Term Interactive Memory” (2024)](https://arxiv.org/abs/2410.10813): five memory abilities and an indexing, retrieval and reading framework; ICLR 2025.
- [Anthropic, “Memory tool”](https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool): a file-based, client-side memory interface and its security guidance.

## Related

- [Memory](#agent-memory)
- [Language agents: research lineage and the CoALA framework](#agent-research-lineage)
- [Context engineering](#context-engineering)
- [Long-running and durable agents](#long-running-agents)
- [Personal and ambient assistants](#personal-assistants)
- [Knowledge graphs and ontologies](#knowledge-graphs)
