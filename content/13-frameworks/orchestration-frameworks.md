---
id: orchestration-frameworks
book: 13
order: "13.3"
title: Orchestration frameworks
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [langgraph, llamaindex, crewai]
visuals:
  - framework-matrix:matrix
  - graph-run:stepper
---
> [!tldr]
> Orchestration frameworks give you building blocks for multi-step AI applications: graphs of steps with shared state, checkpoints and human interrupts, retrieval pipelines, multi-agent teams and integrations. LangGraph, LlamaIndex, CrewAI, Microsoft’s Agent Framework, Pydantic AI, Mastra, the Vercel AI SDK, Haystack and DSPy each embody a different philosophy.

## Why it matters
Beyond a single agent loop, real applications need branching, retries, persistence across crashes, human approvals, parallel steps and dozens of integrations. Frameworks provide these, at the cost of abstractions you must learn and debug. Choosing one that matches your application’s shape saves months; choosing one that does not adds friction to every change.

## Intuition
An orchestration framework is a railway network: tracks (the graph), stations (steps), signals (conditions), timetables (state) and a control room (tracing). You can run trains without one, but at scale you want the network.

```viz
{"id":"framework-matrix","component":"matrix","matrix":"agent-frameworks","title":"Orchestration and agent frameworks by style, language and best fit","caption":"Sortable and filterable. Qualitative and dated as of November 2026; frameworks change quickly.","alt":"Table comparing orchestration and agent frameworks by style, language and best fit.","data":"illustrative","depicts":"As of November 2026"}
```

## How it works
**Graph and state frameworks.** LangGraph models an application as a graph of nodes that read and write shared state, with checkpointing after each step, so runs can pause for human input, resume after crashes and be replayed. Microsoft’s Agent Framework, which brought AutoGen and Semantic Kernel together in 2025, offers workflows and multi-agent patterns for .NET and Python.

```viz
{"id":"graph-run","component":"stepper","title":"A graph run checkpoints its state after every step, so it can pause for a human and resume later","caption":"An illustrative retrieve-grade-generate graph with a rewrite loop and an approval interrupt. Nodes that run in parallel share one step and one checkpoint.","alt":"Stepper through a stateful graph run: retrieve, grade, rewrite and retrieve again, generate, pause for human approval, resume and finish.","data":"illustrative","diagram":{"w":600,"h":150,"nodes":[{"id":"retrieve","label":"Retrieve","role":"data","x":0,"y":0,"w":120,"h":52},{"id":"grade","label":"Grade","role":"model","x":160,"y":0,"w":120,"h":52},{"id":"rewrite","label":"Rewrite query","role":"model","x":160,"y":98,"w":120,"h":52},{"id":"generate","label":"Generate","role":"model","x":320,"y":0,"w":120,"h":52},{"id":"approve","label":"Approval","role":"human","x":480,"y":0,"w":120,"h":52,"link":"#human-in-the-loop"},{"id":"store","label":"Checkpoint store","role":"data","x":400,"y":98,"w":200,"h":52,"link":"#long-running-agents"}],"edges":[{"from":"retrieve","to":"grade"},{"from":"grade","to":"rewrite","label":"poor"},{"from":"rewrite","to":"retrieve","curve":30},{"from":"grade","to":"generate","label":"good"},{"from":"generate","to":"approve"},{"from":"generate","to":"store","style":"dashed"}]},
"frames":[
{"label":"Retrieve","highlight":["retrieve"],"caption":"The first node retrieves passages and writes them into the shared state; the state is checkpointed."},
{"label":"Grade","highlight":["grade"],"caption":"A grading node finds the passages do not answer the question and routes to the rewrite node."},
{"label":"Rewrite","highlight":["rewrite","retrieve"],"edges":["rewrite>retrieve"],"caption":"The query is rewritten and retrieval runs again; this time the grade is good."},
{"label":"Generate","highlight":["generate","store"],"caption":"The answer is drafted and saved in the checkpoint store with the full state."},
{"label":"Interrupt","highlight":["approve"],"caption":"The graph pauses at the approval node. The process can exit; nothing is lost."},
{"label":"Resume","highlight":["approve","store"],"caption":"Hours later the reviewer approves. The run resumes from the checkpoint and finishes."}]}
```

**Data and RAG frameworks.** LlamaIndex and Haystack focus on ingestion, indexing, retrieval and query pipelines, with agents built on top. See [RAG fundamentals](#rag-fundamentals).

**Multi-agent frameworks.** CrewAI organizes agents into crews with roles and tasks; several frameworks provide group chats and handoffs. See [multi-agent systems](#multi-agent).

**Typed and lightweight frameworks.** Pydantic AI brings type-checked agents and structured outputs to Python; Hugging Face’s smolagents favors agents that act by writing code; AWS’s Strands Agents is a model-driven agent toolkit.

**TypeScript.** The Vercel AI SDK provides streaming, tool calling and UI integration across providers; Mastra adds agents, workflows and memory. See [streaming](#streaming).

**Programming models.** DSPy treats pipelines as programs whose prompts are optimized against metrics. See [prompt optimization](#prompt-optimization).

## In practice
Selection questions:
1. **Shape:** a single agent, a branching workflow, a RAG pipeline or a team of agents?
2. **State:** do runs need to survive crashes, pause for people or run for hours?
3. **Language:** Python, TypeScript, .NET or Java?
4. **Transparency:** can you see and change every prompt and call?
5. **Ecosystem:** integrations, observability, community, maintenance pace.
6. **Exit cost:** how hard is it to move off later?

Prototype the same small task in your two finalists, with tracing on, and read what each sends to the model. See [selection guide](#framework-selection).

## Numbers to know
> [!number]
> Rules of thumb. A one-day prototype in two candidate frameworks usually reveals the right choice. Pin framework versions; major releases often change core abstractions.

## Pitfalls and anti-patterns
> [!pitfall] Hidden prompts
> Many frameworks inject their own system prompts and formatting. If you cannot see them in traces, you cannot debug quality problems.

- **Multi-agent by default.** Most problems need one agent or a workflow. See [workflow patterns](#workflow-patterns).
- **Framework state as your only state.** Keep business data in your own stores.
- **Chasing every release.** Upgrade deliberately, with evals.

## Talk like an expert
The vocabulary: **graph**, **node**, **shared state**, **checkpointer**, **interrupt**, **crew**, **handoff**, **pipeline**, **typed agent**. Experts describe frameworks by their state model and transparency, not their feature lists. The live debate is whether durable workflow engines and agent SDKs squeeze general orchestration frameworks from both sides.

> [!hottake] The most valuable framework feature is a checkpointer you can trust.
> **The counterargument:** for short, interactive tasks, checkpointing adds complexity and latency for little benefit; integrations and developer experience matter more there.

## Check yourself
```quiz
orchestration-frameworks
```

## Go deeper
- LangGraph, LlamaIndex, CrewAI, Microsoft Agent Framework, Pydantic AI, Mastra and Vercel AI SDK documentation.
- The [framework anti-patterns](#framework-anti-patterns) chapter.

## Related
- [The landscape map](#framework-landscape)
- [Workflow patterns](#workflow-patterns)
- [Multi-agent systems](#multi-agent)
- [Long-running and durable agents](#long-running-agents)
- [Selection guide and matrix](#framework-selection)
- [Multi-agent orchestration patterns](#multi-agent-patterns)
- [Agent SDK primitives: runners, tools, guardrails, sessions and tracing](#agent-sdk-primitives)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Graph workflow runtimes: state, super-steps and checkpoints](#graph-workflow-runtimes)
- [AI frameworks beyond Python: TypeScript, Java, .NET and Go](#frameworks-beyond-python)
