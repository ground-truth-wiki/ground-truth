---
id: ai-engineering-stack
book: 0
order: "0.2"
title: The AI engineering stack
level: foundation
stability: moving
reviewed: "2026-11"
status: full
tags: [stack, architecture, overview]
visuals:
  - stack-layers:diagram
  - stack-request:stepper
  - stack-where:tree
---
> [!tldr]
> Every AI product sits on the same eight layers, from silicon to the screen. Learn the stack once and every new tool, paper or outage slots into a layer you already understand, and you will know which layer to blame when something breaks.

## Why it matters
New AI tools arrive weekly. Without a map, each one looks like a revolution. With one, most turn out to be a better component for a layer you already know: a faster serving engine, a new retrieval trick, another agent framework. The map also tells you where to look when quality drops, costs jump or a request hangs, which is most of the job once something is in production.

## Intuition
Think of the stack as a building. Hardware is the foundation, models are the structural frame, inference is the plumbing that moves tokens, context and retrieval are the furniture you arrange in each room, tools and protocols are the doors to the outside world, agents and harnesses are the people who walk around and get things done, evals and observability are the inspectors, and product is the front door your users see.

```viz
{"id":"stack-layers","component":"diagram","title":"Eight layers sit between silicon and your users, and two concerns cut across all of them","caption":"Each layer opens the Book that covers it. Security and operations are not layers: they touch every one, which is why they get a column of their own.","alt":"Layered diagram of the AI engineering stack: product and UX, evals and observability, agents and harnesses, tools and protocols, context and retrieval, inference and serving, models, hardware. Security and LLMOps span all layers.","data":"illustrative","try":"Click a layer to jump to its Book, then come back with the browser’s back button.","w":620,"h":460,"nodes":[
{"id":"product","label":"Product and UX","sub":"interfaces, trust, feedback","role":"human","x":0,"y":0,"w":490,"h":50,"link":"#book-18"},
{"id":"evals","label":"Evals and observability","sub":"error analysis, judges, traces","role":"data","x":0,"y":58,"w":490,"h":50,"link":"#book-14"},
{"id":"agents","label":"Agents and harnesses","sub":"loops, memory, sandboxes","role":"agent","x":0,"y":116,"w":490,"h":50,"link":"#book-9"},
{"id":"tools","label":"Tools and protocols","sub":"function calling, MCP, A2A","role":"tool","x":0,"y":174,"w":490,"h":50,"link":"#book-12"},
{"id":"context","label":"Context and retrieval","sub":"prompts, RAG, memory","role":"context","x":0,"y":232,"w":490,"h":50,"link":"#book-5"},
{"id":"inference","label":"Inference and serving","sub":"batching, caching, quantization","role":"plain","x":0,"y":290,"w":490,"h":50,"link":"#book-15"},
{"id":"models","label":"Models","sub":"pretraining, post-training, choice","role":"model","x":0,"y":348,"w":490,"h":50,"link":"#book-3"},
{"id":"hardware","label":"Hardware","sub":"GPUs, memory bandwidth, interconnect","role":"plain","x":0,"y":406,"w":490,"h":50,"link":"#hardware"},
{"id":"sec","label":"Security\nand safety","sub":"Book 17","align":"center","glyph":false,"x":500,"y":0,"w":120,"h":224,"link":"#book-17"},
{"id":"ops","label":"LLMOps","sub":"Book 16","align":"center","glyph":false,"x":500,"y":232,"w":120,"h":224,"link":"#book-16"}]}
```

## How it works
Read the stack from the bottom up, because each layer’s constraints come from the layers beneath it.

**Hardware.** Accelerators multiply matrices. For generating text, the binding constraint is usually memory bandwidth, not raw arithmetic: every new token reads all the model weights once. That single fact explains most of [inference economics](#inference-fundamentals).

**Models.** A model is a frozen function from a sequence of tokens to a probability distribution over the next token. Everything it knows came from [pretraining](#pretraining-data) and post-training. You mostly choose models rather than build them, so [model choice](#choosing-a-model) is a layer skill.

**Inference and serving.** Serving engines turn the function into an API: they batch requests, cache the [[KV cache]] of shared prefixes, and quantize weights. This layer decides latency and cost per token.

**Context and retrieval.** The model sees only its [[context window]]. Prompts, retrieved documents, conversation history and memory all compete for that space. [Context engineering](#context-engineering) and [RAG](#rag-fundamentals) live here, and this is where most quality problems are solved.

**Tools and protocols.** Tools let the model act: query a database, call an API, run code. Protocols such as [MCP](#mcp-architecture) standardize how tools are described and connected, so one integration works in many applications.

**Agents and harnesses.** An [agent](#agent-loop) is a loop: the model chooses an action, the harness runs it, the result goes back into context, repeat. The [harness](#harness-anatomy) is the software around the model that manages that loop, permissions, memory and sandboxes.

**Evals and observability.** Traces record what happened; [evals](#why-evals) say whether it was good. Without this layer you cannot tell whether a change helped.

**Product and UX.** The interface sets expectations, shows progress, collects feedback and decides how failures feel. A product with a weaker model and honest UX often beats one with a stronger model and none.

```viz
{"id":"stack-request","component":"stepper","title":"One request touches every layer on the way down and again on the way up","caption":"Watch which layer is lit at each step. The trace starts before the model is called, and the quality check happens after the user already has the answer.","alt":"Stepper following a single request from the product layer down to hardware and back up.","data":"illustrative","try":"Press play, then pause on step 6 and ask yourself which layer would fix a slow first token.","diagram":{"w":490,"h":456,"layers":[{"id":"product","label":"Product and UX","role":"human"},{"id":"evals","label":"Evals and observability","role":"data"},{"id":"agents","label":"Agents and harnesses","role":"agent"},{"id":"tools","label":"Tools and protocols","role":"tool"},{"id":"context","label":"Context and retrieval","role":"context"},{"id":"inference","label":"Inference and serving","role":"plain"},{"id":"models","label":"Models","role":"model"},{"id":"hardware","label":"Hardware","role":"plain"}]},
"frames":[
{"label":"Product","highlight":["product"],"caption":"A user types “Summarize my open refund tickets.” The interface shows that work has started and streams progress."},
{"label":"Observability","highlight":["evals"],"caption":"A trace opens. Every step below becomes a span with its own tokens, latency and cost."},
{"label":"Agent","highlight":["agents"],"caption":"The agent loop decides it needs data before it can answer. Its budget allows ten steps."},
{"label":"Tool call","highlight":["tools"],"caption":"It calls a ticket-search tool exposed by an MCP server, with status set to open and the query “refund”."},
{"label":"Context","highlight":["context"],"caption":"Forty tickets come back. The harness trims them to the fields that matter and places them after the instructions."},
{"label":"Inference","highlight":["inference"],"caption":"The serving engine finds the system prompt and tool definitions in its prefix cache, so only the new tokens need prefill."},
{"label":"Model","highlight":["models"],"caption":"The model writes the summary one token at a time, each token conditioned on everything in context."},
{"label":"Hardware","highlight":["hardware"],"caption":"Each new token reads every weight from GPU memory once. That is why decode speed tracks memory bandwidth."},
{"label":"Back up","highlight":["product","evals"],"caption":"Tokens stream to the user. The trace closes with total cost and latency, and one percent of answers are sampled for a quality check."}]}
```

## In practice
Use the stack as a debugging and design checklist. When you design a feature, write one sentence per layer: which model, how it is served, what goes into context, which tools, whether it needs an agent loop, how you will evaluate it, and how the interface handles failure. When something breaks, find the layer first.

```viz
{"id":"stack-where","component":"tree","title":"Most symptoms point to one layer, and it is often not the model","caption":"Expand a symptom to see the layer that usually owns it and where to read more. These are starting points, not verdicts.","alt":"Decision tree mapping common production symptoms to the stack layer that usually causes them.","data":"illustrative","open":1,"root":{"label":"Something is wrong. What do you see?","children":[
{"label":"Answers cite the wrong document","children":[{"label":"Context and retrieval: check recall and reranking","link":"#reranking"}]},
{"label":"The agent repeats the same tool call","children":[{"label":"Agents and harnesses: add loop detection and better errors","link":"#agent-failure-modes"}]},
{"label":"The first token takes eight seconds","children":[{"label":"Inference: prefill cost, queueing or cold caches","link":"#latency-throughput"}]},
{"label":"Costs doubled after a prompt edit","children":[{"label":"Context: the edit broke the prompt cache prefix","link":"#prompt-caching"}]},
{"label":"Output ignores the required format","children":[{"label":"Context: use structured outputs, not pleading","link":"#structured-outputs"}]},
{"label":"A web page told the agent to email secrets","children":[{"label":"Security: indirect prompt injection","link":"#prompt-injection"}]},
{"label":"Users say it got worse, but nobody can show it","children":[{"label":"Evals: start with error analysis","link":"#error-analysis"}]}]}}
```

A useful habit: keep a one-page architecture note per product with one line per layer and the current choice, date and owner. It makes model upgrades and incident reviews dramatically faster.

## Numbers to know
> [!number]
> Rules of thumb, not measurements. A token is about four characters of English. Generating each token reads the full set of weights once, so a 70-billion-parameter model in 16-bit precision moves about 140 GB from memory per decoding step, shared across the batch. Tool calls and retrieval often take more wall-clock time than the model itself. See [Numbers every AI engineer should know](#numbers-to-know).

## Pitfalls and anti-patterns
> [!pitfall] Blaming the model first
> Swapping models is the most expensive fix and often the wrong one. Most regressions trace to context, retrieval or tool changes.

- **Skipping the eval layer.** Without it, every change is a guess and every debate is about vibes.
- **Treating security as a layer.** It is a concern that cuts through all of them; an agent with tools inherits every layer’s attack surface.
- **Framework-first design.** Choosing a framework before you can write one sentence per layer tends to hide the decisions that matter.

## Talk like an expert
Experts name the layer before the tool: “that’s a retrieval problem, not a model problem.” They separate **capability** (can the model do it at all?) from **reliability** (does the system do it every time?), and treat the [harness](#what-is-a-harness) as part of the product. The live debate is how much of the stack will be absorbed into models themselves: better long context squeezes retrieval, and better agentic training squeezes harness logic.

> [!hottake] Most AI engineering problems are context problems wearing a model costume.
> **The counterargument:** sometimes the model really is the bottleneck. Gaps in long-horizon reasoning or deep domain knowledge need a stronger model or a fine-tune, and no amount of context arranging will close them.

## Check yourself
```quiz
ai-engineering-stack
```

## Go deeper
- Anthropic, “Building effective agents” (December 2024), an essay on composing models, tools and workflows. Search for the title on anthropic.com.
- Chip Huyen, *AI Engineering* (O’Reilly, 2025), a book-length treatment of building on foundation models.
- This Bible’s [Reference architecture](#reference-architecture) chapter turns the stack into a deployable diagram.

## Related
- [What an AI engineer is](#ai-engineer-role)
- [Mental models that matter](#mental-models)
- [Inference fundamentals](#inference-fundamentals)
- [Context engineering](#context-engineering)
- [The agent loop](#agent-loop)
- [Why evals are the core skill](#why-evals)
