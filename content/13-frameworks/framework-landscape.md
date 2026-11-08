---
id: framework-landscape
book: 13
order: "13.1"
title: The landscape map
level: practitioner
stability: volatile
reviewed: "2026-11"
status: full
tags: [frameworks, sdks, landscape]
visuals:
  - framework-map:diagram
  - layer-chooser:tree
---
> [!tldr]
> AI application tooling stacks in layers: provider APIs and SDKs at the bottom, agent SDKs that package a harness, orchestration frameworks for workflows and multi-agent systems, low-code builders on top, with gateways, eval and observability tools alongside. Pick the lowest layer that does the job, and keep your prompts, evals and data portable across layers.

## Why it matters
Hundreds of frameworks compete for the same jobs, and they rise and fall quickly. Teams lose months adopting a framework that hides what they need to see, or rebuilding what an SDK already provides. A map of the layers turns “which framework?” into the better question: “which layer of abstraction does this problem need?”

## Intuition
Think of building a house. You can buy bricks (raw APIs), a prefabricated wall system (agent SDKs), a full kit house with plumbing laid out (orchestration frameworks), or a model home you customize from a catalog (low-code builders). Each saves work and removes choices.

```viz
{"id":"framework-map","component":"diagram","title":"Four layers of abstraction, from raw API calls to visual builders","caption":"Higher layers save work and hide decisions. Click a layer for its chapter. Gateways, evals and observability work across all layers.","alt":"Layered diagram of AI tooling: low-code builders, orchestration frameworks, agent SDKs and provider APIs and SDKs.","data":"illustrative","w":560,"layer_h":48,"layers":[
{"id":"lowcode","label":"Low-code and visual builders","sub":"workflows assembled in a UI","role":"human","link":"#low-code-builders"},
{"id":"orch","label":"Orchestration frameworks","sub":"graphs, workflows, multi-agent, RAG pipelines","role":"agent","link":"#orchestration-frameworks"},
{"id":"agentsdk","label":"Agent SDKs","sub":"a packaged harness: loop, tools, context, permissions","role":"tool","link":"#provider-agent-sdks"},
{"id":"api","label":"Provider APIs and SDKs","sub":"messages, tools, streaming, caching","role":"model","link":"#model-apis"}]}
```

## How it works
**Provider APIs and SDKs.** Each model provider’s API and client libraries: messages, tool calling, streaming, structured outputs, caching, batch. Maximum control and the least magic. See [model APIs](#model-apis).

**Agent SDKs.** Libraries that package a working agent harness, such as the Claude Agent SDK, the OpenAI Agents SDK and Google’s Agent Development Kit: the loop, tool execution, context management, handoffs or subagents, guardrails and tracing. See [provider and agent SDKs](#provider-agent-sdks).

**Orchestration frameworks.** General frameworks for building workflows, graphs, RAG pipelines and multi-agent systems across providers: LangGraph and LangChain, LlamaIndex, CrewAI, Microsoft’s Agent Framework (the successor to AutoGen and Semantic Kernel), Pydantic AI, Mastra and the Vercel AI SDK in TypeScript, Haystack, DSPy, smolagents and others. See [orchestration frameworks](#orchestration-frameworks).

**Low-code builders.** Visual tools such as n8n, Zapier, Make, Dify, Flowise, Langflow and Microsoft Copilot Studio, for workflows assembled from blocks. See [low-code builders](#low-code-builders).

**Alongside every layer.** Model gateways and routers, eval and observability platforms, vector stores, sandboxes and MCP servers. See [gateways](#gateways-routers) and [eval tooling](#eval-tooling).

**What stays portable.** Prompts, tool definitions, MCP servers, eval sets and traces in OpenTelemetry move between frameworks; framework-specific abstractions do not. Invest in the portable parts.

## In practice
```viz
{"id":"layer-chooser","component":"tree","title":"Start at the lowest layer that solves the problem","caption":"Expand the situation closest to yours. Moving up a layer should remove real work, not add a dependency for its own sake.","alt":"Decision tree for choosing between raw APIs, agent SDKs, orchestration frameworks and low-code builders.","data":"illustrative","open":1,"root":{"label":"What are you building?","children":[
{"label":"A few model calls inside an existing app","children":[{"label":"Provider SDK directly, behind a gateway","link":"#model-apis"}]},
{"label":"An agent with tools, files and long tasks","children":[{"label":"An agent SDK, or your own loop if you need full control","link":"#provider-agent-sdks"}]},
{"label":"Branching workflows with durable state and human approvals","children":[{"label":"A graph or workflow framework","link":"#orchestration-frameworks"}]},
{"label":"Business automations owned by non-engineers","children":[{"label":"A low-code builder, with engineering review for risky actions","link":"#low-code-builders"}]},
{"label":"Not sure yet","children":[{"label":"Write the fifty-line loop first; adopt a framework when you feel a specific pain","link":"#agent-loop"}]}]}}
```

## Numbers to know
> [!number]
> Rule of thumb: if you cannot explain what a framework does on each model call, you are not ready to debug it in production. Expect the leading frameworks to change APIs at least yearly.

## Pitfalls and anti-patterns
> [!pitfall] Choosing the framework before the problem
> Frameworks encode opinions about workflows, memory and agents. Adopt one whose opinions match a problem you already have.

- **Stacking layers.** A low-code builder on a framework on an SDK means three places to debug.
- **Framework-specific prompts.** Keep prompts as plain, versioned templates. See [prompt management](#prompt-config-management).
- **No escape hatch.** Make sure you can drop to raw API calls where needed.

## Talk like an expert
The vocabulary: **provider SDK**, **agent SDK**, **orchestration framework**, **graph-based workflow**, **low-code builder**, **abstraction leak**, **portability**. Experts describe their stack by layer and can say which layer handles each concern. The live debate is consolidation: whether agent SDKs from model providers absorb most of what general frameworks offer.

> [!hottake] Most production teams end up with a thin layer of their own code on top of a provider or agent SDK.
> **The counterargument:** for complex, durable, multi-step workflows with human approvals and many integrations, mature orchestration frameworks save months of building checkpointing, retries and state management yourself.

## Check yourself
```quiz
framework-landscape
```

## Go deeper
- Anthropic, “Building effective agents” (December 2024), on starting simple before adopting frameworks.
- The documentation of each framework, read for what happens on every model call.

## Related
- [Provider and agent SDKs](#provider-agent-sdks)
- [Orchestration frameworks](#orchestration-frameworks)
- [Low-code and visual builders](#low-code-builders)
- [Selection guide and matrix](#framework-selection)
- [Framework anti-patterns](#framework-anti-patterns)
- [Agent SDK primitives: runners, tools, guardrails, sessions and tracing](#agent-sdk-primitives)
- [Managed agent platforms and hosted harnesses](#managed-agent-platforms)
