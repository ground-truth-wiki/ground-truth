---
id: reference-architecture
book: 16
order: "16.1"
title: Reference architecture
level: practitioner
stability: evergreen
reviewed: "2026-11"
status: full
tags: [architecture, gateway, llmops]
visuals:
  - ref-arch:diagram
  - build-buy:tree
---
> [!tldr]
> A production AI application has the same backbone almost everywhere: an API gateway, an orchestration layer for prompts, workflows and agents, retrieval and tool services, a model gateway that routes to providers, state and memory stores, safety checks, and observability with evals running across all of it. Build the parts that differentiate you; buy or adopt the rest.

## Why it matters
Teams that start from a demo bolt production concerns on one by one: rate limits after the first abuse, fallbacks after the first outage, tracing after the first unexplainable bug. Starting from a reference architecture puts each concern in its place from day one and makes it obvious which component owns which problem.

## Intuition
A reference architecture is the floor plan every restaurant shares: front door, host stand, kitchen, pantry, suppliers, and the manager’s office with the books. Menus differ; the plan rarely does.

```viz
{"id":"ref-arch","component":"diagram","title":"Nine components, one backbone: the orchestrator in the middle, gateways at both edges, observability everywhere","caption":"Click a component for the chapter that covers it. Dashed arrows are side channels for checks and telemetry.","alt":"Reference architecture: clients, an API gateway, safety checks, an orchestrator connected to retrieval, tools, memory and a model gateway that routes to model providers, with observability and evals underneath.","data":"illustrative","w":600,"h":340,"nodes":[
{"id":"clients","label":"Clients","sub":"web, mobile, API","role":"human","x":0,"y":0,"w":170,"h":52},
{"id":"gw","label":"API gateway","sub":"auth, rate limits, tenancy","role":"agent","x":215,"y":0,"w":170,"h":52,"link":"#enterprise-readiness"},
{"id":"safety","label":"Safety and policy","sub":"input and output checks","role":"tool","x":430,"y":0,"w":170,"h":52,"link":"#guardrails-control"},
{"id":"ret","label":"Retrieval","sub":"indexes, rerankers","role":"data","x":0,"y":104,"w":170,"h":52,"link":"#production-rag"},
{"id":"orch","label":"Orchestrator","sub":"prompts, workflows, agents","role":"agent","x":215,"y":104,"w":170,"h":52,"link":"#agent-loop"},
{"id":"tools","label":"Tools and MCP","sub":"integrations","role":"tool","x":430,"y":104,"w":170,"h":52,"link":"#mcp-architecture"},
{"id":"mem","label":"State and memory","sub":"sessions, memory, files","role":"data","x":0,"y":208,"w":170,"h":52,"link":"#agent-memory"},
{"id":"mgw","label":"Model gateway","sub":"routing, fallbacks, caching","role":"agent","x":215,"y":208,"w":170,"h":52,"link":"#gateways-routers"},
{"id":"models","label":"Models","sub":"APIs and self-hosted","role":"model","x":430,"y":208,"w":170,"h":52,"link":"#serving-engines"},
{"id":"obs","label":"Observability and evals","sub":"traces, metrics, cost, audit, online evals","role":"data","x":0,"y":292,"w":600,"h":46,"link":"#observability-tracing"}],
"edges":[{"from":"clients","to":"gw"},{"from":"gw","to":"orch"},{"from":"gw","to":"safety","style":"dashed"},{"from":"orch","to":"ret","both":true},{"from":"orch","to":"tools","both":true},{"from":"orch","to":"mem","both":true},{"from":"orch","to":"mgw"},{"from":"mgw","to":"models"},{"from":"orch","to":"obs","style":"dashed"}]}
```

## How it works
**API gateway.** Authentication, tenancy, quotas and rate limits, request validation, and streaming to clients. Usually an existing web gateway with AI-specific limits (tokens per minute, cost per day). See [streaming](#streaming).

**Orchestrator.** Your application logic: prompt templates, workflows, agent loops, tool selection, retries and state. This is where most of your differentiation lives. See [workflow patterns](#workflow-patterns).

**Retrieval services.** Ingestion pipelines, indexes, rerankers and permission filters, often a separate service with its own scaling. See [production RAG](#production-rag).

**Tools and integrations.** Internal APIs and third-party systems exposed as tools or MCP servers, behind least-privilege credentials. See [secure agent design](#secure-agent-design).

**Model gateway.** One interface to many models: provider routing, fallbacks on errors, retries, caching, key management, usage accounting and per-tenant budgets. See [gateways and routers](#gateways-routers).

**State and memory.** Sessions, conversation history, long-term memory, uploaded files and job state for long-running work. See [memory](#agent-memory).

**Safety and policy.** Input and output classifiers, PII handling, content policies and approval workflows, applied at the gateway and inside the orchestrator. See [guardrails](#guardrails-control).

**Observability and evals.** Traces across every hop, cost and latency metrics, audit logs, sampled online evaluation and feedback capture, feeding the offline eval set. See [observability](#observability-tracing) and [the data flywheel](#data-flywheel).

## In practice
```viz
{"id":"build-buy","component":"tree","title":"Build what differentiates you; adopt what is commodity","caption":"Expand a component for the usual choice. Revisit as your scale and needs change.","alt":"Decision tree of build-versus-buy choices for each reference architecture component.","data":"illustrative","open":1,"root":{"label":"Build or buy each component?","children":[
{"label":"Orchestrator","children":[{"label":"Build: your prompts, workflows and agent logic are the product"}]},
{"label":"Model gateway","children":[{"label":"Adopt an open-source or managed gateway; build only custom routing","link":"#gateways-routers"}]},
{"label":"Retrieval","children":[{"label":"Adopt a vector store or search engine; build ingestion and permissions for your data","link":"#vector-databases"}]},
{"label":"Observability and evals","children":[{"label":"Adopt a platform on OpenTelemetry; build your eval cases and graders","link":"#eval-tooling"}]},
{"label":"Safety","children":[{"label":"Adopt classifiers and guard models; build policies and tests for your domain"}]},
{"label":"Serving","children":[{"label":"Use APIs until volume justifies self-hosting","link":"#cost-engineering"}]}]}}
```

Architecture rules that age well:
- **One model gateway.** Never call providers directly from application code.
- **Prompts as versioned config**, not strings in code. See [prompt management](#prompt-config-management).
- **Trace IDs end to end**, from client to model and back.
- **Idempotent, retryable steps** for anything that changes state. See [reliability](#reliability-engineering).
- **Evals in CI** and sampled online. See [CI/CD for AI](#ci-cd-for-ai).

## Numbers to know
> [!number]
> Rules of thumb. Each hop adds latency; keep the critical path to the model as short as possible and run checks in parallel where you can. Most teams need under ten services for a first production AI system.

## Pitfalls and anti-patterns
> [!pitfall] Calling model providers directly from everywhere
> Keys spread, fallbacks get reimplemented badly in every service, and nobody knows what anything costs. Centralize through a gateway.

- **No orchestration boundary.** Prompt logic scattered through business code is untestable.
- **Observability added last.** You need traces most during the first incidents.
- **Building commodity components.** Gateways, tracing and vector stores are rarely where you win.

## Talk like an expert
The vocabulary: **API gateway**, **orchestrator**, **model gateway**, **retrieval service**, **tool layer**, **state store**, **control plane** and **data plane**, **trace propagation**. Experts sketch this backbone in minutes and spend the discussion on the orchestrator and the evals. The live debate is how much of the orchestrator moves into managed agent platforms and harness SDKs.

> [!hottake] The model gateway is the most underrated component in AI architecture.
> **The counterargument:** for a single-provider, single-model product, a gateway adds a hop and a dependency for little benefit; it earns its place once you have several models, providers or tenants.

## Check yourself
```quiz
reference-architecture
```

## Go deeper
- The [system design method](#system-design-method) and [reference architectures](#reference-architectures) chapters.
- Public engineering write-ups of production AI systems, read in [public write-ups](#public-writeups).

## Related
- [The AI engineering stack](#ai-engineering-stack)
- [Gateways and routers](#gateways-routers)
- [Observability and tracing](#observability-tracing)
- [Reliability engineering](#reliability-engineering)
- [System design method](#system-design-method)
- [Pipeline orchestration and processing engines](#data-pipeline-orchestration)
- [Feature stores and training-serving consistency](#feature-stores)
- [MLOps and LLMOps foundations](#mlops-foundations)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Asynchronous and batch AI workloads](#async-batch-workloads)
