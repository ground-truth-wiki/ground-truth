---
id: batching-scheduling
book: 15
order: "15.4"
title: Batching and scheduling
level: expert
stability: moving
reviewed: "2026-11"
status: full
tags: [continuous-batching, pagedattention]
visuals:
  - continuous-batching:stepper
  - radix-cache:graph
---
> [!tldr]
> Serving engines keep GPUs busy by batching requests, and continuous batching adds and removes sequences at every decode step instead of waiting for a whole batch to finish. Chunked prefill, prefix caching and scheduling policies decide who waits, for how long, and how much work is reused.

## Why it matters
Static batching wastes the GPU whenever sequences finish at different times, which is always. Continuous batching was one of the largest practical gains in LLM serving, and the scheduling choices built on it (how to mix long prefills with ongoing decodes, which prefixes to keep cached) still decide latency and cost.

## Intuition
A restaurant that seats a table of four only when four guests arrive together, and clears the table only when all four have finished, wastes seats. A better one seats each guest as soon as any chair frees up.

```viz
{"id":"continuous-batching","component":"stepper","title":"Continuous batching fills each freed slot at the next step instead of waiting for the slowest sequence","caption":"Four batch slots over eight decode steps. Numbers are request ids; 0 means the slot sits idle. Illustrative.","alt":"Stepper comparing static and continuous batching as grids of batch slots over decode steps, with idle slots in static batching filled by new requests in continuous batching.","data":"illustrative","frames":[
{"label":"Static","caption":"Requests 1 to 4 start together. Requests 2, 3 and 4 finish early, but their slots stay idle until request 1 finishes at step 8: 14 of 32 slot-steps wasted.","matrix":{"rows":["Slot 1","Slot 2","Slot 3","Slot 4"],"cols":["t1","t2","t3","t4","t5","t6","t7","t8"],"values":[[1,1,1,1,1,1,1,1],[2,2,2,0,0,0,0,0],[3,3,3,3,3,0,0,0],[4,4,0,0,0,0,0,0]],"min":0,"max":8}},
{"label":"Continuous","caption":"Queued requests 5 to 8 join as soon as a slot frees: request 6 takes slot 4 at step 3, request 5 takes slot 2 at step 4. Only one slot-step is idle.","matrix":{"rows":["Slot 1","Slot 2","Slot 3","Slot 4"],"cols":["t1","t2","t3","t4","t5","t6","t7","t8"],"values":[[1,1,1,1,1,1,1,1],[2,2,2,5,5,5,5,0],[3,3,3,3,3,7,7,7],[4,4,6,6,6,8,8,8]],"min":0,"max":8}},
{"label":"Chunked prefill","caption":"When a new request has a long prompt, its prefill is split into chunks interleaved with other sequences’ decode steps, so running users do not stall while it loads."}]}
```

## How it works
**Static batching.** Group requests, run them together until the longest finishes. Simple, and wasteful when lengths vary.

**Continuous batching.** Also called iteration-level scheduling, introduced by Orca (Yu et al., 2022). At every step the scheduler removes finished sequences and admits waiting ones, so slots are rarely idle. vLLM, SGLang, TensorRT-LLM and Text Generation Inference all do it.

**Paged KV cache.** Allocating KV memory in blocks, as PagedAttention does, lets sequences of any length share memory without fragmentation, which makes continuous batching practical. See [memory math](#memory-math).

**Chunked prefill.** Long prompts are split into chunks processed alongside decode steps, trading a little TTFT for the new request against smooth TPOT for everyone else.

**Prefix caching.** Requests that share a prefix (a system prompt, tool definitions, a long document) can reuse its KV cache. SGLang’s RadixAttention (Zheng et al., 2023) stores cached prefixes in a radix tree and matches new requests against it:

```viz
{"id":"radix-cache","component":"graph","title":"A radix tree shares one copy of every common prefix across requests","caption":"Illustrative. Each node is a cached span of KV; requests reuse every node on their path and compute only what is new. The shared system prompt is computed once for all four requests.","alt":"Tree of cached prefixes: a shared system prompt branching into tool definitions and a document, then into four individual conversations.","data":"illustrative","per_row":4,"node_w":150,"nodes":[{"id":"sys","label":"System prompt"},{"id":"tools","label":"Tool definitions"},{"id":"doc","label":"Shared document"},{"id":"a","label":"Conversation A"},{"id":"b","label":"Conversation B"},{"id":"c","label":"Conversation C"},{"id":"d","label":"Conversation D"}],"edges":[["sys","tools"],["sys","doc"],["tools","a"],["tools","b"],["doc","c"],["doc","d"]]}
```

**Scheduling policies.** First come, first served is simple but lets long requests block short ones. Engines offer priorities, preemption (pausing a sequence and freeing or swapping its KV), fairness across tenants, and limits on tokens per batch. Cache-aware routing sends requests to the replica that already holds their prefix. See [gateways and routers](#gateways-routers).

## In practice
Settings worth tuning on any engine:
- **Maximum concurrent sequences** and **maximum tokens per batch**: the main throughput and latency knobs.
- **Chunked prefill size**: smaller chunks protect TPOT, larger ones favor TTFT.
- **Prefix caching**: on, with stable prompt prefixes. See [prompt caching](#prompt-caching).
- **Priorities and preemption**: interactive traffic ahead of batch jobs.
- **Routing**: prefix-aware load balancing across replicas.

## Numbers to know
> [!number]
> Rules of thumb. Continuous batching commonly raises throughput several times over static batching on real traffic with mixed lengths. Prefix caching can remove most of the prefill cost for requests that share long system prompts or documents.

## Pitfalls and anti-patterns
> [!pitfall] Unstable prompt prefixes
> A timestamp or user id at the top of the system prompt defeats prefix caching for every request.

- **Huge prefills without chunking.** They stall every running stream.
- **No priority between interactive and batch traffic.** Background jobs ruin chat latency.
- **Random load balancing.** Requests miss the replica that has their prefix cached.

## Talk like an expert
The vocabulary: **static batching**, **continuous** or **iteration-level batching**, **paged attention**, **chunked prefill**, **prefix caching**, **RadixAttention**, **preemption**, **cache-aware routing**. Experts tune max-batch-tokens and chunk sizes against SLOs, not defaults. The live debate is how scheduling should change for agent workloads, where one long session makes many dependent requests with growing shared prefixes.

> [!hottake] Prefix caching is now more important than raw kernel speed for agent workloads.
> **The counterargument:** caching only helps when prefixes repeat and stay resident; for diverse traffic with unique long prompts, fast prefill kernels and enough hardware still dominate.

## Check yourself
```quiz
batching-scheduling
```

## Go deeper
- Yu et al., “Orca: A Distributed Serving System for Transformer-Based Generative Models” (2022).
- Kwon et al., “PagedAttention” (2023); Zheng et al., “SGLang: Efficient Execution of Structured Language Model Programs” (2023).
- Agrawal et al., “Sarathi-Serve” (2024), on chunked prefills.

## Related
- [Memory math](#memory-math)
- [Prompt caching](#prompt-caching)
- [Serving engines](#serving-engines)
- [Latency and throughput](#latency-throughput)
- [Disaggregated serving](#disaggregated-serving)
