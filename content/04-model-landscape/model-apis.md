---
id: model-apis
book: 4
order: "4.7"
title: Model APIs in practice
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [api, streaming, tool-calling, caching]
visuals:
  - api-anatomy:sequence
  - api-features:tree
---
> [!tldr]
> Model APIs share a common shape: a request with a system prompt, a list of messages, tool definitions and sampling settings; a response with content blocks, a stop reason and token usage. Around that core sit streaming, structured outputs, caching, batch processing, files, citations and rate limits, which differ by provider.

## Why it matters
Every AI feature is built on these calls. Knowing the anatomy lets you switch providers, debug failures, read usage correctly and use the cost-saving features that providers offer but do not turn on by default.

## Intuition
An API call is a letter with attachments: instructions on top, the conversation so far, a list of tools the reader may use, and a note about how to reply. The reply comes back with the answer, the reason the writer stopped, and a bill.

```viz
{"id":"api-anatomy","component":"sequence","title":"One request, one response: the parts every model API shares","caption":"A simplified Messages-style exchange with a tool call. Field names follow Anthropic’s API; other providers use similar structures with different names.","alt":"Sequence diagram of a model API request with system prompt, messages, tools and settings, and a response with content blocks, stop reason and usage.","data":"illustrative","depicts":"Anthropic Messages API, simplified","actors":[{"id":"app","label":"Your app","role":"agent"},{"id":"api","label":"Model API","role":"model"}],
"messages":[
{"from":"app","to":"api","label":"POST /v1/messages","payload":{"model":"model-id","max_tokens":1024,"system":"You are a support assistant for Acme.","tools":[{"name":"lookup_order","description":"Look up an order by id.","input_schema":{"type":"object","properties":{"order_id":{"type":"string"}},"required":["order_id"]}}],"messages":[{"role":"user","content":"Where is order 2291?"}]},"note":"System prompt, conversation, tools and settings."},
{"from":"api","to":"app","label":"tool_use","kind":"response","payload":{"content":[{"type":"tool_use","id":"toolu_01","name":"lookup_order","input":{"order_id":"2291"}}],"stop_reason":"tool_use","usage":{"input_tokens":412,"output_tokens":38}},"note":"The stop reason tells your loop to run the tool."},
{"from":"app","to":"api","label":"tool_result","payload":{"messages":["…previous messages…",{"role":"user","content":[{"type":"tool_result","tool_use_id":"toolu_01","content":"Shipped 1 Nov, arriving 4 Nov."}]}]}},
{"from":"api","to":"app","label":"final answer","kind":"response","payload":{"content":[{"type":"text","text":"Order 2291 shipped on 1 November and should arrive on 4 November."}],"stop_reason":"end_turn","usage":{"input_tokens":470,"output_tokens":21}}}]}
```

## How it works
**Request.** Model id, system prompt, messages (user and assistant turns, which can include images, documents and tool results), tool definitions, sampling settings, maximum output tokens, and feature flags such as thinking or structured output.

**Response.** Content blocks (text, tool calls, thinking), a stop reason (finished, tool use, length limit, refusal), and usage by token type. Stateless APIs need the full history on every call; some providers also offer stateful conversation or response APIs.

```viz
{"id":"api-features","component":"tree","title":"Eight features around the core call worth knowing on every provider","caption":"Expand a feature for what it does and where Ground Truth covers it. Names and availability differ by provider.","alt":"Tree of model API features: streaming, tool use, structured outputs, prompt caching, batch, files, citations and rate limits.","data":"illustrative","open":1,"root":{"label":"API features","children":[
{"label":"Streaming","children":[{"label":"Server-Sent Events with typed deltas","link":"#streaming"}]},
{"label":"Tool use","children":[{"label":"Tool definitions, tool calls, results; forced tool choice","link":"#agent-tools"}]},
{"label":"Structured outputs","children":[{"label":"JSON mode or schema-constrained output","link":"#structured-outputs"}]},
{"label":"Prompt caching","children":[{"label":"Cheaper, faster repeated prefixes","link":"#prompt-caching"}]},
{"label":"Batch processing","children":[{"label":"Asynchronous jobs at a discount","link":"#cost-engineering"}]},
{"label":"Files and documents","children":[{"label":"Upload once, reference in many calls"}]},
{"label":"Citations and search","children":[{"label":"Grounded answers with source spans","link":"#grounding-citations"}]},
{"label":"Rate limits and errors","children":[{"label":"Per-minute token and request limits, retryable errors","link":"#reliability-engineering"}]}]}}
```

**Compatibility layers.** Many providers and engines offer OpenAI-compatible endpoints; gateways translate between formats. Translation is rarely perfect for tools, caching or thinking. See [gateways and routers](#gateways-routers).

**Usage accounting.** Responses report input, cached input, output and reasoning tokens separately; log them per request for cost attribution. See [cost and capacity](#cost-capacity).

## In practice
- Use official SDKs for retries, streaming helpers and types.
- Always set maximum output tokens and handle every stop reason, including length limits.
- Log request ids, model versions, stop reasons and usage on every call.
- Turn on caching and batch processing where they fit; they are often the largest savings.

## Numbers to know
> [!number]
> Rules of thumb. Rate limits are set per organization, model and token type; plan headroom for peaks. Every call resends the full context unless the provider manages state for you, so long conversations grow in cost per turn.

## Pitfalls and anti-patterns
> [!pitfall] Ignoring the stop reason
> A response cut off by the token limit looks like a finished answer unless you check why it stopped.

- **Assuming compatibility layers are complete.** Tools, caching and thinking often differ.
- **Not logging usage by type.** Cached and reasoning tokens change costs substantially.

## Talk like an expert
The vocabulary: **system prompt**, **messages**, **content blocks**, **tool definitions**, **stop reason**, **usage**, **max tokens**, **stateless API**, **OpenAI-compatible**, **rate limit tiers**. Experts read the raw request and response before debugging anything else. The live debate is whether APIs move toward stateful, server-managed agents or stay as stateless building blocks.

> [!hottake] Most teams use less than half of the API features that would save them money.
> **The counterargument:** each feature (caching, batch, files, stateful responses) adds provider-specific code and lock-in; using fewer features keeps switching cheap.

## Check yourself
```quiz
model-apis
```

## Go deeper
- Your providers’ API references and changelogs, for exact fields and features.
- The [agent loop](#agent-loop) chapter for building on the core call.

## Related
- [The agent loop](#agent-loop)
- [Streaming](#streaming)
- [Prompt caching](#prompt-caching)
- [Gateways and routers](#gateways-routers)
- [Tool use and tool design](#agent-tools)
- [Model types: base, instruct, reasoning and omni](#model-types)
- [Web search and hosted retrieval services](#web-search-hosted-retrieval)
- [Data formats for AI datasets](#data-formats)
- [Rate limits, quotas and overload control](#rate-limits-overload)

## Deep dives

Optional depth on this chapter’s topics, for readers who need it:

- [Chat Completions, Responses and Messages](#api-shapes)
- [Cloud AI platforms and inference providers](#cloud-ai-platforms)
